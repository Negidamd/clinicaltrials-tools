"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PowerCurveProps {
  /** Current sample size from the calculator */
  currentN: number;
  /** Target power (e.g. 0.80) */
  targetPower: number;
  /** Function that computes power given a sample size */
  computePower: (n: number) => number;
  /** Label for x-axis */
  xLabel?: string;
}

export function PowerCurve({
  currentN,
  targetPower,
  computePower,
  xLabel = "Total Sample Size (N)",
}: PowerCurveProps) {
  const data = useMemo(() => {
    if (currentN <= 0 || !isFinite(currentN)) return [];

    const minN = Math.max(4, Math.floor(currentN * 0.2));
    const maxN = Math.ceil(currentN * 2.5);
    const step = Math.max(1, Math.floor((maxN - minN) / 60));
    const points: { n: number; power: number }[] = [];

    for (let n = minN; n <= maxN; n += step) {
      const power = computePower(n);
      if (isFinite(power)) {
        points.push({ n, power: Math.min(1, Math.max(0, power)) });
      }
    }

    // Ensure current N is in the data
    const currentPower = computePower(currentN);
    if (isFinite(currentPower)) {
      const exists = points.some((p) => p.n === currentN);
      if (!exists) {
        points.push({ n: currentN, power: Math.min(1, Math.max(0, currentPower)) });
        points.sort((a, b) => a.n - b.n);
      }
    }

    return points;
  }, [currentN, computePower]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Power Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="n"
              label={{ value: xLabel, position: "insideBottom", offset: -10, fontSize: 12 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              label={{
                value: "Power",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                fontSize: 12,
              }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Power"]}
              labelFormatter={(label) => `N = ${label}`}
              contentStyle={{ fontSize: 12 }}
            />
            {/* Target power reference line */}
            <ReferenceLine
              y={targetPower}
              stroke="#FF6B6B"
              strokeDasharray="5 5"
              label={{
                value: `${(targetPower * 100).toFixed(0)}% power`,
                position: "right",
                fontSize: 11,
                fill: "#FF6B6B",
              }}
            />
            {/* Current N reference line */}
            <ReferenceLine
              x={currentN}
              stroke="#0D7377"
              strokeDasharray="5 5"
              label={{
                value: `N=${currentN}`,
                position: "top",
                fontSize: 11,
                fill: "#0D7377",
              }}
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#0D7377"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#0D7377" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
