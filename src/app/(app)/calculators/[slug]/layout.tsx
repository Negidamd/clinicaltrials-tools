import type { Metadata } from "next";
import { getCalculatorMeta } from "@/lib/calculator-registry";
import { APP_NAME, APP_URL } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Dynamic SEO metadata for individual calculator pages
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCalculatorMeta(slug);

  // Fallback if the slug doesn't match a known calculator
  if (!meta) {
    return {
      title: "Calculator Not Found",
      description: "The requested calculator could not be found.",
    };
  }

  const title = meta.seoTitle || `${meta.name} | ${APP_NAME}`;
  const description =
    meta.seoDescription || meta.longDescription || meta.shortDescription;

  return {
    title: meta.name,
    description,
    keywords: [
      ...meta.tags,
      "sample size calculator",
      "clinical trial",
      "power analysis",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${APP_URL}/calculators/${slug}`,
      siteName: APP_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${APP_URL}/calculators/${slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Layout component (pass-through)
// ---------------------------------------------------------------------------

export default function CalculatorSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
