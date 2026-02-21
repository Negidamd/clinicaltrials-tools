import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        calculationsThisMonth: true,
        aiQueriesThisMonth: true,
        lastUsageReset: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Reset counters if we've crossed into a new month
    const now = new Date();
    const resetDate = user.lastUsageReset;
    const isSameMonth =
      resetDate.getFullYear() === now.getFullYear() &&
      resetDate.getMonth() === now.getMonth();

    let calculationsUsed = user.calculationsThisMonth;
    let aiQueriesUsed = user.aiQueriesThisMonth;

    if (!isSameMonth) {
      // Reset counters in the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          calculationsThisMonth: 0,
          aiQueriesThisMonth: 0,
          lastUsageReset: now,
        },
      });

      calculationsUsed = 0;
      aiQueriesUsed = 0;
    }

    // Determine the effective tier
    const tier: SubscriptionTier =
      user.subscription?.status === "ACTIVE" ||
      user.subscription?.status === "TRIALING"
        ? (user.subscription.tier as SubscriptionTier)
        : "FREE";

    const limits = TIER_LIMITS[tier];

    // Build the current month string
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const month = `${yyyy}-${mm}`;

    return NextResponse.json({
      tier,
      subscription: user.subscription
        ? {
            id: user.subscription.id,
            userId: user.subscription.userId,
            tier: user.subscription.tier,
            status: user.subscription.status,
            stripeSubscriptionId: user.subscription.stripeSubscriptionId,
            stripeCustomerId: user.subscription.stripeCustomerId,
            stripePriceId: user.subscription.stripePriceId,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
            createdAt: user.subscription.createdAt,
            updatedAt: user.subscription.updatedAt,
          }
        : null,
      usage: {
        userId: user.id,
        month,
        calculationsUsed,
        aiQueriesUsed,
      },
      limits,
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}
