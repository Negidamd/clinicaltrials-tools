"use client";

import { useState } from "react";
import { PricingCard } from "@/components/shared/PricingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "For individual researchers and students",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "5 core calculators",
      "20 calculations/month",
      "3 PDF exports/month (watermarked)",
      "1 saved project",
      "Community support",
    ],
    ctaText: "Get Started Free",
    ctaHref: "/register",
  },
  {
    name: "Pro",
    description: "For PIs and research teams",
    priceMonthly: 49,
    priceAnnual: 490,
    features: [
      "All 12+ calculators",
      "Unlimited calculations",
      "Unlimited clean PDF exports",
      "Unlimited projects",
      "AI Design Advisor",
      "Sensitivity analysis",
      "Priority support",
    ],
    highlighted: true,
    badge: "Most Popular",
    ctaText: "Start Pro Trial",
    ctaHref: "/register?plan=pro",
  },
  {
    name: "Team",
    description: "For departments and CROs",
    priceMonthly: 149,
    priceAnnual: 1490,
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Shared project workspace",
      "Custom report branding",
      "Admin dashboard",
      "Dedicated support",
    ],
    ctaText: "Start Team Trial",
    ctaHref: "/register?plan=team",
  },
  {
    name: "Enterprise",
    description: "For pharma and large organizations",
    priceMonthly: null,
    priceAnnual: null,
    features: [
      "Everything in Team",
      "Unlimited seats",
      "SSO / SAML",
      "Audit logging",
      "Custom integrations",
      "On-premise option",
    ],
    ctaText: "Contact Sales",
    ctaHref: "/about#contact",
  },
];

const comparisonFeatures = [
  { name: "Core calculators (t-test, proportions, survival)", free: true, pro: true, team: true, enterprise: true },
  { name: "Advanced calculators (NI, cluster, crossover)", free: false, pro: true, team: true, enterprise: true },
  { name: "Calculations per month", free: "20", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  { name: "PDF report exports", free: "3 (watermarked)", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  { name: "Saved projects", free: "1", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  { name: "AI Design Advisor", free: false, pro: true, team: true, enterprise: true },
  { name: "Power curves", free: true, pro: true, team: true, enterprise: true },
  { name: "Sensitivity analysis", free: false, pro: true, team: true, enterprise: true },
  { name: "Custom branding on reports", free: false, pro: false, team: true, enterprise: true },
  { name: "Team collaboration", free: false, pro: false, team: "5 seats", enterprise: "Unlimited" },
  { name: "SSO / SAML", free: false, pro: false, team: false, enterprise: true },
  { name: "Priority support", free: false, pro: true, team: true, enterprise: true },
  { name: "Dedicated account manager", free: false, pro: false, team: false, enterprise: true },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no long-term contracts.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !isAnnual ? "bg-white shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isAnnual ? "bg-white shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              Annual <span className="text-[#10B981] ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start mb-20">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2
            className="text-2xl font-bold text-center text-[#1B2A4A] mb-8"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="py-3 text-center font-medium">Free</th>
                  <th className="py-3 text-center font-medium text-[#0D7377]">Pro</th>
                  <th className="py-3 text-center font-medium">Team</th>
                  <th className="py-3 text-center font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f) => (
                  <tr key={f.name} className="border-b">
                    <td className="py-3 text-muted-foreground">{f.name}</td>
                    {[f.free, f.pro, f.team, f.enterprise].map((val, i) => (
                      <td key={i} className="py-3 text-center">
                        {val === true ? (
                          <Check className="h-4 w-4 mx-auto text-[#10B981]" />
                        ) : val === false ? (
                          <X className="h-4 w-4 mx-auto text-slate-300" />
                        ) : (
                          <span className="font-medium">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
