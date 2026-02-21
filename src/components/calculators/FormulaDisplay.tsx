"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormulaDisplayProps {
  /** The formula string (plain text or simplified notation) */
  formula: string;
  /** Optional description of what the formula calculates */
  description?: string;
  /** Optional definitions for variables in the formula */
  variables?: { symbol: string; definition: string }[];
}

export function FormulaDisplay({
  formula,
  description,
  variables,
}: FormulaDisplayProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Formula</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-center overflow-x-auto"
          style={{ fontFamily: "var(--font-mono-custom)" }}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{formula}</p>
        </div>

        {variables && variables.length > 0 && (
          <div className="space-y-1 pt-1">
            <p className="text-xs font-medium text-muted-foreground">Where:</p>
            <div className="grid gap-1">
              {variables.map((v) => (
                <div key={v.symbol} className="flex items-baseline gap-2 text-xs">
                  <span
                    className="font-semibold text-[#1B2A4A] min-w-[2rem]"
                    style={{ fontFamily: "var(--font-mono-custom)" }}
                  >
                    {v.symbol}
                  </span>
                  <span className="text-muted-foreground">= {v.definition}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
