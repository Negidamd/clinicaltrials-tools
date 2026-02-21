"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Calculator,
  FileText,
  FolderOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const quickActions = [
  {
    title: "New Calculation",
    description: "Run a sample size calculation",
    icon: Calculator,
    href: "/calculators",
    color: "bg-[#E6F7F7] text-[#0D7377]",
  },
  {
    title: "Design Advisor",
    description: "Get AI-powered design help",
    icon: Sparkles,
    href: "/design-advisor",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Create Project",
    description: "Organize your trial design",
    icon: FolderOpen,
    href: "/projects",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Generate Report",
    description: "Export a sample size report",
    icon: FileText,
    href: "/reports",
    color: "bg-amber-50 text-amber-600",
  },
];

const popularCalculators = [
  { name: "Two-Sample T-Test", slug: "two-sample-ttest", category: "Means" },
  { name: "Two Proportions", slug: "two-proportions", category: "Proportions" },
  { name: "Log-Rank Test", slug: "log-rank-test", category: "Survival" },
  { name: "Non-Inferiority (Means)", slug: "non-inferiority-means", category: "NI/Equivalence" },
  { name: "Cluster RCT", slug: "cluster-rct", category: "Complex" },
  { name: "One-Way ANOVA", slug: "one-way-anova", category: "Means" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1
          className="text-2xl font-bold text-[#1B2A4A]"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          Design better clinical trials with validated sample size calculators.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F7F7]">
              <Calculator className="h-5 w-5 text-[#0D7377]" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Calculations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">20</p>
              <p className="text-sm text-muted-foreground">Calcs remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#1B2A4A]">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="pt-6">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-[#1B2A4A]">{action.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular calculators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Popular Calculators</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/calculators">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularCalculators.map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium text-[#1B2A4A]">{calc.name}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {calc.category}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity (empty state) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your recent calculations and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No recent activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start by running your first calculation
            </p>
            <Button className="mt-4 bg-[#0D7377] hover:bg-[#0a5c5f]" asChild>
              <Link href="/calculators">
                Go to Calculators <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
