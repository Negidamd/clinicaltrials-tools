import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { subscription: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          subscriptionTier: user.subscription?.tier ?? "FREE",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    {
      id: "orcid",
      name: "ORCID",
      type: "oauth",
      wellKnown: "https://orcid.org/.well-known/openid-configuration",
      clientId: process.env.ORCID_CLIENT_ID!,
      clientSecret: process.env.ORCID_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid /read-limited",
        },
      },
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.given_name ?? null,
          email: profile.email ?? null,
          image: null,
          orcid: profile.sub,
        };
      },
    },
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        const u = user as unknown as { role?: string; subscriptionTier?: string };
        token.role = u.role ?? null;
        token.subscriptionTier = u.subscriptionTier ?? "FREE";
      }

      // On ORCID sign-in, store the ORCID iD on the user record
      if (account?.provider === "orcid" && token.id) {
        await prisma.user.update({
          where: { id: token.id as string },
          data: { orcid: account.providerAccountId },
        });
      }

      // Refresh subscription tier from database periodically
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { subscription: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionTier = dbUser.subscription?.tier ?? "FREE";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null;
        session.user.subscriptionTier =
          (token.subscriptionTier as string) ?? "FREE";
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Create a default FREE subscription for new users
      await prisma.subscription.create({
        data: {
          userId: user.id,
          tier: "FREE",
          status: "ACTIVE",
        },
      });
    },
  },
};
