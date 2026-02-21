import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Shield, Zap, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            About ClinicalTrials.Tools
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re building the modern platform for clinical trial design — making
            validated statistical tools accessible to every researcher.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <h2
            className="text-2xl font-bold text-[#1B2A4A] mb-4"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Clinical trial design shouldn&apos;t require expensive enterprise software or years of
            biostatistics training. ClinicalTrials.Tools democratizes access to validated
            sample size calculators, power analysis tools, and AI-driven design guidance —
            helping investigators worldwide design better trials, faster.
          </p>
        </div>

        {/* Values */}
        <div className="grid gap-6 sm:grid-cols-2 mb-16">
          {[
            {
              icon: Shield,
              title: "Validated & Transparent",
              description:
                "Every calculator is validated against published reference tables and peer-reviewed formulas. We show our work.",
            },
            {
              icon: Zap,
              title: "Modern & Accessible",
              description:
                "Beautiful, intuitive interfaces that work on any device. No Java applets. No desktop downloads.",
            },
            {
              icon: Users,
              title: "Built for Researchers",
              description:
                "Designed with input from PIs, biostatisticians, and CRAs at leading academic centers.",
            },
            {
              icon: Award,
              title: "Scientifically Rigorous",
              description:
                "Our statistical engine uses exact distributions and methods from peer-reviewed publications.",
            },
          ].map((v) => (
            <Card key={v.title}>
              <CardContent className="pt-6">
                <v.icon className="h-8 w-8 text-[#0D7377] mb-3" />
                <h3 className="font-semibold text-[#1B2A4A]">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <div id="contact" className="mb-16">
          <h2
            className="text-2xl font-bold text-[#1B2A4A] mb-4"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Contact Us
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="you@example.com" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button className="mt-4 bg-[#0D7377] hover:bg-[#0a5c5f]">Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
