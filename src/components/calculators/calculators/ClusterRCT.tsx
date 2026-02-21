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

function calculateClusterRCT(params: {
  alpha: number;
  power: number;
  effectSize: number;
  icc: number;
  clusterSize: number;
  sd: number;
  alternative: string;
}) {
  const { alpha, power, effectSize, icc, clusterSize, sd, alternative } = params;

  if (effectSize <= 0 || clusterSize < 2 || sd <= 0) return null;

  const m = clusterSize;
  const d = effectSize / sd; // Standardized effect size (Cohen's d)

  if (d === 0) return null;

  // Design effect
  const deff = 1 + (m - 1) * icc;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // Individual-level sample size per group (two-sample z-test)
  const nIndPerGroup = Math.pow(zAlpha + zBeta, 2) * 2 / (d * d);

  // Adjust for clustering
  const nAdjPerGroup = nIndPerGroup * deff;

  // Number of clusters per group
  const clustersPerGroup = Math.ceil(nAdjPerGroup / m);

  // Total subjects per group
  const n1 = clustersPerGroup * m;
  const n2 = clustersPerGroup * m;
  const nTotal = n1 + n2;
  const totalClusters = clustersPerGroup * 2;

  // Achieved power (using cluster-adjusted approach)
  const n1Eff = clustersPerGroup * m / deff;
  const n2Eff = clustersPerGroup * m / deff;
  const seEff = Math.sqrt(1 / n1Eff + 1 / n2Eff);
  const df = totalClusters - 2;
  // Normal approximation for achieved power (t-distribution for small df)
  const ncp = d / seEff;
  const zAchieved = ncp - zAlpha;
  const achievedPower = normCDF(zAchieved);

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: [n1, n2],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: d,
    method: "Cluster RCT (Design Effect Approach)",
    clustersPerGroup,
    totalClusters,
    deff,
  };
}

export function ClusterRCT() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [effectSize, setEffectSize] = useState(5);
  const [icc, setIcc] = useState(0.05);
  const [clusterSize, setClusterSize] = useState(20);
  const [sd, setSd] = useState(10);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () =>
      calculateClusterRCT({ alpha, power, effectSize, icc, clusterSize, sd, alternative }),
    [alpha, power, effectSize, icc, clusterSize, sd, alternative]
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
        label="Expected Effect Size (raw difference)"
        value={effectSize}
        onChange={setEffectSize}
        tooltip="The expected absolute difference in means between the intervention and control arms."
        min={0.001}
        step={0.1}
      />
      <ParameterInput
        label="Standard Deviation (sigma)"
        value={sd}
        onChange={setSd}
        tooltip="The total (individual-level) standard deviation of the outcome."
        min={0.001}
        step={0.1}
      />
      <ParameterInput
        label="Intra-Cluster Correlation (ICC)"
        value={icc}
        onChange={setIcc}
        tooltip="The intra-cluster correlation coefficient (rho). Typical values: 0.01-0.05 for large clusters, 0.05-0.30 for small clusters."
        min={0}
        max={0.99}
        step={0.01}
      />
      <ParameterInput
        label="Average Cluster Size (m)"
        value={clusterSize}
        onChange={(v) => setClusterSize(Math.max(2, Math.round(v)))}
        tooltip="Average number of subjects per cluster (e.g., patients per clinic, students per school)."
        min={2}
        max={1000}
        step={1}
      />
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "Cluster RCT"}
      additionalInfo={[
        { label: "Clusters per arm", value: result?.clustersPerGroup?.toString() ?? "\u2014" },
        { label: "Total clusters", value: result?.totalClusters?.toString() ?? "\u2014" },
        { label: "Design effect (DEFF)", value: result?.deff?.toFixed(3) ?? "\u2014" },
        { label: "ICC", value: icc.toFixed(3) },
        { label: "Cluster size", value: clusterSize.toString() },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Cluster Randomized Trial Sample Size Calculator"
      description="Calculate the sample size needed for a cluster randomized controlled trial, accounting for intra-cluster correlation."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Subjects nested within clusters",
        `Intra-cluster correlation (ICC) = ${icc}`,
        `Average cluster size m = ${clusterSize}`,
        `Design effect DEFF = ${result?.deff?.toFixed(3) ?? "\u2014"}`,
        `Total clusters = ${result?.totalClusters ?? "\u2014"} (${result?.clustersPerGroup ?? "\u2014"} per arm)`,
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
      ]}
      formula="DEFF = 1 + (m - 1) * ICC; n_adj = n_individual * DEFF; clusters = ceil(n_adj / m)"
      references={[
        "Donner A, Klar N (2000). Design and Analysis of Cluster Randomization Trials in Health Research. Arnold.",
        "Eldridge SM, Ashby D, Kerry S (2006). Sample size for cluster randomized trials. Int J Epidemiology, 35, 1292-1300.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when randomization occurs at the group
            (cluster) level rather than the individual level, such as clinics, schools, or communities.
          </p>
          <p>
            <strong>Design effect:</strong> The design effect (DEFF) measures how much clustering inflates
            the required sample size compared to individual randomization. DEFF = 1 + (m-1) * ICC. Higher
            ICC or larger clusters increase the design effect substantially.
          </p>
          <p>
            <strong>ICC values:</strong> Typical ICC values range from 0.01-0.05 for outcomes in large
            clinical settings and 0.05-0.30 for smaller or more homogeneous clusters. Even small ICC
            values (0.01-0.05) can substantially inflate sample sizes with large clusters.
          </p>
        </div>
      }
    />
  );
}
