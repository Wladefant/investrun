"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SimulationTick } from "@/lib/simulation-engine";

interface Props {
  ticks: SimulationTick[];
}

export default function SimulationChart({ ticks }: Props) {
  if (ticks.length === 0) return null;

  // Sample every Nth tick for performance (max ~200 points on chart)
  const step = Math.max(1, Math.floor(ticks.length / 200));
  const sampled = ticks.filter(
    (_, i) => i % step === 0 || i === ticks.length - 1
  );

  // Use sequential index as X axis, label with year at boundaries
  let lastYear = 0;
  const chartData = sampled.map((tick, i) => {
    const showLabel = tick.year !== lastYear;
    lastYear = tick.year;
    return {
      idx: i,
      label: showLabel ? String(tick.year) : "",
      portfolio: tick.portfolioReturn,
      benchmark: tick.benchmarkReturn,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: "#737373" }}
          tickLine={false}
          axisLine={{ stroke: "#333" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#737373" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
          domain={["auto", "auto"]}
        />
        <ReferenceLine y={0} stroke="#555" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="#FFC800"
          strokeWidth={2.5}
          dot={false}
          animationDuration={0}
        />
        <Line
          type="monotone"
          dataKey="benchmark"
          stroke="#737373"
          strokeWidth={1}
          dot={false}
          strokeDasharray="4 4"
          animationDuration={0}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
