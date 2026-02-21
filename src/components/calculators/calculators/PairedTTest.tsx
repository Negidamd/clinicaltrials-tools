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

function calculatePairedTTest(params: {
  alpha: number;
  power: number;
  meanDifference: number;
  sdDifference: number;
  alternative: string;
}) {
  const { alpha, power, meanDifference, sdDifference, alternative } = params;
  const delta = Math.abs(meanDifference);

  if (delta === 0 || sdDifference <= 0) return null;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // n = (z_alpha + z_beta)^2 * sigma_d^2 / delta^2
  const n = Math.ceil(Math.pow(zAlpha + zBeta, 2) * Math.pow(sdDifference, 2) / Math.pow(delta, 2));

  // Achieved power approximation
  const se = sdDifference / Math.sqrt(n);
  const zAchieved = delta / se - zAlpha;
  const achievedPower = normCDF(zAchieved);

  // Cohen's d_z
  const effectSize = delta / sdDifference;

  return {
    sampleSizeTotal: n,
    sampleSizePerGroup: [n],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize,
    method: alternative === "two_sided" ? "Two-sided paired t-test" : "One-sided paired t-test",
  };
}

export function PairedTTest() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [meanDifference, setMeanDifference] = useState(5);
  const [sdDifference, setSdDifference] = useState(10);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () =>
      calculatePairedTTest({ alpha, power, meanDifference, sdDifference, alternative }),
    [alpha, power, meanDifference, sdDifference, alternative]
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
        label="Expected Mean Difference (delta)"
        value={meanDifference}
        onChange={setMeanDifference}
        tooltip="The expected mean of the paired differences. This is the minimum clinically important difference you want to detect."
        step={0.1}
      />
      <ParameterInput
        label="SD of Differences (sigma_d)"
        value={sdDifference}
        onChange={setSdDifference}
        tooltip="Standard deviation of the paired differences. Estimate from pilot data or published literature."
        min={0.001}
        step={0.1}
      />
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "Paired t-test"}
      additionalInfo={[
        { label: "Number of pairs", value: result?.sampleSizeTotal?.toString() ?? "\u2014" },
        { label: "Cohen's d_z", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Paired T-Test Sample Size Calculator"
      description="Calculate the sample size (number of pairs) needed to detect a mean difference in paired or matched observations."
      tier="free"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Paired (matched) observations",
        "Normally distributed differences (or large sample via CLT)",
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
      ]}
      formula="n = (z_{alpha/2} + z_beta)^2 * sigma_d^2 / delta^2"
      references={[
        "Chow SC, Shao J, Wang H (2008). Sample Size Calculations in Clinical Research, 2nd ed. Chapman & Hall/CRC.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator for before/after studies, crossover
            first-period analyses, or any design where observations are naturally paired.
          </p>
          <p>
            <strong>Standard deviation of differences:</strong> This is NOT the same as the standard
            deviation of the raw measurements. If you have the SD of each measurement (sigma) and the
            correlation between pairs (rho), then sigma_d = sigma * sqrt(2 * (1 - rho)).
          </p>
          <p>
            <strong>Advantage over independent samples:</strong> Paired designs are typically more
            efficient because within-subject variability is usually less than between-subject variability.
          </p>
        </div>
      }
    />
  );
}
