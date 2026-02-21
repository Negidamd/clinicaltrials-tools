"use client";

import { useState, useMemo } from "react";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { ParameterInput } from "@/components/calculators/ParameterInput";
import { ResultsPanel } from "@/components/calculators/ResultsPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Normal distribution quantile approximation (Abramowitz & Stegun)
function normPPF(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  if (p < 0.5) return -normPPF(1 - p);
  const t = Math.sqrt(-2 * Math.log(1 - p));
  const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
  const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
  return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
}

// Error function approximation
function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function normCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function calculateOneProportion(params: {
  alpha: number;
  power: number;
  p0: number;
  p1: number;
  alternative: string;
}) {
  const { alpha, power, p0, p1, alternative } = params;
  const delta = Math.abs(p1 - p0);

  if (delta === 0 || p0 <= 0 || p0 >= 1 || p1 <= 0 || p1 >= 1) return null;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // n = [z_alpha * sqrt(p0*q0) + z_beta * sqrt(p1*q1)]^2 / (p1 - p0)^2
  const numerator = Math.pow(
    zAlpha * Math.sqrt(p0 * (1 - p0)) + zBeta * Math.sqrt(p1 * (1 - p1)),
    2
  );
  const n = Math.ceil(numerator / (delta * delta));

  // Achieved power
  const seH0 = Math.sqrt(p0 * (1 - p0) / n);
  const seH1 = Math.sqrt(p1 * (1 - p1) / n);
  let achievedPower = 0;
  if (seH0 > 0 && seH1 > 0) {
    if (alternative === "two_sided") {
      const zCrit = normPPF(1 - alpha / 2);
      achievedPower = normCDF((Math.abs(p1 - p0) - zCrit * seH0) / seH1) +
                      normCDF((-Math.abs(p1 - p0) - zCrit * seH0) / seH1);
    } else {
      const zCrit = normPPF(1 - alpha);
      achievedPower = normCDF((Math.abs(p1 - p0) - zCrit * seH0) / seH1);
    }
  }

  // Cohen's h
  const h = 2 * (Math.asin(Math.sqrt(p1)) - Math.asin(Math.sqrt(p0)));

  return {
    sampleSizeTotal: n,
    sampleSizePerGroup: [n],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: Math.abs(h),
    method: alternative === "two_sided"
      ? "Two-sided one-proportion z-test"
      : "One-sided one-proportion z-test",
  };
}

export function OneProportion() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [p0, setP0] = useState(0.3);
  const [p1, setP1] = useState(0.5);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () => calculateOneProportion({ alpha, power, p0, p1, alternative }),
    [alpha, power, p0, p1, alternative]
  );

  const inputPanel = (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Test Type</Label>
        <Select value={alternative} onValueChange={setAlternative}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="two_sided">Two-sided</SelectItem>
            <SelectItem value="one_sided">One-sided</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ParameterInput
        label="Significance Level (alpha)"
        value={alpha}
        onChange={setAlpha}
        tooltip="The probability of rejecting the null hypothesis when it is true (Type I error rate)."
        min={0.001}
        max={0.5}
        step={0.005}
      />
      <ParameterInput
        label="Power (1 - beta)"
        value={power}
        onChange={setPower}
        tooltip="The probability of correctly rejecting the null hypothesis when the alternative is true."
        min={0.5}
        max={0.999}
        step={0.05}
      />
      <ParameterInput
        label="Null Proportion (p0)"
        value={p0}
        onChange={setP0}
        tooltip="The proportion under the null hypothesis (e.g. the known or hypothesized population proportion)."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="Alternative Proportion (p1)"
        value={p1}
        onChange={setP1}
        tooltip="The expected true proportion under the alternative hypothesis. This is the proportion you expect to observe."
        min={0.001}
        max={0.999}
        step={0.01}
      />
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "One-Proportion Z-Test"}
      additionalInfo={[
        { label: "Cohen's h", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
        { label: "Absolute difference", value: Math.abs(p1 - p0).toFixed(3) },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="One-Sample Proportion Calculator"
      description="Calculate the sample size needed to test a single proportion against a known or hypothesized value."
      tier="free"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Binary outcome",
        "Normal approximation to the binomial distribution",
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
      ]}
      formula="n = [z_{alpha/2} * sqrt(p0*q0) + z_beta * sqrt(p1*q1)]^2 / (p1 - p0)^2"
      references={[
        "Fleiss JL (1981). Statistical Methods for Rates and Proportions. Wiley.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when testing whether a single observed
            proportion differs from a known or hypothesized value, such as testing a new drug response
            rate against the historical standard.
          </p>
          <p>
            <strong>Normal approximation:</strong> This calculator uses the normal approximation to the
            binomial. For very small or very large proportions (close to 0 or 1), or small sample sizes,
            the exact binomial test may be more appropriate.
          </p>
        </div>
      }
    />
  );
}
