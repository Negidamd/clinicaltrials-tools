"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PricingCard } from "@/components/shared/PricingCard";
import {
  Calculator,
  Sparkles,
  Target,
  BarChart3,
  FileText,
  GraduationCap,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFBFC] via-white to-[#E6F7F7] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 bg-[#E6F7F7] text-[#0D7377] border-[#0D7377]/20">
              Now in Public Beta
            </Badge>
            <h1
              className="text-4xl font-extrabold tracking-tight text-[#1B2A4A] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              Design Better Clinical Trials.{" "}
              <span className="text-[#0D7377]">Faster.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              The all-in-one platform for sample size calculation, trial design, power
              analysis, and statistical planning — trusted by investigators worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="bg-[#0D7377] hover:bg-[#0a5c5f] text-white" asChild>
                <Link href="/calculators">
                  Try Free Calculators <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-[#10B981]" /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-[#10B981]" /> Free forever plan
              </span>
            </div>
          </div>

          {/* Hero visual — stylized power curve */}
          <div className="relative hidden lg:block">
            <div className="rounded-xl border bg-white p-6 shadow-2xl shadow-[#0D7377]/5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Two-Sample T-Test</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading-custom)" }}>
                    N = <span className="text-[#0D7377]">128</span>
                  </p>
                </div>
                <Badge className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
                  Power: 80.4%
                </Badge>
              </div>
              {/* Stylized power curve SVG */}
              <svg viewBox="0 0 400 200" className="w-full h-48">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D7377" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0D7377" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="50" y1="180" x2="380" y2="180" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="50" y1="140" x2="380" y2="140" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="50" y1="100" x2="380" y2="100" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="50" y1="60" x2="380" y2="60" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="50" y1="20" x2="380" y2="20" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="4" />
                {/* 80% power line */}
                <line x1="50" y1="52" x2="380" y2="52" stroke="#FF6B6B" strokeWidth="1" strokeDasharray="6 3" />
                <text x="382" y="56" fontSize="10" fill="#FF6B6B">80%</text>
                {/* Power curve */}
                <path
                  d="M60,175 Q100,170 140,155 T200,110 T260,60 T320,35 T370,25"
                  stroke="#0D7377"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M60,175 Q100,170 140,155 T200,110 T260,60 T320,35 T370,25 L370,180 L60,180 Z"
                  fill="url(#curveGrad)"
                />
                {/* Point at N=128 */}
                <circle cx="252" cy="52" r="5" fill="#0D7377" />
                <circle cx="252" cy="52" r="8" fill="#0D7377" opacity="0.2" />
                {/* Axis labels */}
                <text x="200" y="198" fontSize="11" fill="#6B7280" textAnchor="middle">Sample Size (N)</text>
                <text x="15" y="105" fontSize="11" fill="#6B7280" textAnchor="middle" transform="rotate(-90 15 105)">Power</text>
              </svg>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Effect size: 0.5 SD</span>
                <span>Alpha: 0.05 (two-sided)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SOCIAL PROOF BAR                                                   */
/* ------------------------------------------------------------------ */
function SocialProof() {
  const institutions = ["NIH", "Mayo Clinic", "Johns Hopkins", "UCSF", "Duke", "Pfizer"];

  return (
    <section className="border-y bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Trusted by researchers at leading institutions
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {institutions.map((name) => (
            <div
              key={name}
              className="flex h-10 items-center justify-center rounded bg-slate-100 px-6 text-sm font-semibold text-slate-400"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PROBLEM STATEMENT                                                  */
/* ------------------------------------------------------------------ */
function ProblemStatement() {
  const problems = [
    {
      title: "Expensive Legacy Software",
      description:
        "Enterprise tools like nQuery and PASS cost $1,000+ per year with clunky UIs from the 2000s.",
    },
    {
      title: "Fragmented Free Tools",
      description:
        "Dozens of disconnected web calculators with inconsistent formulas, no validation, and no audit trail.",
    },
    {
      title: "No Guidance for Non-Statisticians",
      description:
        "Investigators are forced to guess parameters without expert guidance on study design.",
    },
  ];

  return (
    <section className="py-20 bg-[#FAFBFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Clinical trial design is broken
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Investigators waste weeks on sample size calculations using outdated tools and fragmented workflows.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem.title} className="border-red-100 bg-red-50/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT OVERVIEW — 6 modules                                       */
/* ------------------------------------------------------------------ */
function ProductOverview() {
  const modules = [
    {
      icon: Calculator,
      title: "Sample Size Calculators",
      description: "12+ validated calculators for t-tests, proportions, survival, cluster RCTs, and more.",
      badge: "Free",
    },
    {
      icon: Sparkles,
      title: "Trial Design Advisor",
      description: "AI-powered recommendations for study design, endpoints, and parameter estimation.",
      badge: "AI",
    },
    {
      icon: Target,
      title: "Endpoint Library",
      description: "Browse common endpoints by therapeutic area with published effect sizes and references.",
      badge: "New",
    },
    {
      icon: BarChart3,
      title: "Power & Sensitivity Analysis",
      description: "Interactive power curves and sensitivity tables to explore your design space.",
      badge: null,
    },
    {
      icon: FileText,
      title: "Document Suite",
      description: "Export professional PDF reports, protocol sections, and statistical analysis plans.",
      badge: "Pro",
    },
    {
      icon: GraduationCap,
      title: "Education Hub",
      description: "Tutorials, guides, and worked examples for every calculator and design decision.",
      badge: "Coming Soon",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Everything you need to design a clinical trial
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            One platform. No spreadsheets. No guesswork.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Card key={mod.title} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F7F7]">
                    <mod.icon className="h-5 w-5 text-[#0D7377]" />
                  </div>
                  {mod.badge && (
                    <Badge
                      variant="secondary"
                      className={
                        mod.badge === "AI"
                          ? "bg-purple-100 text-purple-700"
                          : mod.badge === "Pro"
                          ? "bg-amber-100 text-amber-700"
                          : mod.badge === "Coming Soon"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-[#E6F7F7] text-[#0D7377]"
                      }
                    >
                      {mod.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[#1B2A4A]">{mod.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{mod.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CALCULATOR PREVIEW (interactive demo on landing page)              */
/* ------------------------------------------------------------------ */
function CalculatorPreview() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [effectSize, setEffectSize] = useState(0.5);
  const [sd, setSd] = useState(1.0);

  // Simple two-sample t-test sample size (equal groups, two-sided)
  const zAlpha = 1.96; // approximate for alpha=0.05
  const zBeta = 0.842; // approximate for power=0.80
  const nPerGroup = Math.ceil(
    (2 * Math.pow(zAlpha + zBeta, 2) * Math.pow(sd, 2)) / Math.pow(effectSize, 2)
  );
  const nTotal = nPerGroup * 2;

  return (
    <section className="py-20 bg-[#FAFBFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Try it now — no sign-up required
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Two-Sample T-Test Sample Size Calculator
          </p>
        </div>

        <Card className="mx-auto max-w-4xl shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Inputs */}
              <div className="space-y-5">
                <h3 className="font-semibold text-[#1B2A4A]">Study Parameters</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Significance Level (α)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={alpha}
                    onChange={(e) => setAlpha(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Power (1 − β)
                  </label>
                  <Input
                    type="number"
                    step="0.05"
                    value={power}
                    onChange={(e) => setPower(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expected Mean Difference (δ)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={effectSize}
                    onChange={(e) => setEffectSize(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Common Standard Deviation (σ)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={sd}
                    onChange={(e) => setSd(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col items-center justify-center rounded-lg bg-[#E6F7F7] p-6">
                <p className="text-sm font-medium text-[#0D7377] mb-2">Required Sample Size</p>
                <p
                  className="text-6xl font-bold text-[#0D7377]"
                  style={{ fontFamily: "var(--font-heading-custom)" }}
                >
                  {effectSize > 0 && sd > 0 ? nTotal : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {effectSize > 0 && sd > 0
                    ? `${nPerGroup} per group × 2 groups`
                    : "Enter valid parameters"}
                </p>
                <div className="mt-6 w-full space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Effect size (Cohen&apos;s d):</span>
                    <span className="font-mono">{sd > 0 ? (effectSize / sd).toFixed(3) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Test:</span>
                    <span>Two-sided, independent</span>
                  </div>
                </div>
                <Button className="mt-6 bg-[#0D7377] hover:bg-[#0a5c5f]" asChild>
                  <Link href="/calculators/two-sample-ttest">
                    Full Calculator <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    {
      step: "1",
      title: "Describe your study",
      description: "Tell us about your intervention, population, endpoints, and design preferences.",
    },
    {
      step: "2",
      title: "Get design recommendations",
      description:
        "Our AI advisor suggests the optimal design and helps you estimate statistical parameters.",
    },
    {
      step: "3",
      title: "Calculate & export",
      description:
        "Get validated sample sizes, power curves, and professional PDF reports for your protocol.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            How it works
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0D7377] text-white text-lg font-bold">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                       */
/* ------------------------------------------------------------------ */
function Testimonials() {
  const testimonials = [
    {
      quote:
        "ClinicalTrials.Tools saved us weeks of back-and-forth with our biostatistician. The power curves alone are worth the subscription.",
      name: "Dr. Sarah Chen",
      role: "Principal Investigator",
      institution: "University Medical Center",
    },
    {
      quote:
        "Finally, a modern tool that handles non-inferiority calculations correctly. The sensitivity analysis is a game-changer for protocol development.",
      name: "Dr. James Morrison",
      role: "Biostatistician",
      institution: "Clinical Research Organization",
    },
    {
      quote:
        "I use the free calculators for every grant application. The PDF reports are professional enough to include directly in my submissions.",
      name: "Dr. Priya Patel",
      role: "Associate Professor",
      institution: "School of Public Health",
    },
  ];

  return (
    <section className="py-20 bg-[#FAFBFC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Loved by researchers
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-white">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">&quot;{t.quote}&quot;</p>
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role}, {t.institution}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRICING                                                            */
/* ------------------------------------------------------------------ */
function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

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
        "Dedicated account manager",
        "On-premise option",
      ],
      ctaText: "Contact Sales",
      ctaHref: "/about#contact",
    },
  ];

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>

          {/* Annual/Monthly toggle */}
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} isAnnual={isAnnual} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#0D7377] to-[#1B2A4A] text-white">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          className="text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          Start designing better trials today
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Free forever for basic calculations. No credit card required.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button size="lg" className="bg-[#FF6B6B] hover:bg-[#e85d5d] text-white whitespace-nowrap">
            Get Early Access
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <ProblemStatement />
      <ProductOverview />
      <CalculatorPreview />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <CTASection />
    </>
  );
}
