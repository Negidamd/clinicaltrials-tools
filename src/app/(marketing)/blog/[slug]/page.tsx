import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="py-20">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>

        <Badge className="bg-[#E6F7F7] text-[#0D7377] mb-4">Guide</Badge>

        <h1
          className="text-3xl font-bold text-[#1B2A4A] mb-4"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          {slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span>ClinicalTrials.Tools Team</span>
          <span>&#8226;</span>
          <span>10 min read</span>
        </div>

        <div className="prose prose-slate max-w-none">
          <p>
            This article is coming soon. We&apos;re working on creating comprehensive, peer-reviewed
            content to help you design better clinical trials.
          </p>
          <p>
            In the meantime, explore our{" "}
            <Link href="/calculators" className="text-[#0D7377] hover:underline">
              sample size calculators
            </Link>{" "}
            or try the{" "}
            <Link href="/design-advisor" className="text-[#0D7377] hover:underline">
              AI Design Advisor
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 rounded-lg bg-[#E6F7F7] p-6 text-center">
          <h3
            className="text-lg font-semibold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Ready to calculate your sample size?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try our free, validated calculators — no sign-up required.
          </p>
          <Button className="mt-4 bg-[#0D7377] hover:bg-[#0a5c5f]" asChild>
            <Link href="/calculators">Go to Calculators</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
