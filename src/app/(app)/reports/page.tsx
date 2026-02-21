"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and download professional sample size justification reports.
          </p>
        </div>
      </div>

      {/* Report templates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F7F7] mb-3">
              <FileText className="h-5 w-5 text-[#0D7377]" />
            </div>
            <h3 className="font-semibold text-[#1B2A4A]">Sample Size Report</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Professional PDF with inputs, results, power curves, and references.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#E6F7F7] text-[#0D7377] text-xs">PDF</Badge>
              <Badge variant="secondary" className="text-xs">Free (watermarked)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[#1B2A4A]">Statistical Section</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Protocol-ready text for the statistical considerations section.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-xs">Pro</Badge>
              <Badge variant="secondary" className="text-xs">DOCX</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 mb-3">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-[#1B2A4A]">Data Export</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Raw calculation data in JSON or CSV format for further analysis.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#E6F7F7] text-[#0D7377] text-xs">Free</Badge>
              <Badge variant="secondary" className="text-xs">JSON / CSV</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated reports list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">No reports generated yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Run a calculation and click &quot;Export PDF&quot; to generate your first report.
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
