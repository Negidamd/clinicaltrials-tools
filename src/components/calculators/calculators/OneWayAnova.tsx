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

/**
 * Approximation to the F-distribution CDF using the normal approximation.
 * Based on the Wilson-Hilferty transformation for chi-squared,
 * extended for the F-distribution.
 */
function fCDF(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0;
  // Wilson-Hilferty approximation for F -> normal
  const a = df1;
  const b = df2;
  const num = Math.pow(x * a / b, 1 / 3) * (1 - 2 / (9 * b)) - (1 - 2 / (9 * a));
  const den = Math.sqrt(2 / (9 * a) + Math.pow(x * a / b, 2 / 3) * 2 / (9 * b));
  if (den === 0) return 0.5;
  return normCDF(num / den);
}

/**
 * Approximation to the noncentral F-distribution CDF.
 * Uses Patnaik's two-moment approximation:
 * F_nc(x; df1, df2, lambda) ~ F(x * c; df1_adj, df2)
 * where df1_adj = (df1 + lambda)^2 / (df1 + 2*lambda)
 * and c = df1_adj / (df1 + lambda)
 */
function ncfCDF(x: number, df1: number, df2: number, lambda: number): number {
  if (x <= 0) return 0;
  if (lambda === 0) return fCDF(x, df1, df2);

  // Patnaik (1949) two-moment central F approximation
  const df1Adj = Math.pow(df1 + lambda, 2) / (df1 + 2 * lambda);
  const c = df1Adj / (df1 + lambda);
  return fCDF(x * c, df1Adj, df2);
}

/**
 * F-distribution inverse CDF approximation using bisection.
 */
function fPPF(p: number, df1: number, df2: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  let lo = 0, hi = 100;
  // Expand upper bound if needed
  while (fCDF(hi, df1, df2) < p) hi *= 2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (fCDF(mid, df1, df2) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function calculateOneWayAnova(params: {
  alpha: number;
  power: number;
  numGroups: number;
  effectSizeF: number;
}) {
  const { alpha, power, numGroups, effectSizeF } = params;

  if (effectSizeF <= 0 || numGroups < 2) return null;

  const g = numGroups;

  // Iterative search: find n_per_group such that power >= target
  const zAlpha = normPPF(1 - alpha / 2);
  const zBeta = normPPF(power);

  // Rough starting estimate
  let nPerGroup = Math.max(2, Math.ceil(Math.pow(zAlpha + zBeta, 2) / (effectSizeF * effectSizeF) / g) + 1);

  // Power function using noncentral F
  function powerForN(n: number): number {
    const N = n * g;
    const df1 = g - 1;
    const df2 = N - g;
    if (df2 < 1) return 0;
    const lam = N * effectSizeF * effectSizeF;
    const fCrit = fPPF(1 - alpha, df1, df2);
    return 1 - ncfCDF(fCrit, df1, df2, lam);
  }

  // Search upward
  for (let i = 0; i < 10000; i++) {
    const pwr = powerForN(nPerGroup);
    if (pwr >= power) break;
    nPerGroup += 1;
  }

  const nTotal = nPerGroup * g;
  const achievedPower = powerForN(nPerGroup);

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: Array(g).fill(nPerGroup),
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: effectSizeF,
    method: "One-Way ANOVA (F-test approximation)",
    nPerGroup,
  };
}

export function OneWayAnova() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [numGroups, setNumGroups] = useState(3);
  const [effectSizeF, setEffectSizeF] = useState(0.25);

  const result = useMemo(
    () =>
      calculateOneWayAnova({ alpha, power, numGroups, effectSizeF }),
    [alpha, power, numGroups, effectSizeF]
  );

  const inputPanel = (
    <div className="space-y-4">
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
        label="Number of Groups"
        value={numGroups}
        onChange={(v) => setNumGroups(Math.max(2, Math.min(10, Math.round(v))))}
        tooltip="Number of treatment groups (2 to 10). ANOVA compares means across all groups simultaneously."
        min={2}
        max={10}
        step={1}
      />
      <ParameterInput
        label="Cohen's f (Effect Size)"
        value={effectSizeF}
        onChange={setEffectSizeF}
        tooltip="Cohen's f effect size: f = sigma_between / sigma_within. Small = 0.10, Medium = 0.25, Large = 0.40."
        min={0.01}
        max={5}
        step={0.01}
      />
      <div className="rounded border p-3 text-xs text-muted-foreground space-y-1">
        <p><strong>Cohen&apos;s f guidelines:</strong></p>
        <p>Small: f = 0.10 | Medium: f = 0.25 | Large: f = 0.40</p>
        <p>f = sigma_m / sigma, where sigma_m is the SD of group means</p>
      </div>
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "One-Way ANOVA"}
      additionalInfo={[
        { label: "Per group", value: result?.nPerGroup?.toString() ?? "\u2014" },
        { label: "Number of groups", value: numGroups.toString() },
        { label: "Cohen's f", value: effectSizeF.toFixed(3) },
        { label: "df1 (between)", value: (numGroups - 1).toString() },
        { label: "df2 (within)", value: result ? ((result.nPerGroup * numGroups) - numGroups).toString() : "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="One-Way ANOVA Sample Size Calculator"
      description="Calculate the sample size needed to compare means across three or more independent groups using an F-test."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Independent observations",
        "Normally distributed outcomes in each group",
        "Equal variances (homoscedasticity) across groups",
        "Equal group sizes (balanced design)",
      ]}
      formula="lambda = N * f^2, Power = P(F_{g-1, N-g, lambda} > F_{alpha, g-1, N-g})"
      references={[
        "Cohen J (1988). Statistical Power Analysis for the Behavioral Sciences, 2nd ed. Erlbaum.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when comparing means across three or
            more treatment groups in a parallel-group design. For two groups, consider the two-sample
            t-test which is equivalent.
          </p>
          <p>
            <strong>Effect size:</strong> Cohen&apos;s f can be computed from group means and a common SD:
            f = sigma_m / sigma, where sigma_m is the SD of the group means around the grand mean.
          </p>
          <p>
            <strong>Post-hoc tests:</strong> This calculator powers the overall F-test, not individual
            pairwise comparisons. If specific contrasts are of interest, you may need additional
            sample size for multiple comparison adjustments.
          </p>
        </div>
      }
    />
  );
}
