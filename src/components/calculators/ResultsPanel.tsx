"use client";

import { Badge } from "@/components/ui/badge";

interface ResultsPanelProps {
  sampleSizeTotal: number | null;
  sampleSizePerGroup: number[] | null;
  achievedPower: number | null;
  effectSize: number | null;
  method: string;
  isLoading?: boolean;
  warnings?: string[];
  additionalInfo?: { label: string; value: string }[];
}

export function ResultsPanel({
  sampleSizeTotal,
  sampleSizePerGroup,
  achievedPower,
  effectSize,
  method,
  isLoading = false,
  warnings = [],
  additionalInfo = [],
}: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D7377] border-t-transparent" />
      </div>
    );
  }

  if (sampleSizeTotal === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Enter parameters and click Calculate</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary result */}
      <div className="rounded-lg bg-[#E6F7F7] p-6 text-center">
        <p className="text-sm font-medium text-[#0D7377] mb-1">Required Sample Size</p>
        <p
          className="text-5xl font-bold text-[#0D7377]"
          style={{ fontFamily: "var(--font-heading-custom)" }}
        >
          {sampleSizeTotal}
        </p>
        {sampleSizePerGroup && sampleSizePerGroup.length > 1 && (
          <p className="text-sm text-muted-foreground mt-2">
            {sampleSizePerGroup.map((n, i) => `Group ${i + 1}: ${n}`).join(" | ")}
          </p>
        )}
      </div>

      {/* Secondary results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">Achieved Power</p>
          <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-mono-custom)" }}>
            {achievedPower !== null ? `${(achievedPower * 100).toFixed(1)}%` : "—"}
          </p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">Effect Size</p>
          <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-mono-custom)" }}>
            {effectSize !== null ? effectSize.toFixed(3) : "—"}
          </p>
        </div>
      </div>

      {/* Method */}
      <div className="text-sm">
        <span className="text-muted-foreground">Method: </span>
        <span className="font-medium">{method}</span>
      </div>

      {/* Additional info */}
      {additionalInfo.length > 0 && (
        <div className="space-y-2">
          {additionalInfo.map((info) => (
            <div key={info.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{info.label}</span>
              <span className="font-mono" style={{ fontFamily: "var(--font-mono-custom)" }}>
                {info.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
