"use client";

import { useState, useMemo } from "react";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { ParameterInput } from "@/components/calculators/ParameterInput";
import { ResultsPanel } from "@/components/calculators/ResultsPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

// Normal CDF from erf
function normCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function calculateTwoProportions(params: {
  alpha: number;
  power: number;
  p1: number;
  p2: number;
  allocationRatio: number;
  alternative: string;
  continuityCorrectionEnabled: boolean;
}) {
  const { alpha, power, p1, p2, allocationRatio, alternative, continuityCorrectionEnabled } = params;
  const delta = Math.abs(p1 - p2);

  if (delta === 0 || p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1) return null;

  const k = allocationRatio;
  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // Pooled proportion under H0
  const pBar = (p1 + k * p2) / (1 + k);
  const qBar = 1 - pBar;

  // Fleiss (1981) normal approximation
  const numerator = Math.pow(
    zAlpha * Math.sqrt((1 + 1 / k) * pBar * qBar) +
    zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / k),
    2
  );
  let n1Exact = numerator / (delta * delta);

  // Continuity correction (Fleiss)
  if (continuityCorrectionEnabled) {
    const n1Uncorrected = n1Exact;
    n1Exact = (n1Uncorrected / 4) * Math.pow(
      1 + Math.sqrt(1 + 2 * (1 + 1 / k) / (n1Uncorrected * delta)),
      2
    );
  }

  const n1 = Math.ceil(n1Exact);
  const n2 = Math.ceil(n1Exact * k);
  const nTotal = n1 + n2;

  // Achieved power
  const pBarAchieved = (n1 * p1 + n2 * p2) / (n1 + n2);
  const qBarAchieved = 1 - pBarAchieved;
  const seH0 = Math.sqrt(pBarAchieved * qBarAchieved * (1 / n1 + 1 / n2));
  const seH1 = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);

  let achievedPower = 0;
  if (seH0 > 0 && seH1 > 0) {
    if (alternative === "two_sided") {
      const zCrit = normPPF(1 - alpha / 2);
      achievedPower = normCDF((Math.abs(p1 - p2) - zCrit * seH0) / seH1) +
                      normCDF((-Math.abs(p1 - p2) - zCrit * seH0) / seH1);
    } else {
      const zCrit = normPPF(1 - alpha);
      achievedPower = normCDF((Math.abs(p1 - p2) - zCrit * seH0) / seH1);
    }
  }

  // Cohen's h effect size
  const h = 2 * (Math.asin(Math.sqrt(p1)) - Math.asin(Math.sqrt(p2)));

  const methodLabel = continuityCorrectionEnabled
    ? "Two Proportions (Fleiss 1981) with continuity correction"
    : "Two Proportions (Fleiss 1981)";

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: [n1, n2],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: Math.abs(h),
    method: methodLabel,
  };
}

export function TwoProportions() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [p1, setP1] = useState(0.5);
  const [p2, setP2] = useState(0.3);
  const [allocationRatio, setAllocationRatio] = useState(1);
  const [alternative, setAlternative] = useState("two_sided");
  const [continuityCorrectionEnabled, setContinuityCorrectionEnabled] = useState(false);

  const result = useMemo(
    () =>
      calculateTwoProportions({
        alpha, power, p1, p2, allocationRatio, alternative, continuityCorrectionEnabled,
      }),
    [alpha, power, p1, p2, allocationRatio, alternative, continuityCorrectionEnabled]
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
        label="Proportion in Group 1 (p1)"
        value={p1}
        onChange={setP1}
        tooltip="Expected event proportion in the treatment group."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="Proportion in Group 2 (p2)"
        value={p2}
        onChange={setP2}
        tooltip="Expected event proportion in the control group."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="Allocation Ratio (n2/n1)"
        value={allocationRatio}
        onChange={setAllocationRatio}
        tooltip="Ratio of sample sizes between groups. 1.0 = equal allocation."
        min={0.1}
        max={10}
        step={0.1}
      />
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Continuity Correction (Yates)</Label>
        <Switch
          checked={continuityCorrectionEnabled}
          onCheckedChange={setContinuityCorrectionEnabled}
        />
      </div>
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "Two Proportions (Chi-Square)"}
      additionalInfo={[
        { label: "Allocation ratio", value: `${allocationRatio}:1` },
        { label: "Cohen's h", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
        { label: "Risk difference", value: `${Math.abs(p1 - p2).toFixed(3)}` },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Two Proportions Sample Size Calculator"
      description="Calculate the sample size needed to detect a difference in proportions between two independent groups using chi-square test."
      tier="free"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Independent samples",
        "Binary outcome in each group",
        "Normal approximation to the binomial distribution",
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
        allocationRatio === 1 ? "Equal allocation (1:1 randomization)" : `Unequal allocation (${allocationRatio}:1)`,
        continuityCorrectionEnabled ? "Yates continuity correction applied" : "No continuity correction",
      ]}
      formula="n1 = [z_{alpha/2} * sqrt((1+1/k) * p_bar * q_bar) + z_beta * sqrt(p1*q1 + p2*q2/k)]^2 / (p1 - p2)^2"
      references={[
        "Fleiss JL (1981). Statistical Methods for Rates and Proportions, 2nd ed. Wiley.",
        "Fleiss JL, Tytun A, Ury HK (1980). A simple approximation for calculating sample sizes for comparing independent proportions. Biometrics, 36, 343-346.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when comparing event rates (binary outcomes)
            between two independent groups, such as response rates in a clinical trial.
          </p>
          <p>
            <strong>Continuity correction:</strong> The Yates continuity correction adjusts the chi-square
            statistic to better approximate the exact binomial test. It results in a larger required sample
            size but is more conservative, especially for small samples.
          </p>
          <p>
            <strong>Effect size:</strong> Cohen&apos;s h is the arcsine-transformed effect size. Values of
            0.2, 0.5, and 0.8 correspond to small, medium, and large effects respectively.
          </p>
        </div>
      }
    />
  );
}
