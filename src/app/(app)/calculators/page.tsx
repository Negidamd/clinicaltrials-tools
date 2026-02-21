"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Star } from "lucide-react";

interface CalculatorEntry {
  slug: string;
  name: string;
  description: string;
  category: string;
  tier: "free" | "pro";
  isPopular: boolean;
}

const calculators: CalculatorEntry[] = [
  {
    slug: "two-sample-ttest",
    name: "Two-Sample T-Test",
    description: "Compare means between two independent groups with equal or unequal variances.",
    category: "Comparing Means",
    tier: "free",
    isPopular: true,
  },
  {
    slug: "two-proportions",
    name: "Two Proportions (Chi-Square)",
    description: "Compare proportions between two independent groups using chi-square or Fisher's exact test.",
    category: "Comparing Proportions",
    tier: "free",
    isPopular: true,
  },
  {
    slug: "paired-ttest",
    name: "Paired T-Test",
    description: "Compare paired or matched observations (before/after, crossover first period).",
    category: "Comparing Means",
    tier: "free",
    isPopular: false,
  },
  {
    slug: "one-proportion",
    name: "One-Sample Proportion",
    description: "Test a single proportion against a known or hypothesized value.",
    category: "Comparing Proportions",
    tier: "free",
    isPopular: false,
  },
  {
    slug: "log-rank-test",
    name: "Log-Rank Test (Survival)",
    description: "Compare survival curves between two groups using Schoenfeld or Freedman methods.",
    category: "Survival Analysis",
    tier: "free",
    isPopular: true,
  },
  {
    slug: "non-inferiority-means",
    name: "Non-Inferiority (Means)",
    description: "Demonstrate that a new treatment is not worse than standard by a pre-specified margin.",
    category: "Equivalence & Non-Inferiority",
    tier: "pro",
    isPopular: true,
  },
  {
    slug: "non-inferiority-proportions",
    name: "Non-Inferiority (Proportions)",
    description: "Non-inferiority test for binary outcomes using Farrington-Manning method.",
    category: "Equivalence & Non-Inferiority",
    tier: "pro",
    isPopular: false,
  },
  {
    slug: "one-way-anova",
    name: "One-Way ANOVA",
    description: "Compare means across three or more independent groups using F-test.",
    category: "Comparing Means",
    tier: "pro",
    isPopular: false,
  },
  {
    slug: "correlation",
    name: "Correlation (Pearson)",
    description: "Test whether a correlation coefficient is significantly different from zero or another value.",
    category: "Comparing Means",
    tier: "pro",
    isPopular: false,
  },
  {
    slug: "cluster-rct",
    name: "Cluster Randomized Trial",
    description: "Account for intracluster correlation in group-randomized designs (schools, clinics).",
    category: "Complex Designs",
    tier: "pro",
    isPopular: true,
  },
  {
    slug: "crossover-2x2",
    name: "2×2 Crossover Design",
    description: "Two-period crossover where each subject receives both treatments sequentially.",
    category: "Complex Designs",
    tier: "pro",
    isPopular: false,
  },
  {
    slug: "mcnemar-test",
    name: "McNemar's Test",
    description: "Compare paired proportions (matched case-control, before/after binary outcomes).",
    category: "Comparing Proportions",
    tier: "pro",
    isPopular: false,
  },
];

const categories = [
  "All",
  "Comparing Means",
  "Comparing Proportions",
  "Survival Analysis",
  "Equivalence & Non-Inferiority",
  "Complex Designs",
];

export default function CalculatorsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = calculators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1B2A4A]"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          Sample Size Calculators
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose a calculator to determine the required sample size for your study.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search calculators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? "bg-[#0D7377] hover:bg-[#0a5c5f]" : ""}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Calculator grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((calc) => (
          <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
            <Card className="h-full transition-all hover:shadow-md hover:border-[#0D7377]/30 cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#1B2A4A]">{calc.name}</h3>
                  <div className="flex gap-1.5">
                    {calc.isPopular && (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[10px]">
                        <Star className="h-3 w-3 mr-0.5 fill-amber-400" />
                        Popular
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        calc.tier === "free"
                          ? "bg-[#E6F7F7] text-[#0D7377] text-[10px]"
                          : "bg-amber-50 text-amber-700 text-[10px]"
                      }
                    >
                      {calc.tier === "free" ? "Free" : "Pro"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{calc.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {calc.category}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No calculators match your search. Try different keywords.
        </div>
      )}
    </div>
  );
}
