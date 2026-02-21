"use client";

import { useState, useMemo } from "react";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { ParameterInput } from "@/components/calculators/ParameterInput";
import { ResultsPanel } from "@/components/calculators/ResultsPanel";
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

function calculateNonInferiorityMeans(params: {
  alpha: number;
  power: number;
  meanDifferenceExpected: number;
  sd: number;
  nonInferiorityMargin: number;
}) {
  const { alpha, power, meanDifferenceExpected, sd, nonInferiorityMargin } = params;

  if (sd <= 0 || nonInferiorityMargin <= 0) return null;

  // The test margin offset: distance from NI boundary under H1
  const d = meanDifferenceExpected + nonInferiorityMargin;
  if (d <= 0) return null; // Treatment worse than margin

  // Non-inferiority is inherently one-sided
  const zAlpha = normPPF(1 - alpha);
  const zBeta = normPPF(power);

  // n1 = (z_alpha + z_beta)^2 * sigma^2 * 2 / d^2  (equal allocation)
  const n1Exact = Math.pow(zAlpha + zBeta, 2) * sd * sd * 2 / (d * d);
  const n1 = Math.ceil(n1Exact);
  const n2 = Math.ceil(n1Exact);
  const nTotal = n1 + n2;

  // Achieved power
  const se = sd * Math.sqrt(1 / n1 + 1 / n2);
  const ncp = d / se;
  const zAchieved = ncp - zAlpha;
  const achievedPower = normCDF(zAchieved);

  const effectSize = d / sd;

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: [n1, n2],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize,
    method: "Non-Inferiority Test for Means (One-sided)",
  };
}

export function NonInferiorityMeans() {
  const [alpha, setAlpha] = useState(0.025);
  const [power, setPower] = useState(0.80);
  const [meanDifferenceExpected, setMeanDifferenceExpected] = useState(0);
  const [sd, setSd] = useState(10);
  const [nonInferiorityMargin, setNonInferiorityMargin] = useState(5);

  const result = useMemo(
    () =>
      calculateNonInferiorityMeans({
        alpha, power, meanDifferenceExpected, sd, nonInferiorityMargin,
      }),
    [alpha, power, meanDifferenceExpected, sd, nonInferiorityMargin]
  );

  const inputPanel = (
    <div className="space-y-4">
      <ParameterInput
        label="One-Sided Significance Level (alpha)"
        value={alpha}
        onChange={setAlpha}
        tooltip="One-sided alpha for non-inferiority testing. Commonly 0.025 (equivalent to two-sided 0.05)."
        min={0.001}
        max={0.5}
        step={0.005}
      />
      <ParameterInput
        label="Power (1 - beta)"
        value={power}
        onChange={setPower}
        tooltip="The probability of correctly concluding non-inferiority when the treatment is truly non-inferior."
        min={0.5}
        max={0.999}
        step={0.05}
      />
      <ParameterInput
        label="Expected Mean Difference (delta)"
        value={meanDifferenceExpected}
        onChange={setMeanDifferenceExpected}
        tooltip="Expected true difference (treatment - control). Typically 0 for strict non-inferiority (assume treatments are equal)."
        step={0.1}
      />
      <ParameterInput
        label="Common Standard Deviation (sigma)"
        value={sd}
        onChange={setSd}
        tooltip="The assumed common standard deviation in both groups."
        min={0.001}
        step={0.1}
      />
      <ParameterInput
        label="Non-Inferiority Margin (Delta_NI)"
        value={nonInferiorityMargin}
        onChange={setNonInferiorityMargin}
        tooltip="The maximum acceptable difference (treatment can be this much worse than control and still be considered non-inferior). Must be positive."
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
      method={result?.method ?? "Non-Inferiority Test for Means"}
      additionalInfo={[
        { label: "NI margin", value: nonInferiorityMargin.toString() },
        { label: "Expected difference", value: meanDifferenceExpected.toString() },
        { label: "Standardized offset", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Non-Inferiority (Means) Sample Size Calculator"
      description="Calculate the sample size needed to demonstrate that a new treatment is not worse than the standard by a pre-specified margin."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Independent samples",
        "Normally distributed outcomes",
        "Equal variances in both groups",
        "One-sided test (non-inferiority is inherently one-sided)",
        `Non-inferiority margin Delta_NI = ${nonInferiorityMargin}`,
      ]}
      formula="n = (z_alpha + z_beta)^2 * 2 * sigma^2 / (delta + Delta_NI)^2"
      references={[
        "Chow SC, Shao J, Wang H (2008). Sample Size Calculations in Clinical Research, 2nd ed. Chapman & Hall/CRC.",
        "FDA Guidance: Non-Inferiority Clinical Trials to Establish Effectiveness (2016).",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when designing a non-inferiority trial
            to show that a new treatment is not unacceptably worse than an active control.
          </p>
          <p>
            <strong>Choosing the margin:</strong> The non-inferiority margin should be the largest
            difference that is clinically acceptable. It is often based on a fraction of the effect
            of the active control versus placebo from historical trials.
          </p>
          <p>
            <strong>One-sided alpha:</strong> Non-inferiority testing uses a one-sided test. An alpha
            of 0.025 corresponds to the conventional two-sided 0.05 level.
          </p>
        </div>
      }
    />
  );
}
