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

function calculateMcNemar(params: {
  alpha: number;
  power: number;
  pDiscordant10: number;
  pDiscordant01: number;
  alternative: string;
}) {
  const { alpha, power, pDiscordant10, pDiscordant01, alternative } = params;

  const delta = pDiscordant10 - pDiscordant01;
  if (delta === 0 || pDiscordant10 <= 0 || pDiscordant01 <= 0) return null;

  const pD = pDiscordant10 + pDiscordant01; // total discordant proportion
  if (pD >= 1) return null;

  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // Connor (1987)
  const termH0 = zAlpha * Math.sqrt(pD);
  const inner = pD - delta * delta;
  if (inner < 0) return null;
  const termH1 = zBeta * Math.sqrt(inner);

  const n = Math.ceil(Math.pow(termH0 + termH1, 2) / (delta * delta));

  // Achieved power
  const seH0 = Math.sqrt(pD / n);
  const innerAchieved = pD - delta * delta;
  let achievedPower = 0;
  if (innerAchieved > 0 && seH0 > 0) {
    const seH1 = Math.sqrt(innerAchieved / n);
    if (seH1 > 0) {
      if (alternative === "two_sided") {
        achievedPower = normCDF((Math.abs(delta) - zAlpha * seH0) / seH1) +
                        normCDF((-Math.abs(delta) - zAlpha * seH0) / seH1);
      } else {
        achievedPower = normCDF((Math.abs(delta) - zAlpha * seH0) / seH1);
      }
    }
  }

  // Effect size: odds ratio of discordant pairs
  const oddsRatio = pDiscordant10 / pDiscordant01;

  return {
    sampleSizeTotal: n,
    sampleSizePerGroup: [n],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: Math.abs(delta),
    method: "McNemar's Test (Connor 1987)",
    oddsRatio,
    totalDiscordant: pD,
  };
}

export function McNemarTest() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [pDiscordant10, setPDiscordant10] = useState(0.3);
  const [pDiscordant01, setPDiscordant01] = useState(0.15);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () =>
      calculateMcNemar({ alpha, power, pDiscordant10, pDiscordant01, alternative }),
    [alpha, power, pDiscordant10, pDiscordant01, alternative]
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
        label="P(discordant 1,0) - p10"
        value={pDiscordant10}
        onChange={setPDiscordant10}
        tooltip="Proportion of pairs that are discordant with outcome (1,0) -- positive on first measure, negative on second."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <ParameterInput
        label="P(discordant 0,1) - p01"
        value={pDiscordant01}
        onChange={setPDiscordant01}
        tooltip="Proportion of pairs that are discordant with outcome (0,1) -- negative on first measure, positive on second."
        min={0.001}
        max={0.999}
        step={0.01}
      />
      <div className="rounded border p-3 text-xs text-muted-foreground space-y-1">
        <p><strong>Discordant pairs table:</strong></p>
        <table className="w-full text-center mt-1">
          <thead>
            <tr>
              <th></th>
              <th className="pb-1">After +</th>
              <th className="pb-1">After -</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium">Before +</td>
              <td>concordant</td>
              <td>p10</td>
            </tr>
            <tr>
              <td className="font-medium">Before -</td>
              <td>p01</td>
              <td>concordant</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "McNemar's Test"}
      additionalInfo={[
        { label: "Number of pairs", value: result?.sampleSizeTotal?.toString() ?? "\u2014" },
        { label: "Total discordant proportion", value: result?.totalDiscordant?.toFixed(3) ?? "\u2014" },
        { label: "Discordant odds ratio", value: result?.oddsRatio?.toFixed(3) ?? "\u2014" },
        { label: "|p10 - p01|", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="McNemar's Test Sample Size Calculator"
      description="Calculate the sample size (number of pairs) needed to compare paired binary outcomes using McNemar's test."
      tier="pro"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Paired (matched) binary data",
        `Total discordant proportion p_d = ${(pDiscordant10 + pDiscordant01).toFixed(4)}`,
        `Discordant odds ratio = ${pDiscordant01 > 0 ? (pDiscordant10 / pDiscordant01).toFixed(3) : "\u2014"}`,
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
      ]}
      formula="n = [z_{alpha/2} * sqrt(p_d) + z_beta * sqrt(p_d - delta^2)]^2 / delta^2, delta = p10 - p01"
      references={[
        "Connor RJ (1987). Sample size for testing differences in proportions for the paired-sample design. Biometrics, 43, 207-211.",
        "Lachin JM (1992). Power and sample size evaluation for the McNemar test. Statistics in Medicine, 11, 1239-1251.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator for paired binary data, such as
            before/after studies with binary outcomes, matched case-control studies, or comparing
            two diagnostic tests applied to the same subjects.
          </p>
          <p>
            <strong>Discordant pairs:</strong> McNemar&apos;s test only uses information from
            discordant pairs (where the two measurements disagree). Concordant pairs provide
            no information about the treatment effect. You need to estimate what proportion of
            all pairs will be discordant in each direction.
          </p>
          <p>
            <strong>Example:</strong> In a before/after study, p10 is the proportion who are
            positive before but negative after (improved), and p01 is the proportion who are
            negative before but positive after (worsened).
          </p>
        </div>
      }
    />
  );
}
