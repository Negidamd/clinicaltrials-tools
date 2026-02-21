"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator, Plus } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1
            className="text-2xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Project Details
          </h1>
          <p className="text-muted-foreground">Manage calculations and reports for this project.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">No calculations saved to this project yet.</p>
                <Button className="mt-4 bg-[#0D7377] hover:bg-[#0a5c5f]" asChild>
                  <Link href="/calculators">
                    <Plus className="mr-2 h-4 w-4" /> Add Calculation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calculations</span>
                <span>0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>—</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
