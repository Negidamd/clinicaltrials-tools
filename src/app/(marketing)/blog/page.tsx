import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
  {
    slug: "complete-guide-sample-size-calculation",
    title: "The Complete Guide to Sample Size Calculation for Clinical Trials",
    excerpt: "Everything you need to know about determining the right sample size for your clinical trial, from choosing parameters to handling dropouts.",
    category: "Sample Size",
    date: "2025-01-15",
    readTime: "12 min read",
  },
  {
    slug: "non-inferiority-margin-selection",
    title: "Non-Inferiority Trials: How to Choose Your Margin",
    excerpt: "A practical guide to selecting and justifying the non-inferiority margin, with examples from regulatory submissions.",
    category: "Trial Design",
    date: "2025-01-10",
    readTime: "10 min read",
  },
  {
    slug: "cluster-randomized-trials-design",
    title: "Cluster Randomized Trials: Design, Analysis, and Sample Size",
    excerpt: "How to properly design and power a cluster randomized trial, including ICC estimation and variable cluster sizes.",
    category: "Statistics",
    date: "2025-01-05",
    readTime: "15 min read",
  },
  {
    slug: "adaptive-trial-designs",
    title: "Adaptive Trial Designs: When and How to Use Them",
    excerpt: "An overview of adaptive designs including group sequential, sample size re-estimation, and response-adaptive randomization.",
    category: "Trial Design",
    date: "2024-12-20",
    readTime: "11 min read",
  },
  {
    slug: "understanding-power-analysis",
    title: "Understanding Power Analysis: Why 80% Isn't Always Enough",
    excerpt: "When to use 80% vs 90% power, how to interpret power curves, and common pitfalls in power analysis.",
    category: "Statistics",
    date: "2024-12-15",
    readTime: "8 min read",
  },
  {
    slug: "ich-e9-estimand-framework",
    title: "ICH E9(R1) Estimand Framework: A Practical Guide",
    excerpt: "How the estimand framework changes the way we think about trial design, endpoints, and statistical analysis.",
    category: "Regulatory",
    date: "2024-12-10",
    readTime: "14 min read",
  },
  {
    slug: "survival-endpoints-log-rank-cox",
    title: "Sample Size for Survival Endpoints: Log-Rank vs Cox",
    excerpt: "Comparing methods for calculating sample size for time-to-event endpoints, including Schoenfeld, Freedman, and Lakatos.",
    category: "Sample Size",
    date: "2024-12-05",
    readTime: "9 min read",
  },
  {
    slug: "equivalence-vs-non-inferiority",
    title: "Equivalence vs Non-Inferiority: What's the Difference?",
    excerpt: "A clear explanation of the difference between equivalence and non-inferiority designs, with guidance on when to use each.",
    category: "Trial Design",
    date: "2024-11-30",
    readTime: "7 min read",
  },
  {
    slug: "common-mistakes-sample-size",
    title: "10 Common Mistakes in Clinical Trial Sample Size Calculations",
    excerpt: "Avoid these frequent errors that lead to underpowered or unnecessarily large trials.",
    category: "Statistics",
    date: "2024-11-25",
    readTime: "10 min read",
  },
  {
    slug: "free-vs-paid-calculators",
    title: "Free vs Paid Sample Size Calculators: What You're Missing",
    excerpt: "A comparison of free online calculators, commercial software, and what features actually matter for your research.",
    category: "Tutorials",
    date: "2024-11-20",
    readTime: "6 min read",
  },
];

const categoryColors: Record<string, string> = {
  "Sample Size": "bg-[#E6F7F7] text-[#0D7377]",
  "Trial Design": "bg-blue-50 text-blue-700",
  Statistics: "bg-purple-50 text-purple-700",
  Regulatory: "bg-amber-50 text-amber-700",
  Tutorials: "bg-green-50 text-green-700",
};

export default function BlogPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Guides, tutorials, and insights on clinical trial design and biostatistics.
          </p>
        </div>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={categoryColors[post.category] || "bg-slate-100"}>
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">{post.title}</h2>
                      <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
