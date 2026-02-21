"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  description: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  ctaHref: string;
  isAnnual: boolean;
}

export function PricingCard({
  name,
  description,
  priceMonthly,
  priceAnnual,
  features,
  highlighted = false,
  badge,
  ctaText,
  ctaHref,
  isAnnual,
}: PricingCardProps) {
  const price = isAnnual ? priceAnnual : priceMonthly;
  const period = isAnnual ? "/year" : "/month";

  return (
    <Card
      className={`relative flex flex-col ${
        highlighted
          ? "border-2 border-[#0D7377] shadow-lg shadow-[#0D7377]/10 scale-105"
          : "border"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-[#0D7377] text-white px-3 py-1">{badge}</Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl" style={{ fontFamily: "var(--font-heading-custom)" }}>
          {name}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          {price !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-heading-custom)" }}>
                ${price}
              </span>
              <span className="text-muted-foreground">{period}</span>
            </div>
          ) : (
            <div className="text-4xl font-bold" style={{ fontFamily: "var(--font-heading-custom)" }}>
              Custom
            </div>
          )}
          {isAnnual && priceMonthly && priceAnnual && (
            <p className="mt-1 text-sm text-[#10B981]">
              Save ${priceMonthly * 12 - priceAnnual}/year
            </p>
          )}
        </div>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#0D7377]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${highlighted ? "bg-[#0D7377] hover:bg-[#0a5c5f]" : ""}`}
          variant={highlighted ? "default" : "outline"}
          asChild
        >
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
