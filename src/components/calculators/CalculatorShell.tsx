"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, FileText, Copy, Info } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CalculatorShellProps {
  title: string;
  description: string;
  tier: "free" | "pro";
  inputPanel: ReactNode;
  resultsPanel: ReactNode;
  educationalContent?: ReactNode;
  formula?: string;
  assumptions?: string[];
  references?: string[];
  onSave?: () => void;
  onExportPDF?: () => void;
  onCopy?: () => void;
}

export function CalculatorShell({
  title,
  description,
  tier,
  inputPanel,
  resultsPanel,
  educationalContent,
  formula,
  assumptions,
  references,
  onSave,
  onExportPDF,
  onCopy,
}: CalculatorShellProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-bold text-[#1B2A4A]"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              {title}
            </h1>
            <Badge
              variant="secondary"
              className={
                tier === "free"
                  ? "bg-[#E6F7F7] text-[#0D7377]"
                  : "bg-amber-50 text-amber-700"
              }
            >
              {tier === "free" ? "Free" : "Pro"}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="mr-1 h-4 w-4" /> Save
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <FileText className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="mr-1 h-4 w-4" /> Copy
          </Button>
        </div>
      </div>

      {/* Main content: inputs + results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">{inputPanel}</CardContent>
        </Card>

        {/* Results panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent>{resultsPanel}</CardContent>
        </Card>
      </div>

      {/* Assumptions & Formula */}
      {(assumptions || formula || references) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {assumptions && assumptions.length > 0 && (
            <Collapsible defaultOpen>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Assumptions</CardTitle>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {assumptions.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-[#0D7377] mt-1">&#8226;</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {(formula || references) && (
            <div className="space-y-4">
              {formula && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Formula</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div
                      className="rounded bg-slate-50 p-3 font-mono text-sm overflow-x-auto"
                      style={{ fontFamily: "var(--font-mono-custom)" }}
                    >
                      {formula}
                    </div>
                  </CardContent>
                </Card>
              )}
              {references && references.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">References</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-1 list-decimal list-inside">
                      {references.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          {r}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Educational panel */}
      {educationalContent && (
        <Collapsible>
          <Card>
            <CardHeader>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                <CardTitle className="text-sm font-medium">
                  Learn More About This Calculator
                </CardTitle>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0 prose prose-sm max-w-none">
                {educationalContent}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
