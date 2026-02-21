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

// Fisher z-transformation (arctanh)
function fisherZ(r: number): number {
  return 0.5 * Math.log((1 + r) / (1 - r));
}

function calculateCorrelation(params: {
  alpha: number;
  power: number;
  r: number;
  r0: number;
  alternative: string;
}) {
  const { alpha, power, r, r0, alternative } = params;

  if (r === r0 || Math.abs(r) >= 1 || Math.abs(r0) >= 1) return null;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // Fisher z-transformation
  const zr = fisherZ(r);
  const zr0 = fisherZ(r0);

  // n = [(z_alpha + z_beta) / (z_r - z_r0)]^2 + 3
  const n = Math.ceil(Math.pow((zAlpha + zBeta) / (zr - zr0), 2) + 3);

  // Achieved power
  if (n <= 3) return null;
  const se = 1 / Math.sqrt(n - 3);
  let achievedPower = 0;
  if (alternative === "two_sided") {
    achievedPower = normCDF(Math.abs(zr - zr0) / se - zAlpha) +
                    normCDF(-Math.abs(zr - zr0) / se - zAlpha);
  } else {
    achievedPower = normCDF(Math.abs(zr - zr0) / se - zAlpha);
  }

  return {
    sampleSizeTotal: n,
    sampleSizePerGroup: [n],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: Math.abs(r - r0),
    method: alternative === "two_sided"
      ? "Two-sided correlation test (Fisher z)"
      : "One-sided correlation test (Fisher z)",
  };
}

export function Correlation() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [r, setR] = useState(0.3);
  const [r0, setR0] = useState(0);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () => calculateCorrelation({ alpha, power, r, r0, alternative }),
    [alpha, power, r, r0, alternative]
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
        label="Expected Correlation (r)"
        value={r}
        onChange={setR}
        tooltip="The expected Pearson correlation coefficient under the alternative hypothesis."
        min={-0.999}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="Null Correlation (r0)"
        value={r0}
        onChange={setR0}
        tooltip="The correlation under the null hypothesis (default 0 = testing for no association)."
        min={-0.999}
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
      method={result?.method ?? "Correlation Test (Fisher z)"}
      additionalInfo={[
        { label: "Fisher z(r)", value: Math.abs(r) < 1 ? fisherZ(r).toFixed(3) : "\u2014" },
        { label: "Fisher z(r0)", value: Math.abs(r0) < 1 ? fisherZ(r0).toFixed(3) : "\u2014" },
        { label: "|r - r0|", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Correlation Test Sample Size Calculator"
      description="Calculate the sample size needed to test whether a Pearson correlation coefficient differs from a null value."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Bivariate normal distribution",
        "Fisher z-transformation for variance stabilisation",
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
        `Null correlation rho_0 = ${r0}`,
      ]}
      formula="n = [(z_{alpha/2} + z_beta) / (arctanh(r) - arctanh(r0))]^2 + 3"
      references={[
        "Cohen J (1988). Statistical Power Analysis for the Behavioral Sciences, 2nd ed. Erlbaum.",
        "Fisher RA (1921). On the 'probable error' of a coefficient of correlation deduced from a small sample. Metron, 1, 3-32.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when the primary objective is to test
            the significance of a Pearson correlation coefficient, either against zero or another
            hypothesized value.
          </p>
          <p>
            <strong>Fisher z-transformation:</strong> The sampling distribution of the correlation
            coefficient is not normal, especially for large |r|. The Fisher z-transformation
            (arctanh) normalizes and stabilizes the variance.
          </p>
          <p>
            <strong>Effect sizes:</strong> By Cohen&apos;s conventions, correlations of 0.10, 0.30,
            and 0.50 represent small, medium, and large effect sizes.
          </p>
        </div>
      }
    />
  );
}
