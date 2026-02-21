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

function calculateLogRank(params: {
  alpha: number;
  power: number;
  hazardRatio: number;
  probEventControl: number;
  accrualTime: number;
  followupTime: number;
  dropoutRate: number;
  allocationRatio: number;
  alternative: string;
}) {
  const {
    alpha, power, hazardRatio, probEventControl,
    dropoutRate, allocationRatio, alternative,
  } = params;

  if (hazardRatio === 1 || hazardRatio <= 0 || probEventControl <= 0 || probEventControl > 1) return null;

  const k = allocationRatio;
  const alphaAdj = alternative === "two_sided" ? alpha / 2 : alpha;
  const zAlpha = normPPF(1 - alphaAdj);
  const zBeta = normPPF(power);

  // Schoenfeld (1983)
  // D = (z_alpha + z_beta)^2 / [p1 * p2 * (log HR)^2]
  const p1Frac = 1 / (1 + k);
  const p2Frac = k / (1 + k);
  const logHR = Math.log(hazardRatio);

  const dExact = Math.pow(zAlpha + zBeta, 2) / (p1Frac * p2Frac * logHR * logHR);
  const d = Math.ceil(dExact);

  // Overall event probability
  const pEventTrt = 1 - Math.pow(1 - probEventControl, hazardRatio);
  const pEventOverall = (pEventTrt + k * probEventControl) / (1 + k);
  const pEvent = Math.max(pEventOverall, 0.001);

  // Total sample size
  let nTotal = Math.ceil(d / pEvent);

  // Adjust for dropout
  if (dropoutRate > 0 && dropoutRate < 1) {
    nTotal = Math.ceil(nTotal / (1 - dropoutRate));
  }

  const n1 = Math.ceil(nTotal / (1 + k));
  const n2 = nTotal - n1;

  // Achieved power from events
  const zPower = Math.abs(logHR) * Math.sqrt(d * p1Frac * p2Frac) - zAlpha;
  const achievedPower = normCDF(zPower);

  return {
    sampleSizeTotal: nTotal,
    sampleSizePerGroup: [n1, n2],
    achievedPower: Math.max(0, Math.min(1, achievedPower)),
    effectSize: Math.abs(logHR),
    method: "Log-Rank Test (Schoenfeld 1983)",
    eventsRequired: d,
    pEventOverall: pEvent,
  };
}

export function LogRankTest() {
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [hazardRatio, setHazardRatio] = useState(0.7);
  const [probEventControl, setProbEventControl] = useState(0.4);
  const [accrualTime, setAccrualTime] = useState(24);
  const [followupTime, setFollowupTime] = useState(12);
  const [dropoutRate, setDropoutRate] = useState(0.1);
  const [allocationRatio, setAllocationRatio] = useState(1);
  const [alternative, setAlternative] = useState("two_sided");

  const result = useMemo(
    () =>
      calculateLogRank({
        alpha, power, hazardRatio, probEventControl,
        accrualTime, followupTime, dropoutRate, allocationRatio, alternative,
      }),
    [alpha, power, hazardRatio, probEventControl, accrualTime, followupTime, dropoutRate, allocationRatio, alternative]
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
        label="Hazard Ratio (HR)"
        value={hazardRatio}
        onChange={setHazardRatio}
        tooltip="The hazard ratio (treatment/control). HR < 1 implies treatment benefit. HR > 1 implies treatment harm."
        min={0.01}
        max={10}
        step={0.01}
      />
      <ParameterInput
        label="Prob. Event in Control"
        value={probEventControl}
        onChange={setProbEventControl}
        tooltip="The probability of the event occurring in the control group over the study period."
        min={0.01}
        max={0.99}
        step={0.01}
      />
      <ParameterInput
        label="Accrual Time (months)"
        value={accrualTime}
        onChange={setAccrualTime}
        tooltip="Duration of the patient enrollment period in months."
        min={1}
        step={1}
      />
      <ParameterInput
        label="Follow-up Time (months)"
        value={followupTime}
        onChange={setFollowupTime}
        tooltip="Minimum follow-up time after end of accrual in months."
        min={0}
        step={1}
      />
      <ParameterInput
        label="Dropout Rate"
        value={dropoutRate}
        onChange={setDropoutRate}
        tooltip="Expected proportion of subjects lost to follow-up."
        min={0}
        max={0.5}
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
    </div>
  );

  const resultsPanel = (
    <ResultsPanel
      sampleSizeTotal={result?.sampleSizeTotal ?? null}
      sampleSizePerGroup={result?.sampleSizePerGroup ?? null}
      achievedPower={result?.achievedPower ?? null}
      effectSize={result?.effectSize ?? null}
      method={result?.method ?? "Log-Rank Test (Schoenfeld 1983)"}
      additionalInfo={[
        { label: "Events required", value: result?.eventsRequired?.toString() ?? "\u2014" },
        { label: "Overall event probability", value: result?.pEventOverall?.toFixed(3) ?? "\u2014" },
        { label: "log(HR)", value: result?.effectSize?.toFixed(3) ?? "\u2014" },
        { label: "Allocation ratio", value: `${allocationRatio}:1` },
      ]}
    />
  );

  return (
    <CalculatorShell
      title="Log-Rank Test Sample Size Calculator"
      description="Calculate the sample size needed to compare survival curves between two groups using the log-rank test."
      tier="free"
      inputPanel={inputPanel}
      resultsPanel={resultsPanel}
      assumptions={[
        "Proportional hazards assumption",
        "Exponential (constant hazard) within each group",
        alternative === "two_sided" ? "Two-sided hypothesis test" : "One-sided hypothesis test",
        `Allocation ratio k = ${allocationRatio}`,
        dropoutRate > 0 ? `Dropout rate: ${(dropoutRate * 100).toFixed(0)}%` : "No dropout assumed",
      ]}
      formula="D = (z_{alpha/2} + z_beta)^2 / [p1 * p2 * (log HR)^2]; N = D / P(event)"
      references={[
        "Schoenfeld DA (1983). Sample-size formula for the proportional-hazards regression model. Biometrics, 39(2), 499-503.",
        "Freedman LS (1982). Tables of the number of patients required in clinical trials using the logrank test. Statistics in Medicine, 1(2), 121-129.",
      ]}
      educationalContent={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>When to use:</strong> Use this calculator when the primary endpoint is time-to-event
            (survival analysis) and you plan to compare two groups using the log-rank test.
          </p>
          <p>
            <strong>Key concept:</strong> Sample size for survival studies depends on the number of
            events (deaths, relapses) rather than the number of subjects. The total sample size is
            derived by dividing the required events by the overall probability of an event.
          </p>
          <p>
            <strong>Hazard ratio:</strong> An HR of 0.7 means the treatment group has 30% lower
            hazard (risk of event) compared to control. Smaller HRs require fewer events but may
            require more subjects if the event rate is low.
          </p>
        </div>
      }
    />
  );
}
