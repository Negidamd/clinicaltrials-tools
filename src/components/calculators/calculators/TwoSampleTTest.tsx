"use client";

import { useState, useMemo, useCallback } from "react";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { ParameterInput } from "@/components/calculators/ParameterInput";
import { ResultsPanel } from "@/components/calculators/ResultsPanel";
import { PowerCurve } from "@/components/calculators/PowerCurve";
import { SensitivityTable } from "@/components/calculators/SensitivityTable";
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

function calculateTwoSampleTTest(params: {
  alpha: number;
  power: number;
  meanDifference: number;
  commonSd: number;
  allocationRatio: number;
  alternative: string;
}) {
  const { alpha, power, meanDifference, commonSd, allocationRatio, alternative } = params;

  if (meanDifference === 0 || commonSd <= 0) return null;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  const k = allocationRatio;
  const delta = Math.abs(meanDifference);

  // Lachin (1981): n1 = (zα + zβ)² × σ²(1 + 1/k) / δ²
  const n1 = Math.ceil(
    Math.pow(zAlpha + zBeta, 2) * Math.pow(commonSd, 2) * (1 + 1 / k) / Math.pow(delta, 2)
  );
  const n2 = Math.ceil(n1 * k);
  const nTotal = n1 + n2;

  // Achieved power (approximate)
  const se = commonSd * Math.sqrt(1 / n1 + 1 / n2);
  const zAchieved = delta / se - zAlpha;
  // Normal CDF approximation
  const achievedPower = 0.5 * (1 + erf(zAchieved / Math.sqrt(2)));

  const cohenD = delta / commonSd;

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: [n1, n2],
    achievedPower,
    effectSize: cohenD,
    method: alternative === "two_sided" ? "Two-sided two-sample t-test" : "One-sided two-sample t-test",
  };
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

export function TwoSampleTTest() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [meanDifference, setMeanDifference] = useState(5);
  const [commonSd, setCommonSd] = useState(10);
  const [allocationRatio, setAllocationRatio] = useState(1);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () =>
      calculateTwoSampleTTest({
        alpha,
        power,
        meanDifference,
        commonSd,
        allocationRatio,
        alternative,
      }),
    [alpha, power, meanDifference, commonSd, allocationRatio, alternative]
  );

  // Power computation function for PowerCurve
  const computePower = useCallback(
    (n: number) => {
      if (meanDifference === 0 || commonSd <= 0 || n <= 2) return 0;
      const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
      const zA = normPPF(1 - alphaAdj);
      const k = allocationRatio;
      const n1 = Math.round(n / (1 + k));
      const n2 = n - n1;
      if (n1 <= 0 || n2 <= 0) return 0;
      const se = commonSd * Math.sqrt(1 / n1 + 1 / n2);
      const zAchieved = Math.abs(meanDifference) / se - zA;
      return 0.5 * (1 + erf(zAchieved / Math.sqrt(2)));
    },
    [alpha, meanDifference, commonSd, allocationRatio, alternative]
  );

  // Sensitivity table: vary effect size and power
  const computeSensitivityN = useCallback(
    (effectMult: number, pwr: number) => {
      const res = calculateTwoSampleTTest({
        alpha,
        power: pwr,
        meanDifference: meanDifference * effectMult,
        commonSd,
        allocationRatio,
        alternative,
      });
      return res?.sampleSizeTotal ?? 0;
    },
    [alpha, meanDifference, commonSd, allocationRatio, alternative]
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
        label="Significance Level (α)"
        value={alpha}
        onChange={setAlpha}
        tooltip="The probability of rejecting the null hypothesis when it is true (Type I error rate). Common values: 0.05, 0.025, 0.01."
        min={0.001}
        max={0.5}
        step={0.005}
      />
      <ParameterInput
        label="Power (1 − β)"
        value={power}
        onChange={setPower}
        tooltip="The probability of correctly rejecting the null hypothesis when the alternative is true. Common values: 0.80, 0.90."
        min={0.5}
        max={0.999}
        step={0.05}
      />
      <ParameterInput
        label="Expected Mean Difference (δ)"
        value={meanDifference}
        onChange={setMeanDifference}
        tooltip="The minimum clinically important difference between the two group means you want to detect."
        step={0.1}
      />
      <ParameterInput
        label="Common Standard Deviation (σ)"
        value={commonSd}
        onChange={setCommonSd}
        tooltip="The assumed common standard deviation in both groups. Estimate from pilot data or published literature."
        min={0.001}
        step={0.1}
      />
      <ParameterInput
        label="Allocation Ratio (n₂/n₁)"
        value={allocationRatio}
        onChange={setAllocationRatio}
        tooltip="The ratio of sample sizes between groups. 1.0 = equal allocation (most efficient). 2.0 = 2:1 allocation."
        min={0.1}
        max={10}
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
      method={result?.method ?? "Two-sample t-test"}
      additionalInfo={[
        { label: "Allocation ratio", value: `${allocationRatio}:1` },
        {
          label: "Cohen's d",
          value: result?.effectSize?.toFixed(3) ?? "—",
        },
      ]}
    />
  );

  return (
    <div className="space-y-6">
      <CalculatorShell
        title="Two-Sample T-Test Sample Size Calculator"
        description="Calculate the sample size needed to detect a difference in means between two independent groups."
        tier="free"
        inputPanel={inputPanel}
        resultsPanel={resultsPanel}
        assumptions={[
          "Independent samples from two populations",
          "Normally distributed outcome (or large sample via CLT)",
          "Equal variances in both groups (pooled SD)",
          alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
          allocationRatio === 1 ? "Equal allocation (1:1 randomization)" : `Unequal allocation (${allocationRatio}:1)`,
        ]}
        formula="n₁ = (z_{α/2} + z_β)² × σ²(1 + 1/k) / δ², n₂ = k × n₁"
        references={[
          "Lachin JM. Introduction to sample size determination and power analysis for clinical trials. Controlled Clinical Trials. 1981;2(2):93-113.",
          "Chow SC, Shao J, Wang H, Lokhnygina Y. Sample Size Calculations in Clinical Research. 3rd ed. Chapman & Hall/CRC; 2017.",
        ]}
        educationalContent={
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>When to use:</strong> Use this calculator when comparing the mean of a
              continuous outcome between two independent treatment groups in a parallel-group design.
            </p>
            <p>
              <strong>How to choose your effect size:</strong> The mean difference (δ) should
              represent the minimum clinically important difference — the smallest difference that
              would be meaningful to patients or clinicians. Look for published literature, pilot
              studies, or clinical guidelines in your therapeutic area.
            </p>
            <p>
              <strong>Common mistakes:</strong> Using optimistic effect sizes that overestimate the
              treatment benefit, underestimating variability, and forgetting to account for dropouts
              (add 10-20% to the calculated N).
            </p>
          </div>
        }
      />

      {/* Power Curve & Sensitivity Table */}
      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PowerCurve
            currentN={result.sampleSizeTotal}
            targetPower={power}
            computePower={computePower}
          />
          <SensitivityTable
            rowLabel="Effect multiplier"
            rowValues={[0.5, 0.75, 1.0, 1.25, 1.5, 2.0]}
            formatRowValue={(v) => `${v}× (δ=${(meanDifference * v).toFixed(1)})`}
            columnLabel="Power"
            columnValues={[0.7, 0.8, 0.85, 0.9, 0.95]}
            formatColumnValue={(v) => `${(v * 100).toFixed(0)}%`}
            computeN={computeSensitivityN}
            currentRowValue={1.0}
            currentColValue={power}
          />
        </div>
      )}
    </div>
  );
}
