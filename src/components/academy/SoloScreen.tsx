"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PFButton } from "@/components/academy/MobileLayout";
import {
  type Allocation,
  type AssetClass,
  type SimulationEvent,
  type SimulationState,
  type EventOption,
  ASSET_CLASSES,
} from "@/lib/solo-types";
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  generateSimulationReport,
  getAllocationFromStrategy,
} from "@/lib/solo-calculations";
import {
  ALLOCATION_PRESETS,
  initializeSimulation,
  processQuarter,
  applyEventChoice,
} from "@/lib/solo-simulation";
import { getRandomScenario, type MarketScenario } from "@/data/solo-scenarios";
import { getPostGameAnalysis } from "@/lib/solo-analysis";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Shield,
  BarChart3,
  Newspaper,
} from "lucide-react";

type SimPhase = "setup" | "running" | "paused" | "checkpoint" | "complete";

const SPEED_CONFIG = { slow: 1500, normal: 800, fast: 300 };

const SENTIMENT_ICONS = {
  good: TrendingUp,
  bad: TrendingDown,
  neutral: Shield,
} as const;

/* ── Inline sub-components ── */

function PFSlider({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      style={{
        background: `linear-gradient(to right, #FFC800 ${pct}%, #e5e7eb ${pct}%)`,
      }}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFC800] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FFC800] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
    />
  );
}

function PFProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-[#FFC800] rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const CARD = "bg-white rounded-2xl shadow-sm border border-gray-100";

/* ── Main component ── */

export function SoloScreen() {
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [phase, setPhase] = useState<SimPhase>("setup");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [strategyValue, setStrategyValue] = useState(50);
  const [allocations, setAllocations] = useState<Allocation[]>(ALLOCATION_PRESETS.balanced);
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [chartData, setChartData] = useState<{ year: number; value: number }[]>([]);
  const [newsFeed, setNewsFeed] = useState<{ year: number; text: string; type: string }[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<MarketScenario | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quarterRef = useRef(1);

  useEffect(() => {
    const t = setTimeout(() => setIsChartReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const result = getAllocationFromStrategy(strategyValue);
    setAllocations(
      result.allocations.map((a) => ({
        assetClass: a.assetClass as AssetClass,
        percentage: a.percentage,
        value: 0,
      }))
    );
  }, [strategyValue]);

  const strategyInfo = useMemo(() => getAllocationFromStrategy(strategyValue), [strategyValue]);

  /* ── Handlers ── */

  const handleStart = () => {
    const scenario = getRandomScenario(selectedDuration);
    setSelectedScenario(scenario);

    const sim = initializeSimulation(1000, 300, selectedDuration, allocations);
    setSimulation(sim);

    setChartData([{ year: 0, value: 1000 }]);
    setNewsFeed([{ year: 0, text: `Simulation started: ${scenario.title}`, type: "news" }]);
    setPhase("running");
    quarterRef.current = 1;
  };

  const processTick = useCallback(() => {
    if (!simulation || phase !== "running") return;

    const { newState, event } = processQuarter(simulation, quarterRef.current);
    setSimulation(newState);

    if (quarterRef.current === 4) {
      const yearNum = newState.currentYear - simulation.startYear;
      setChartData((prev) => [...prev, { year: yearNum, value: newState.portfolio.totalValue }]);
    }

    if (event) {
      setCurrentEvent(event);
      const yearNum = newState.currentYear - simulation.startYear;
      setNewsFeed((prev) => [{ year: yearNum, text: event.title, type: event.type }, ...prev].slice(0, 8));

      if (event.options && event.options.length > 0) {
        setPhase("checkpoint");
        setShowCheckpoint(true);
      }
    }

    quarterRef.current = quarterRef.current === 4 ? 1 : quarterRef.current + 1;

    if (newState.currentYear >= simulation.endYear) {
      setPhase("complete");
    }
  }, [simulation, phase]);

  useEffect(() => {
    if (phase === "running") {
      intervalRef.current = setInterval(processTick, SPEED_CONFIG[speed]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, speed, processTick]);

  const handleDecision = (option: EventOption) => {
    if (!simulation || !currentEvent) return;
    setSimulation(applyEventChoice(simulation, option, currentEvent));
    setShowCheckpoint(false);
    setPhase("running");
  };

  const handleReset = () => {
    setSimulation(null);
    setPhase("setup");
    setChartData([]);
    setNewsFeed([]);
    setCurrentEvent(null);
    setSelectedScenario(null);
    quarterRef.current = 1;
  };

  /* ══════════════════════════════════════════
     SETUP PHASE
     ══════════════════════════════════════════ */
  if (phase === "setup") {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F3F3F3]">
        <div className="px-4 pt-4 pb-6 space-y-3">
          <div className="mb-2">
            <h1 className="text-lg font-bold text-[#333333]">Solo Simulation</h1>
            <p className="text-xs text-[#767676]">Experience decades of market history in minutes</p>
          </div>

          {/* Time Horizon */}
          <div className={cn(CARD, "p-4")}>
            <h3 className="text-sm font-bold text-[#333333] mb-3">Time Horizon</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#767676]">Duration</span>
              <span className="font-bold text-[#FFC800] text-lg">{selectedDuration} years</span>
            </div>
            <PFSlider
              value={selectedDuration}
              onChange={setSelectedDuration}
              min={10}
              max={50}
              step={5}
            />
            <div className="flex justify-between text-[10px] text-[#767676] mt-2">
              <span>10Y Quick</span>
              <span>30Y Career</span>
              <span>50Y Lifetime</span>
            </div>
          </div>

          {/* Strategy */}
          <div className={cn(CARD, "p-4")}>
            <h3 className="text-sm font-bold text-[#333333] mb-3">Investment Strategy</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#767676]">Risk Level</span>
              <span
                className={cn("font-bold text-lg", {
                  "text-green-600": strategyInfo.label === "Conservative",
                  "text-[#33307E]": strategyInfo.label === "Balanced",
                  "text-[#FFC800]": strategyInfo.label === "Growth",
                  "text-orange-500": strategyInfo.label === "Aggressive",
                })}
              >
                {strategyInfo.label}
              </span>
            </div>

            {/* Risk colour band */}
            <div className="relative mb-2">
              <div className="absolute -top-0 left-0 right-0 h-1.5 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-green-500/25" />
                <div className="flex-1 bg-[#33307E]/20" />
                <div className="flex-1 bg-[#FFC800]/25" />
                <div className="flex-1 bg-orange-500/25" />
              </div>
              <div className="mt-1">
                <PFSlider
                  value={strategyValue}
                  onChange={setStrategyValue}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#767676] mb-4">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Growth</span>
              <span>Aggressive</span>
            </div>

            {/* Allocation preview */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20">
                {isChartReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocations.filter((a) => a.percentage > 0)}
                        dataKey="percentage"
                        nameKey="assetClass"
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={36}
                        isAnimationActive={false}
                      >
                        {allocations
                          .filter((a) => a.percentage > 0)
                          .map((entry) => (
                            <Cell key={entry.assetClass} fill={ASSET_CLASSES[entry.assetClass].color} />
                          ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex-1 space-y-1">
                {allocations
                  .filter((a) => a.percentage > 0)
                  .map((a) => (
                    <div key={a.assetClass} className="flex items-center gap-2 text-[11px]">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ASSET_CLASSES[a.assetClass].color }}
                      />
                      <span className="flex-1 text-[#333333]">{ASSET_CLASSES[a.assetClass].name}</span>
                      <span className="text-[#767676] font-medium">{a.percentage}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Risk / Diversification */}
          <div className={cn(CARD, "p-4")}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="w-4 h-4 text-[#33307E]" />
                  <span className="text-[10px] text-[#767676] font-medium">Risk Score</span>
                </div>
                <p className="text-2xl font-bold text-[#333333]">{strategyInfo.riskScore}</p>
                <PFProgressBar value={strategyInfo.riskScore} className="h-1 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BarChart3 className="w-4 h-4 text-[#FFC800]" />
                  <span className="text-[10px] text-[#767676] font-medium">Diversification</span>
                </div>
                <p className="text-2xl font-bold text-[#333333]">{strategyInfo.diversificationScore}</p>
                <PFProgressBar value={strategyInfo.diversificationScore} className="h-1 mt-1" />
              </div>
            </div>
          </div>

          {/* Start */}
          <PFButton onClick={handleStart}>
            <span className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Start Simulation
            </span>
          </PFButton>

          <p className="text-[10px] text-center text-[#767676]">
            For educational purposes. Simulated scenarios based on historical patterns.
          </p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     COMPLETE PHASE
     ══════════════════════════════════════════ */
  if (phase === "complete" && simulation) {
    const report = generateSimulationReport(simulation.portfolio, simulation.decisions, 1000);
    const analysis = getPostGameAnalysis(report);

    return (
      <div className="flex-1 overflow-y-auto bg-[#F3F3F3]">
        <div className="px-4 pt-4 pb-6 space-y-3">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-2">
            <h1 className="text-lg font-bold text-[#333333]">Simulation Complete</h1>
            <p className="text-xs text-[#767676]">Your {selectedDuration}-year journey</p>
          </motion.div>

          {/* Final value */}
          <div className={cn(CARD, "p-5 text-center bg-gradient-to-br from-[#FFC800]/20 to-[#FFC800]/5 border-[#FFC800]/20")}>
            <p className="text-xs text-[#767676] font-medium mb-1">Final Portfolio Value</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-3xl font-bold text-[#FFC800]"
            >
              {formatCurrency(report.finalValue)}
            </motion.p>
            <p className="text-xs mt-2">
              <span className={cn("font-bold", report.annualizedReturn > 0 ? "text-green-600" : "text-red-500")}>
                {formatPercent(report.annualizedReturn)}
              </span>
              <span className="text-[#767676]"> annualized return</span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className={cn(CARD, "p-3 text-center")}>
              <p className="text-[10px] text-[#767676] font-medium">Contributed</p>
              <p className="font-bold text-sm text-[#333333]">{formatCompactNumber(report.totalContributions)}</p>
            </div>
            <div className={cn(CARD, "p-3 text-center")}>
              <p className="text-[10px] text-[#767676] font-medium">Max Drawdown</p>
              <p className="font-bold text-sm text-orange-500">-{report.maxDrawdown}%</p>
            </div>
            <div className={cn(CARD, "p-3 text-center")}>
              <p className="text-[10px] text-[#767676] font-medium">Diversification</p>
              <p className="font-bold text-sm text-[#FFC800]">{report.diversificationScore}</p>
            </div>
          </div>

          {/* Journey chart */}
          <div className={cn(CARD, "p-4")}>
            <h3 className="text-sm font-bold text-[#333333] mb-3">Your Journey</h3>
            <div className="h-36" style={{ minHeight: "144px" }}>
              {isChartReady && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="soloGradComplete" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#33307E" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#33307E" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#33307E"
                      strokeWidth={2.5}
                      fill="url(#soloGradComplete)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI analysis */}
          <div className={cn(CARD, "p-4 border-[#FFC800]/20 bg-[#FFC800]/5")}>
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-[#FFC800] shrink-0" />
              <p className="text-xs text-[#333333] leading-relaxed">{analysis.message}</p>
            </div>
          </div>

          {/* Good decisions */}
          {report.goodDecisions.length > 0 && (
            <div className={cn(CARD, "p-4 border-green-500/20 bg-green-50")}>
              <h4 className="text-sm font-bold text-green-700 mb-2">Smart Moves</h4>
              <ul className="space-y-2">
                {report.goodDecisions.map((d, i) => (
                  <li key={i} className="text-xs flex items-start gap-2 text-[#333333]">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mistakes */}
          {report.mistakes.length > 0 && (
            <div className={cn(CARD, "p-4 border-orange-400/20 bg-orange-50")}>
              <h4 className="text-sm font-bold text-orange-600 mb-2">Areas to Improve</h4>
              <ul className="space-y-2">
                {report.mistakes.map((m, i) => (
                  <li key={i} className="text-xs flex items-start gap-2 text-[#333333]">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Coaching tips */}
          <div className={cn(CARD, "p-4")}>
            <h4 className="text-sm font-bold text-[#333333] mb-3">Key Takeaways</h4>
            <ul className="space-y-2">
              {report.coachingInsights.map((insight, i) => (
                <li key={i} className="text-xs flex items-start gap-2 text-[#333333]">
                  <Sparkles className="w-3.5 h-3.5 text-[#767676] shrink-0 mt-0.5" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <PFButton onClick={handleReset}>
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Run it again smarter
            </span>
          </PFButton>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RUNNING / PAUSED / CHECKPOINT PHASE
     ══════════════════════════════════════════ */
  if (simulation) {
    const progress = ((simulation.currentYear - simulation.startYear) / (simulation.endYear - simulation.startYear)) * 100;
    const returns = ((simulation.portfolio.totalValue - 1000) / 1000) * 100;
    return (
      <div className="flex-1 overflow-y-auto bg-[#F3F3F3]">
        <div className="px-4 pt-4 pb-6 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#333333]">Year {simulation.currentYear - simulation.startYear}</h1>
              <p className="text-xs text-[#767676]">{simulation.currentYear}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#333333]">{formatCompactNumber(simulation.portfolio.totalValue)}</p>
              <p className={cn("text-xs font-semibold", returns >= 0 ? "text-green-600" : "text-red-500")}>
                {formatPercent(returns)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-[#767676] mb-1">
              <span>Start</span>
              <span className="font-medium">{Math.round(progress)}% complete</span>
              <span>{selectedDuration}Y</span>
            </div>
            <PFProgressBar value={progress} className="h-2" />
          </div>

          {/* Checkpoint modal */}
          <AnimatePresence>
            {showCheckpoint && currentEvent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div
                  className={cn(
                    CARD,
                    "p-4 border-2",
                    currentEvent.type === "crash" && "border-red-400 bg-red-50",
                    currentEvent.type === "bull" && "border-[#FFC800] bg-[#FFC800]/5",
                    currentEvent.type === "recovery" && "border-green-400 bg-green-50",
                    currentEvent.type === "inflation" && "border-orange-400 bg-orange-50",
                    !["crash", "bull", "recovery", "inflation"].includes(currentEvent.type) && "border-gray-300 bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        currentEvent.type === "crash" && "bg-red-100",
                        currentEvent.type === "bull" && "bg-[#FFC800]/20",
                        currentEvent.type === "recovery" && "bg-green-100",
                        currentEvent.type === "inflation" && "bg-orange-100"
                      )}
                    >
                      {currentEvent.type === "crash" ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : currentEvent.type === "bull" ? (
                        <TrendingUp className="w-4 h-4 text-[#FFC800]" />
                      ) : currentEvent.type === "recovery" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-[#333333]">{currentEvent.title}</h3>
                      <p className="text-[11px] text-[#767676]">{currentEvent.description}</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#333333] mb-2">What will you do?</p>

                  <div className="space-y-2">
                    {currentEvent.options.map((option, idx) => {
                      const Icon = SENTIMENT_ICONS[option.sentiment];
                      return (
                        <button
                          key={idx}
                          onClick={() => handleDecision(option)}
                          className="w-full p-3 rounded-xl bg-white border border-gray-200 hover:border-[#FFC800]/50 text-left transition-colors active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <Icon className="w-4 h-4 text-[#FFC800] shrink-0" />
                            <span className="text-[12px] font-semibold text-[#333333]">{option.label}</span>
                          </div>
                          <p className="text-[10px] text-[#767676] ml-6">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Market News */}
          {newsFeed.length > 0 && (
            <div className={cn(CARD, "p-3")}>
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="w-4 h-4 text-[#FFC800]" />
                <h3 className="text-xs font-bold text-[#333333]">Market News</h3>
              </div>
              <div className="space-y-1.5 max-h-20 overflow-y-auto">
                {newsFeed.slice(0, 4).map((news, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                        news.type === "crash" && "bg-red-500",
                        news.type === "bull" && "bg-[#FFC800]",
                        news.type === "crisis" && "bg-orange-500",
                        news.type === "recovery" && "bg-green-500",
                        !["crash", "bull", "crisis", "recovery"].includes(news.type) && "bg-[#767676]"
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-[11px] text-[#333333]">{news.text}</p>
                      <p className="text-[9px] text-[#767676]">Year {news.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live chart */}
          <div className={cn(CARD, "p-4")}>
            <h3 className="text-xs font-bold text-[#333333] mb-2">Portfolio Value</h3>
            <div className="h-32" style={{ minHeight: "128px" }}>
              {isChartReady && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="soloGradLive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#33307E" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#33307E" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "#333333",
                      }}
                      formatter={(value: number) => [formatCompactNumber(value), ""]}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#33307E"
                      strokeWidth={2.5}
                      fill="url(#soloGradLive)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Allocation */}
          <div className={cn(CARD, "p-4")}>
            <h3 className="text-xs font-bold text-[#333333] mb-2">Portfolio Allocation</h3>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16">
                {isChartReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={simulation.portfolio.allocations.filter((a) => a.percentage > 0)}
                        dataKey="percentage"
                        nameKey="assetClass"
                        cx="50%"
                        cy="50%"
                        innerRadius={18}
                        outerRadius={30}
                        isAnimationActive={false}
                      >
                        {simulation.portfolio.allocations
                          .filter((a) => a.percentage > 0)
                          .map((entry) => (
                            <Cell key={entry.assetClass} fill={ASSET_CLASSES[entry.assetClass].color} />
                          ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                {simulation.portfolio.allocations
                  .filter((a) => a.percentage > 0)
                  .map((a) => (
                    <div key={a.assetClass} className="flex items-center gap-1.5 text-[10px]">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: ASSET_CLASSES[a.assetClass].color }}
                      />
                      <span className="flex-1 truncate text-[#333333]">{ASSET_CLASSES[a.assetClass].name}</span>
                      <span className="text-[#767676]">{a.percentage.toFixed(0)}%</span>
                      <span className="font-medium text-[#333333] w-12 text-right">{formatCompactNumber(a.value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <PFButton
              variant={phase === "running" ? "secondary" : "primary"}
              className="flex-1"
              onClick={() => setPhase(phase === "running" ? "paused" : "running")}
            >
              <span className="flex items-center justify-center gap-2">
                {phase === "running" ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Resume
                  </>
                )}
              </span>
            </PFButton>

            <button
              onClick={() => {
                const speeds: ("slow" | "normal" | "fast")[] = ["slow", "normal", "fast"];
                setSpeed(speeds[(speeds.indexOf(speed) + 1) % 3]);
              }}
              className="w-12 h-12 rounded-xl border-2 border-[#FFC800] flex items-center justify-center bg-white active:scale-95 transition-transform"
            >
              <FastForward className={cn("w-5 h-5", speed === "fast" ? "text-[#FFC800]" : "text-[#333333]")} />
            </button>

            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center bg-white active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5 text-[#333333]" />
            </button>
          </div>

          <p className="text-[10px] text-center text-[#767676]">
            Speed: {speed.charAt(0).toUpperCase() + speed.slice(1)}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
