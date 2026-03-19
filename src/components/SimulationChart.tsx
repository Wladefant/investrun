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

  const chartData = sampled.map((tick) => ({
    date: tick.date,
    year: tick.year,
    portfolio: tick.portfolioReturn,
    benchmark: tick.benchmarkReturn,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
      >
        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fill: "#737373" }}
          tickLine={false}
          axisLine={{ stroke: "#404040" }}
          allowDuplicatedCategory={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#737373" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
          domain={["auto", "auto"]}
        />
        <ReferenceLine y={0} stroke="#404040" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="portfolio"
          stroke="#FFC800"
          strokeWidth={2}
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
