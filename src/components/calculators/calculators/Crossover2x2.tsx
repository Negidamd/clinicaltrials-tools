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

function calculateCrossover2x2(params: {
  alpha: number;
  power: number;
  meanDifference: number;
  sdWithin: number;
  alternative: string;
}) {
  const { alpha, power, meanDifference, sdWithin, alternative } = params;
  const delta = Math.abs(meanDifference);

  if (delta === 0 || sdWithin <= 0) return null;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // n = (z_alpha + z_beta)^2 * 2 * sigma_w^2 / delta^2
  let n = Math.ceil(Math.pow(zAlpha + zBeta, 2) * 2 * sdWithin * sdWithin / (delta * delta));
  // Ensure even number for balanced allocation to sequences
  if (n % 2 !== 0) n += 1;

  // Achieved power
  const se = sdWithin * Math.sqrt(2 / n);
  const zAchieved = delta / se - zAlpha;
  const achievedPower = normCDF(zAchieved);

  const effectSize = delta / sdWithin;

  return {
    sampleSizeTotal: n,
    sampleSizePerGroup: [n / 2, n / 2],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize,
    method: alternative === "two_sided"
      ? "Two-sided 2x2 crossover design"
      : "One-sided 2x2 crossover design",
  };
}

export function Crossover2x2() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [meanDifference, setMeanDifference] = useState(5);
  const [sdWithin, setSdWithin] = useState(10);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () =>
      calculateCrossover2x2({ alpha, power, meanDifference, sdWithin, alternative }),
    [alpha, power, meanDifference, sdWithin, alternative]
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
        label="Expected Treatment Difference (delta)"
        value={meanDifference}
        onChange={setMeanDifference}
        tooltip="The expected difference between treatments. Each subject receives both treatments, so this is the within-subject treatment effect."
        step={0.1}
      />
      <ParameterInput
        label="Within-Subject SD (sigma_w)"
        value={sdWithin}
        onChange={setSdWithin}
        tooltip="The within-subject standard deviation. This is typically much smaller than the total SD because between-subject variability is removed."
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
      method={result?.method ?? "2x2 Crossover Design"}
      additionalInfo={[
        { label: "Total subjects", value: result?.sampleSizeTotal?.toString() ?? "\u2014" },
        { label: "Per sequence (AB, BA)", value: result?.sampleSizePerGroup?.[0]?.toString() ?? "\u2014" },
        { label: "delta / sigma_w", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="2x2 Crossover Design Sample Size Calculator"
      description="Calculate the sample size for a two-period, two-treatment crossover trial where each subject receives both treatments."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Two-period, two-treatment crossover design",
        "No carryover effect (or adequate washout period)",
        "No period effect (or adequately modelled)",
        "Normally distributed within-subject differences",
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
      ]}
      formula="n = (z_{alpha/2} + z_beta)^2 * 2 * sigma_w^2 / delta^2"
      references={[
        "Senn S (2002). Cross-over Trials in Clinical Research, 2nd ed. Wiley.",
        "Jones B, Kenward MG (2015). Design and Analysis of Cross-Over Trials, 3rd ed. CRC Press.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator for AB/BA crossover designs where each
            subject is randomized to a treatment sequence and receives both treatments in succession,
            separated by a washout period.
          </p>
          <p>
            <strong>Efficiency gain:</strong> Crossover designs are typically more efficient than
            parallel-group designs because each subject serves as their own control, eliminating
            between-subject variability from the treatment comparison.
          </p>
          <p>
            <strong>Within-subject SD:</strong> The within-subject SD (sigma_w) is usually substantially
            smaller than the between-subject SD. If you only have the total SD (sigma_T) and the
            within-subject correlation (rho), then sigma_w = sigma_T * sqrt(1 - rho).
          </p>
        </div>
      }
    />
  );
}
