"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

// --- Asset definitions ---

interface AssetClass {
  key: string;
  label: string;
  icon: string;
  color: string;
  avgReturn: number; // annual %
  crashReturn: number; // annual % in crash year
}

const ASSETS: AssetClass[] = [
  { key: "chStocks", label: "Swiss Stocks", icon: "\uD83C\uDDE8\uD83C\uDDED", color: "#EF4444", avgReturn: 0.05, crashReturn: -0.35 },
  { key: "usStocks", label: "US Stocks", icon: "\uD83C\uDDFA\uD83C\uDDF8", color: "#3B82F6", avgReturn: 0.07, crashReturn: -0.40 },
  { key: "euStocks", label: "EU Stocks", icon: "\uD83C\uDDEA\uD83C\uDDFA", color: "#8B5CF6", avgReturn: 0.04, crashReturn: -0.30 },
  { key: "bonds", label: "Bonds", icon: "\uD83D\uDCDC", color: "#22C55E", avgReturn: 0.02, crashReturn: 0.01 },
  { key: "gold", label: "Gold", icon: "\uD83E\uDD47", color: "#F59E0B", avgReturn: 0.03, crashReturn: 0.05 },
  { key: "cash", label: "Cash", icon: "\uD83D\uDCB5", color: "#6B7280", avgReturn: 0.005, crashReturn: 0.005 },
];

const BENCHMARK_ALLOC: Record<string, number> = {
  chStocks: 15,
  usStocks: 25,
  euStocks: 10,
  bonds: 30,
  gold: 10,
  cash: 10,
};

type Phase = "briefing" | "build" | "result1" | "rebalance" | "debrief";

// --- HHI calculation ---

function calcHHI(alloc: Record<string, number>): number {
  const total = Object.values(alloc).reduce((s, v) => s + v, 0);
  if (total === 0) return 1;
  return Object.values(alloc).reduce((sum, v) => {
    const share = v / total;
    return sum + share * share;
  }, 0);
}

// --- Simulation helpers ---

function simulate3Years(
  alloc: Record<string, number>,
  crashYear: number // 0-indexed year of crash
): { year: string; player: number; benchmark: number }[] {
  const startValue = 100000;
  let playerValue = startValue;
  let benchValue = startValue;

  const points: { year: string; player: number; benchmark: number }[] = [
    { year: "Start", player: startValue, benchmark: startValue },
  ];

  for (let y = 0; y < 3; y++) {
    const isCrash = y === crashYear;
    let playerReturn = 0;
    let benchReturn = 0;

    for (const asset of ASSETS) {
      const playerWeight = (alloc[asset.key] || 0) / 100;
      const benchWeight = (BENCHMARK_ALLOC[asset.key] || 0) / 100;
      const ret = isCrash ? asset.crashReturn : asset.avgReturn;
      playerReturn += playerWeight * ret;
      benchReturn += benchWeight * ret;
    }

    playerValue = Math.round(playerValue * (1 + playerReturn));
    benchValue = Math.round(benchValue * (1 + benchReturn));

    points.push({
      year: `Year ${y + 1}`,
      player: playerValue,
      benchmark: benchValue,
    });
  }

  return points;
}

function getProfessorComment(alloc: Record<string, number>, hhi: number): string {
  const maxAsset = ASSETS.reduce((max, a) =>
    (alloc[a.key] || 0) > (alloc[max.key] || 0) ? a : max
  );
  const maxPct = alloc[maxAsset.key] || 0;

  if (maxPct >= 80) {
    return `${maxPct}% in ${maxAsset.label}?! That's practically ALL your eggs in one basket. If ${maxAsset.label} crash, you lose almost everything. Let's see what happens...`;
  }
  if (maxPct >= 60) {
    return `${maxPct}% in ${maxAsset.label} is a heavy concentration. You're betting big on one asset class. Diversification is about spreading risk - let's see if this strategy survives a storm.`;
  }
  if (hhi > 0.3) {
    return "Your portfolio is still quite concentrated. A few asset classes dominate. Let's test how it handles a market shock.";
  }
  if (hhi < 0.2) {
    return "Nice spread! You've distributed across multiple asset classes. A well-diversified portfolio should weather storms better. Let's find out.";
  }
  return "Decent allocation. Let's run it through a crisis and see how it performs.";
}

// --- Component ---

export function Mission2Screen({
  onComplete,
  onBack,
}: {
  onComplete: (score: number, data?: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("briefing");

  // Allocation state: percentages per asset
  const defaultAlloc: Record<string, number> = {
    chStocks: 0,
    usStocks: 0,
    euStocks: 0,
    bonds: 0,
    gold: 0,
    cash: 100,
  };
  const [allocation, setAllocation] = useState<Record<string, number>>(defaultAlloc);
  const [rebalancedAlloc, setRebalancedAlloc] = useState<Record<string, number> | null>(null);
  const [didRebalance, setDidRebalance] = useState(false);

  const total = Object.values(allocation).reduce((s, v) => s + v, 0);
  const hhi = calcHHI(allocation);

  // Rebalance allocation (for phase "rebalance")
  const rebalanceTotal = rebalancedAlloc
    ? Object.values(rebalancedAlloc).reduce((s, v) => s + v, 0)
    : 0;

  // Simulation data for result1 (crash in year 1)
  const sim1Data = useMemo(() => simulate3Years(allocation, 0), [allocation]);

  // Simulation data for debrief (crash already passed, recovery period - no crash)
  const finalAlloc = rebalancedAlloc || allocation;
  const sim2Data = useMemo(() => simulate3Years(finalAlloc, -1), [finalAlloc]);

  // Score calculation
  const finalHHI = calcHHI(finalAlloc);
  const rawScore = Math.round(100 - finalHHI * 120);
  const rebalanceBonus =
    didRebalance && rebalancedAlloc && calcHHI(rebalancedAlloc) < calcHHI(allocation) ? 10 : 0;
  const finalScore = Math.max(0, Math.min(100, rawScore + rebalanceBonus));

  // Slider update helper - adjusts allocation while keeping total valid
  const updateAllocation = (
    setter: React.Dispatch<React.SetStateAction<Record<string, number> | null>> | React.Dispatch<React.SetStateAction<Record<string, number>>>,
    current: Record<string, number>,
    key: string,
    value: number
  ) => {
    const newAlloc = { ...current, [key]: value };
    (setter as React.Dispatch<React.SetStateAction<Record<string, number>>>)(newAlloc);
  };

  // --- Briefing Phase ---
  if (phase === "briefing") {
    return (
      <>
        <ScreenHeader title="Mission 2" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-foregroundxl mb-6 shadow-lg">
              {"\uD83E\uDD5A"}
            </div>
            <h1 className="text-primary-foregroundxl font-bold text-foreground mb-2">
              Don&apos;t Put All Your Eggs
            </h1>
            <p className="text-muted-foreground text-sm mb-6">Diversification</p>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
                The oldest rule in investing: never put all your eggs in one basket.
                But how many baskets do you need? And what should go in each one?
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                You have CHF 100,000 to allocate across six asset classes. Build your
                portfolio, then watch how it performs through a market crisis.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
              <span className="bg-muted px-2.5 py-1 rounded-full">{"\u23F1"} 3-4 minutes</span>
              <span className="bg-muted px-2.5 py-1 rounded-full">6 asset classes</span>
              <span className="bg-muted px-2.5 py-1 rounded-full">+120 XP</span>
            </div>
          </motion.div>

          <Button onClick={() => setPhase("build")} size="lg" className="w-full">
            Start Mission
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // --- Portfolio Builder Phase ---
  if (phase === "build") {
    return (
      <>
        <ScreenHeader title="Build Portfolio" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Total indicator */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">Total Allocation</span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    total === 100 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {total}%
                </span>
              </div>
              {/* Allocation bar */}
              <div className="w-full h-6 bg-muted rounded-full overflow-hidden flex">
                {ASSETS.map((asset) => {
                  const pct = allocation[asset.key] || 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={asset.key}
                      className="h-full transition-all duration-200"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: asset.color,
                      }}
                    />
                  );
                })}
              </div>
              {total !== 100 && (
                <p className="text-xs text-red-500 mt-2">
                  {total < 100
                    ? `Allocate ${100 - total}% more to continue.`
                    : `Over by ${total - 100}%. Reduce some allocations.`}
                </p>
              )}
            </div>

            {/* Sliders */}
            <div className="space-y-3 mb-4">
              {ASSETS.map((asset) => (
                <div
                  key={asset.key}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{asset.icon}</span>
                      <span className="text-sm font-medium text-foreground">
                        {asset.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {allocation[asset.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={allocation[asset.key]}
                    onChange={(e) =>
                      updateAllocation(
                        setAllocation,
                        allocation,
                        asset.key,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${asset.color} 0%, ${asset.color} ${allocation[asset.key]}%, #e5e7eb ${allocation[asset.key]}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Professor reaction to concentration */}
            {total === 100 && (
              <motion.div
                className="bg-card rounded-2xl p-4 border border-primary/20 shadow-sm mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
                  {getProfessorComment(allocation, hhi)}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="px-5 pb-5">
          <Button
            onClick={() => setPhase("result1")}
            size="lg"
            className="w-full"
            disabled={total !== 100}
          >
            Lock In Allocation
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // --- Result 1 Phase ---
  if (phase === "result1") {
    const playerStart = sim1Data[0].player;
    const playerEnd = sim1Data[sim1Data.length - 1].player;
    const benchEnd = sim1Data[sim1Data.length - 1].benchmark;
    const playerReturn = (((playerEnd - playerStart) / playerStart) * 100).toFixed(1);
    const benchReturn = (((benchEnd - playerStart) / playerStart) * 100).toFixed(1);

    // Find the crash low
    const crashLow = Math.min(...sim1Data.map((d) => d.player));
    const crashDrop = (((crashLow - playerStart) / playerStart) * 100).toFixed(1);
    const benchLow = Math.min(...sim1Data.map((d) => d.benchmark));
    const benchDrop = (((benchLow - playerStart) / playerStart) * 100).toFixed(1);

    const isConcentrated = hhi > 0.3;

    return (
      <>
        <ScreenHeader title="Simulation Results" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Chart */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4">
              <p className="text-xs font-bold text-muted-foreground mb-3">
                3-YEAR PERFORMANCE (CRASH IN YEAR 1)
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sim1Data}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "#999" }}
                      axisLine={{ stroke: "#e5e5e5" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#999" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine y={100000} stroke="#e5e5e5" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="player"
                      stroke="#FFC800"
                      strokeWidth={2.5}
                      dot={{ fill: "#FFC800", r: 3 }}
                      name="Your Portfolio"
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#999"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#999", r: 3 }}
                      name="Diversified Benchmark"
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-card rounded-2xl p-3 border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground mb-1">Your Return</p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    parseFloat(playerReturn) >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {parseFloat(playerReturn) >= 0 ? "+" : ""}
                  {playerReturn}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crash dip: {crashDrop}%
                </p>
              </div>
              <div className="bg-card rounded-2xl p-3 border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground mb-1">Benchmark</p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    parseFloat(benchReturn) >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {parseFloat(benchReturn) >= 0 ? "+" : ""}
                  {benchReturn}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crash dip: {benchDrop}%
                </p>
              </div>
            </div>

            {/* Concentration warning */}
            {isConcentrated && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-xs font-bold text-red-700">High Concentration</span>
                </div>
                <p className="text-xs text-red-600">
                  Your concentrated portfolio dropped {crashDrop}% in the crash, while the
                  diversified benchmark only dropped {benchDrop}%.
                </p>
              </div>
            )}

            {/* Professor debrief */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
                {isConcentrated
                  ? `Your portfolio dropped ${crashDrop}% in the crash year. A balanced portfolio only dropped ${benchDrop}%. That's the price of concentration - bigger swings in both directions. Would you like to rebalance before the next period?`
                  : `Well diversified! Your portfolio held up relatively well in the crash, dropping ${crashDrop}% compared to the benchmark's ${benchDrop}%. Diversification won't prevent losses, but it cushions the blow. Want to fine-tune before the next period?`}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="px-5 pb-5">
          <Button
            onClick={() => {
              setRebalancedAlloc({ ...allocation });
              setPhase("rebalance");
            }}
            size="lg"
            className="w-full"
          >
            Rebalance Portfolio
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // --- Rebalance Phase ---
  if (phase === "rebalance") {
    const currentRebalance = rebalancedAlloc || allocation;
    const rebTotal = Object.values(currentRebalance).reduce((s, v) => s + v, 0);

    return (
      <>
        <ScreenHeader title="Rebalance" onBack={() => setPhase("result1")} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
                Now that you&apos;ve seen the impact of a crash, you have a chance to
                rebalance. Adjust your allocations for the next 3-year period.
              </p>
            </div>

            {/* Total indicator */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">Total Allocation</span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    rebTotal === 100 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {rebTotal}%
                </span>
              </div>
              <div className="w-full h-6 bg-muted rounded-full overflow-hidden flex">
                {ASSETS.map((asset) => {
                  const pct = currentRebalance[asset.key] || 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={asset.key}
                      className="h-full transition-all duration-200"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: asset.color,
                      }}
                    />
                  );
                })}
              </div>
              {rebTotal !== 100 && (
                <p className="text-xs text-red-500 mt-2">
                  {rebTotal < 100
                    ? `Allocate ${100 - rebTotal}% more.`
                    : `Over by ${rebTotal - 100}%.`}
                </p>
              )}
            </div>

            {/* Sliders */}
            <div className="space-y-3 mb-4">
              {ASSETS.map((asset) => (
                <div
                  key={asset.key}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{asset.icon}</span>
                      <span className="text-sm font-medium text-foreground">
                        {asset.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {currentRebalance[asset.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={currentRebalance[asset.key]}
                    onChange={(e) =>
                      updateAllocation(
                        setRebalancedAlloc as React.Dispatch<React.SetStateAction<Record<string, number>>>,
                        currentRebalance,
                        asset.key,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${asset.color} 0%, ${asset.color} ${currentRebalance[asset.key]}%, #e5e7eb ${currentRebalance[asset.key]}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="px-5 pb-5 space-y-2">
          <Button
            onClick={() => {
              setDidRebalance(true);
              setPhase("debrief");
            }}
            size="lg"
            className="w-full"
            disabled={rebTotal !== 100}
          >
            Confirm Rebalance
            <ChevronRight size={18} />
          </Button>
          <Button
            onClick={() => {
              setRebalancedAlloc(null);
              setDidRebalance(false);
              setPhase("debrief");
            }}
            size="lg"
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Skip - Keep Current Allocation
          </Button>
        </div>
      </>
    );
  }

  // --- Debrief Phase ---
  const debriefAlloc = rebalancedAlloc || allocation;
  const debriefHHI = calcHHI(debriefAlloc);
  const playerEnd2 = sim2Data[sim2Data.length - 1].player;
  const benchEnd2 = sim2Data[sim2Data.length - 1].benchmark;
  const playerReturn2 = (((playerEnd2 - 100000) / 100000) * 100).toFixed(1);
  const benchReturn2 = (((benchEnd2 - 100000) / 100000) * 100).toFixed(1);

  const diversificationGrade =
    debriefHHI < 0.18
      ? "Excellent"
      : debriefHHI < 0.25
        ? "Good"
        : debriefHHI < 0.35
          ? "Moderate"
          : "Poor";

  const gradeColor =
    debriefHHI < 0.18
      ? "text-emerald-500"
      : debriefHHI < 0.25
        ? "text-blue-500"
        : debriefHHI < 0.35
          ? "text-amber-500"
          : "text-red-500";

  return (
    <>
      <ScreenHeader title="Mission Debrief" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
            {"\uD83E\uDD5A"}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Diversification: {diversificationGrade}
          </h2>
          <p className={cn("text-foregroundxl font-bold mt-2", gradeColor)}>
            {finalScore}/100
          </p>
        </motion.div>

        {/* Recovery chart */}
        <motion.div
          className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-bold text-muted-foreground mb-3">
            RECOVERY PERIOD (3 YEARS, NO CRASH)
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sim2Data}>
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#999" }}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#999" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine y={100000} stroke="#e5e5e5" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="player"
                  stroke="#FFC800"
                  strokeWidth={2.5}
                  dot={{ fill: "#FFC800", r: 3 }}
                  name="Your Portfolio"
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#999"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#999", r: 3 }}
                  name="Benchmark"
                />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Final allocation summary */}
        <motion.div
          className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-bold text-muted-foreground mb-3">YOUR FINAL ALLOCATION</p>
          <div className="space-y-1.5">
            {ASSETS.map((asset) => {
              const pct = debriefAlloc[asset.key] || 0;
              if (pct === 0) return null;
              return (
                <div key={asset.key} className="flex items-center gap-2">
                  <span className="text-sm">{asset.icon}</span>
                  <span className="text-xs text-foreground flex-1">{asset.label}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: asset.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-8 text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Recovery return</span>
            <span
              className={cn(
                "text-sm font-bold",
                parseFloat(playerReturn2) >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {parseFloat(playerReturn2) >= 0 ? "+" : ""}
              {playerReturn2}% (benchmark: +{benchReturn2}%)
            </span>
          </div>
        </motion.div>

        {/* Professor debrief */}
        <motion.div
          className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
            {debriefHHI < 0.2
              ? "Excellent diversification! You spread your risk across multiple asset classes. In real markets, this is the single most reliable way to protect your wealth. Nobel Prize-winning research confirms it: diversification is the only free lunch in investing."
              : debriefHHI < 0.3
                ? "Decent diversification. You have some spread, but there's room to improve. The key insight: you don't need to pick the best asset class. You just need to avoid having everything in the worst one."
                : "Your portfolio is still heavily concentrated. Remember: diversification isn't about maximizing returns - it's about surviving the worst days. A concentrated portfolio can deliver great returns... until the one crash that wipes you out."}
            {didRebalance &&
              " I noticed you rebalanced after seeing the crash results. That adaptability is a valuable skill - the best investors adjust when they learn new information."}
          </p>
        </motion.div>

        <Button
          onClick={() => onComplete(finalScore, { diversificationScore: finalScore })}
          size="lg"
          className="w-full"
        >
          <Sparkles size={18} />
          Complete Mission
        </Button>
      </div>
    </>
  );
}
