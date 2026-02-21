"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CalculatorCardProps {
  /** URL-safe slug used for routing, e.g. "two-sample-ttest". */
  slug: string;
  /** Human-readable calculator name. */
  name: string;
  /** Brief one-liner describing the calculator. */
  shortDescription: string;
  /** Display category label, e.g. "Comparing Means". */
  category: string;
  /** Subscription tier required to access the calculator. */
  tier: "free" | "pro";
  /** Whether this calculator is flagged as popular. */
  isPopular?: boolean;
  /** Searchable tags (displayed as small pills). */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalculatorCard({
  slug,
  name,
  shortDescription,
  category,
  tier,
  isPopular = false,
  tags = [],
}: CalculatorCardProps) {
  return (
    <Link href={`/calculators/${slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:border-[#0D7377]/30 group-hover:scale-[1.02] cursor-pointer">
        <CardContent className="pt-6 flex flex-col h-full">
          {/* Header: name + badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-[#1B2A4A] leading-tight">
              {name}
            </h3>
            <div className="flex shrink-0 gap-1.5">
              {isPopular && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 text-[10px]"
                >
                  <Star className="h-3 w-3 mr-0.5 fill-amber-400" />
                  Popular
                </Badge>
              )}
              <Badge
                variant="secondary"
                className={
                  tier === "free"
                    ? "bg-[#E6F7F7] text-[#0D7377] text-[10px]"
                    : "bg-[#FFF1F0] text-[#E05A47] text-[10px]"
                }
              >
                {tier === "free" ? "Free" : "Pro"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground flex-1">
            {shortDescription}
          </p>

          {/* Tags (show first 3 to keep cards compact) */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] font-normal"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer: category + arrow */}
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {category}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
