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

function calculateNonInferiorityProportions(params: {
  alpha: number;
  power: number;
  pTreatment: number;
  pControl: number;
  nonInferiorityMargin: number;
}) {
  const { alpha, power, pTreatment, pControl, nonInferiorityMargin } = params;

  if (pTreatment <= 0 || pTreatment >= 1 || pControl <= 0 || pControl >= 1 || nonInferiorityMargin <= 0) return null;

  const delta = pTreatment - pControl;
  const d = delta + nonInferiorityMargin; // distance from NI boundary under H1

  if (d <= 0) return null; // Treatment worse than margin allows

  // One-sided alpha for NI
  const zAlpha = normPPF(1 - alpha);
  const zBeta = normPPF(power);

  // Wald method approximation:
  // Under H0: p_T - p_C = -margin, so p_T0 = p_C - margin (approximate)
  // For simplified Wald approach, use approximate restricted proportions
  const pT0 = Math.max(0.001, Math.min(0.999, pControl - nonInferiorityMargin));
  const pC0 = pControl;

  // Variance under H0 (restricted)
  const varH0 = pT0 * (1 - pT0) + pC0 * (1 - pC0);

  // Variance under H1 (unrestricted)
  const varH1 = pTreatment * (1 - pTreatment) + pControl * (1 - pControl);

  // Sample size per group (equal allocation)
  const numerator = Math.pow(
    zAlpha * Math.sqrt(varH0) + zBeta * Math.sqrt(varH1),
    2
  );
  const n1Exact = numerator / (d * d);

  const n1 = Math.ceil(n1Exact);
  const n2 = Math.ceil(n1Exact);
  const nTotal = n1 + n2;

  // Achieved power
  const seH0 = Math.sqrt(pT0 * (1 - pT0) / n1 + pC0 * (1 - pC0) / n2);
  const seH1 = Math.sqrt(pTreatment * (1 - pTreatment) / n1 + pControl * (1 - pControl) / n2);

  let achievedPower = 0;
  if (seH0 > 0 && seH1 > 0) {
    const zPower = (d - zAlpha * seH0) / seH1;
    achievedPower = normCDF(zPower);
  }

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: [n1, n2],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: d,
    method: "Non-Inferiority Test for Proportions (Wald Method)",
  };
}

export function NonInferiorityProportions() {
  const [alpha, setAlpha] = useState(0.025);
  const [power, setPower] = useState(0.80);
  const [pTreatment, setPTreatment] = useState(0.75);
  const [pControl, setPControl] = useState(0.75);
  const [nonInferiorityMargin, setNonInferiorityMargin] = useState(0.1);

  const result = useMemo(
    () =>
      calculateNonInferiorityProportions({
        alpha, power, pTreatment, pControl, nonInferiorityMargin,
      }),
    [alpha, power, pTreatment, pControl, nonInferiorityMargin]
  );

  const inputPanel = (
    <div className="space-y-4">
      <ParameterInput
        label="One-Sided Significance Level (alpha)"
        value={alpha}
        onChange={setAlpha}
        tooltip="One-sided alpha for non-inferiority testing. Commonly 0.025."
        min={0.001}
        max={0.5}
        step={0.005}
      />
      <ParameterInput
        label="Power (1 - beta)"
        value={power}
        onChange={setPower}
        tooltip="The probability of correctly concluding non-inferiority."
        min={0.5}
        max={0.999}
        step={0.05}
      />
      <ParameterInput
        label="Treatment Proportion (p_T)"
        value={pTreatment}
        onChange={setPTreatment}
        tooltip="Expected proportion of success in the treatment group."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="Control Proportion (p_C)"
        value={pControl}
        onChange={setPControl}
        tooltip="Expected proportion of success in the control group."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="Non-Inferiority Margin (Delta_NI)"
        value={nonInferiorityMargin}
        onChange={setNonInferiorityMargin}
        tooltip="Maximum acceptable difference in proportions (on the risk-difference scale). Must be positive."
        min={0.001}
        max={0.5}
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
      method={result?.method ?? "Non-Inferiority Test for Proportions"}
      additionalInfo={[
        { label: "NI margin", value: nonInferiorityMargin.toFixed(3) },
        { label: "Expected difference (p_T - p_C)", value: (pTreatment - pControl).toFixed(3) },
        { label: "Distance from boundary", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Non-Inferiority (Proportions) Sample Size Calculator"
      description="Calculate the sample size needed for a non-inferiority trial comparing two proportions using the Wald method."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Independent samples",
        "Binary outcomes",
        "One-sided test (non-inferiority)",
        `Non-inferiority margin Delta_NI = ${nonInferiorityMargin}`,
        "Wald method approximation for variance under H0",
      ]}
      formula="n = [z_alpha * sqrt(V_H0) + z_beta * sqrt(V_H1)]^2 / (delta + Delta_NI)^2"
      references={[
        "Farrington CP, Manning G (1990). Test statistics and sample size formulae for comparative binomial trials. Statistics in Medicine, 9, 1447-1454.",
        "Blackwelder WC (1982). \"Proving the null hypothesis\" in clinical trials. Controlled Clinical Trials, 3, 345-353.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when designing a non-inferiority trial
            with a binary (yes/no) endpoint, such as response rate or success rate.
          </p>
          <p>
            <strong>Margin selection:</strong> The non-inferiority margin defines the maximum acceptable
            difference in proportions. For example, a margin of 0.10 means the treatment can be up to
            10 percentage points worse than the control and still be considered non-inferior.
          </p>
          <p>
            <strong>Typical scenario:</strong> When treatment and control have the same expected proportion
            (e.g., both 0.75), you are powering the study to rule out that the treatment is worse by more
            than the NI margin.
          </p>
        </div>
      }
    />
  );
}
