"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ALLOCATIONS,
  buildSimulation,
  applyRebalance,
  type Allocation,
  type SimulationTick,
  type PlayerAction,
} from "@/lib/simulation-engine";
import type { DailyPrice } from "@/lib/market-data";
import type { MarketEvent } from "@/lib/simulation-engine";
import { calculateScore, type ScoreResult } from "@/lib/scoring";
import marketEventsData from "@/data/market-events.json";
import SimulationChart from "@/components/SimulationChart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "setup" | "playing" | "event_pause" | "results";
type RiskProfile = "cautious" | "balanced" | "growth";

const ASSET_LABELS: Record<keyof Allocation, string> = {
  swiss_stocks: "Swiss Stocks",
  us_stocks: "US Stocks",
  eu_stocks: "EU Stocks",
  bonds: "Bonds",
  gold: "Gold",
  cash: "Cash",
};

const ASSET_ICONS: Record<keyof Allocation, string> = {
  swiss_stocks: "🇨🇭",
  us_stocks: "🇺🇸",
  eu_stocks: "🇪🇺",
  bonds: "🛡️",
  gold: "🥇",
  cash: "💵",
};

const TICK_INTERVAL_MS = 150;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HistoricSimulatorScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  // -- Data loading --
  const [weeklyData, setWeeklyData] = useState<DailyPrice[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // -- Setup state --
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("balanced");
  const [allocation, setAllocation] = useState<Allocation>({
    ...DEFAULT_ALLOCATIONS.balanced,
  });
  const [showCustomize, setShowCustomize] = useState(false);

  // -- Simulation state --
  const [phase, setPhase] = useState<Phase>("setup");
  const [allTicks, setAllTicks] = useState<SimulationTick[]>([]);
  const [currentTickIndex, setCurrentTickIndex] = useState(0);
  const [actions, setActions] = useState<PlayerAction[]>([]);
  const [pausedEvent, setPausedEvent] = useState<MarketEvent | null>(null);
  const [storyBeat, setStoryBeat] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------------------------------------------------------
  // Fetch market data on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    fetch("/api/market-data")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setWeeklyData(json.data as DailyPrice[]);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load market data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------------------------------------------------
  // When risk profile changes in setup, reset allocation to the preset
  // -----------------------------------------------------------------------
  const handleProfileChange = (profile: RiskProfile) => {
    setRiskProfile(profile);
    setAllocation({ ...DEFAULT_ALLOCATIONS[profile] });
  };

  // (Allocation is set by preset selection — no manual slider needed)

  // -----------------------------------------------------------------------
  // Start simulation
  // -----------------------------------------------------------------------
  const startSimulation = () => {
    if (!weeklyData) return;

    const events = marketEventsData as MarketEvent[];
    const ticks = buildSimulation(weeklyData, events, allocation, 100_000);
    setAllTicks(ticks);
    setCurrentTickIndex(0);
    setActions([]);
    setStoryBeat(null);
    setPausedEvent(null);
    setPhase("playing");
  };

  // -----------------------------------------------------------------------
  // Playback loop
  // -----------------------------------------------------------------------
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase !== "playing") {
      stopInterval();
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentTickIndex((prev) => {
        const next = prev + 1;
        if (next >= allTicks.length) {
          stopInterval();
          // Compute score and go to results
          const score = calculateScore(allTicks, actions, riskProfile);
          setScoreResult(score);
          setPhase("results");
          return prev;
        }

        const tick = allTicks[next];

        // Story beat
        if (tick.storyBeat) {
          setStoryBeat(tick.storyBeat.line);
          if (storyTimeoutRef.current) clearTimeout(storyTimeoutRef.current);
          storyTimeoutRef.current = setTimeout(
            () => setStoryBeat(null),
            3500
          );
        }

        // Decision point — pause
        if (tick.isDecisionPoint && tick.event) {
          stopInterval();
          setPausedEvent(tick.event);
          setPhase("event_pause");
          return next;
        }

        return next;
      });
    }, TICK_INTERVAL_MS);

    return stopInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, allTicks, stopInterval]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopInterval();
      if (storyTimeoutRef.current) clearTimeout(storyTimeoutRef.current);
    };
  }, [stopInterval]);

  // -----------------------------------------------------------------------
  // Handle player decision at event pause
  // -----------------------------------------------------------------------
  const handleDecision = (
    type: "hold" | "buy_more" | "rebalance" | "panic_sell"
  ) => {
    const action: PlayerAction = { tickIndex: currentTickIndex, type };

    if (type === "panic_sell") {
      // Move to 100% cash
      const panicAlloc: Allocation = {
        swiss_stocks: 0,
        us_stocks: 0,
        eu_stocks: 0,
        bonds: 0,
        gold: 0,
        cash: 100,
      };
      action.newAllocation = panicAlloc;
      const newTicks = applyRebalance(
        allTicks,
        currentTickIndex,
        panicAlloc,
        weeklyData!
      );
      setAllTicks(newTicks);
    } else if (type === "buy_more") {
      // Increase equity weighting
      const currentAlloc = allTicks[currentTickIndex].allocation;
      const boosted: Allocation = {
        swiss_stocks: Math.min(100, currentAlloc.swiss_stocks + 5),
        us_stocks: Math.min(100, currentAlloc.us_stocks + 5),
        eu_stocks: Math.min(100, currentAlloc.eu_stocks + 5),
        bonds: Math.max(0, currentAlloc.bonds - 5),
        gold: Math.max(0, currentAlloc.gold - 5),
        cash: Math.max(0, currentAlloc.cash - 5),
      };
      // Normalize to 100
      const total = Object.values(boosted).reduce((a, b) => a + b, 0);
      if (total !== 100) {
        const scale = 100 / total;
        for (const k of Object.keys(boosted) as (keyof Allocation)[]) {
          boosted[k] = Math.round(boosted[k] * scale);
        }
        // Fix rounding
        const diff =
          100 - Object.values(boosted).reduce((a, b) => a + b, 0);
        boosted.swiss_stocks += diff;
      }
      action.newAllocation = boosted;
      const newTicks = applyRebalance(
        allTicks,
        currentTickIndex,
        boosted,
        weeklyData!
      );
      setAllTicks(newTicks);
    } else if (type === "rebalance") {
      // Reset to original profile allocation
      const original = { ...DEFAULT_ALLOCATIONS[riskProfile] };
      action.newAllocation = original;
      const newTicks = applyRebalance(
        allTicks,
        currentTickIndex,
        original,
        weeklyData!
      );
      setAllTicks(newTicks);
    }
    // "hold" doesn't change anything

    setActions((prev) => [...prev, action]);
    setPausedEvent(null);
    setPhase("playing");
  };

  // -----------------------------------------------------------------------
  // Try again
  // -----------------------------------------------------------------------
  const handleTryAgain = () => {
    setPhase("setup");
    setAllTicks([]);
    setCurrentTickIndex(0);
    setActions([]);
    setScoreResult(null);
    setStoryBeat(null);
    setPausedEvent(null);
    setAllocation({ ...DEFAULT_ALLOCATIONS[riskProfile] });
  };

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------
  const visibleTicks = allTicks.slice(0, currentTickIndex + 1);
  const currentTick = allTicks[currentTickIndex] ?? null;
  const progress =
    allTicks.length > 0 ? (currentTickIndex / (allTicks.length - 1)) * 100 : 0;

  // =======================================================================
  // RENDER: Setup phase
  // =======================================================================
  if (phase === "setup") {
    return (
      <>
        <ScreenHeader title="Historic Simulator" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-background">
          {loadError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {!weeklyData && !loadError && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
            </div>
          )}

          {weeklyData && (
            <>
              {/* Pick Your Strategy */}
              <h2 className="text-sm font-bold text-foreground mb-3">
                Choose Your Strategy
              </h2>
              <div className="space-y-3 mb-4">
                {([
                  {
                    id: "cautious" as RiskProfile,
                    icon: "🛡️",
                    label: "Cautious",
                    desc: "Protect first, grow second",
                    color: "border-blue-400",
                  },
                  {
                    id: "balanced" as RiskProfile,
                    icon: "⚖️",
                    label: "Balanced",
                    desc: "Growth with guardrails",
                    color: "border-primary",
                  },
                  {
                    id: "growth" as RiskProfile,
                    icon: "🚀",
                    label: "Growth",
                    desc: "Maximum returns, bumpier ride",
                    color: "border-emerald-400",
                  },
                ]).map((strategy) => {
                  const isSelected = riskProfile === strategy.id;
                  const a = isSelected ? allocation : DEFAULT_ALLOCATIONS[strategy.id];
                  const stocks = a.swiss_stocks + a.us_stocks + a.eu_stocks;

                  return (
                    <div key={strategy.id}>
                      <button
                        onClick={() => {
                          handleProfileChange(strategy.id);
                          setShowCustomize(false);
                        }}
                        className={cn(
                          "w-full bg-card rounded-2xl shadow-sm p-4 text-left transition-all active:scale-[0.98] border-2",
                          isSelected ? strategy.color : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{strategy.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-foreground text-sm">{strategy.label}</p>
                            <p className="text-[10px] text-muted-foreground">{strategy.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowCustomize(!showCustomize); }}
                                className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                              >
                                {showCustomize ? "Done" : "Edit ✎"}
                              </button>
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <svg className="text-foreground" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Visual allocation bar */}
                        <div className="flex h-2 rounded-full overflow-hidden">
                          <div className="bg-primary" style={{ width: `${stocks}%` }} />
                          <div className="bg-blue-400" style={{ width: `${a.bonds}%` }} />
                          <div className="bg-amber-400" style={{ width: `${a.gold}%` }} />
                          <div className="bg-muted-foreground" style={{ width: `${a.cash}%` }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1.5">
                          {stocks}% Stocks · {a.bonds}% Bonds · {a.gold}% Gold · {a.cash}% Cash
                        </p>
                      </button>

                      {/* Inline customization when Edit is tapped */}
                      {isSelected && showCustomize && (
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mt-2 space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fine-tune your allocation</p>
                          {([
                            { key: "swiss_stocks" as keyof Allocation, icon: "🇨🇭", label: "Swiss Stocks" },
                            { key: "us_stocks" as keyof Allocation, icon: "🇺🇸", label: "US Stocks" },
                            { key: "eu_stocks" as keyof Allocation, icon: "🇪🇺", label: "EU Stocks" },
                            { key: "bonds" as keyof Allocation, icon: "🛡️", label: "Bonds" },
                            { key: "gold" as keyof Allocation, icon: "🥇", label: "Gold" },
                            { key: "cash" as keyof Allocation, icon: "💵", label: "Cash" },
                          ]).map(({ key, icon, label }) => (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-foreground">{icon} {label}</span>
                                <span className="text-xs font-bold text-foreground">{allocation[key]}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={allocation[key]}
                                onChange={(e) => setAllocation(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, #FFC800 0%, #FFC800 ${allocation[key]}%, #e5e7eb ${allocation[key]}%, #e5e7eb 100%)`,
                                }}
                              />
                            </div>
                          ))}
                          {(() => {
                            const total = Object.values(allocation).reduce((a, b) => a + b, 0);
                            return (
                              <div className={cn("text-center text-xs font-bold py-1 rounded-lg", total === 100 ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50")}>
                                Total: {total}% {total !== 100 && `(needs ${100 - total > 0 ? "+" : ""}${100 - total}%)`}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary"/>Stocks</span>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-blue-400"/>Bonds</span>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-amber-400"/>Gold</span>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-muted-foreground"/>Cash</span>
              </div>

              {/* Professor note */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mb-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
                  You&apos;ll invest CHF 100,000 and travel through 20 years of real market history. Crashes will hit. The question is: can you keep your nerve?
                </p>
              </div>

              {/* Start Button */}
              {(() => {
                const total = Object.values(allocation).reduce((a, b) => a + b, 0);
                return (
                  <Button onClick={startSimulation} variant="secondary" size="lg" disabled={showCustomize && total !== 100}>
                    Start Simulation →
                  </Button>
                );
              })()}
            </>
          )}
        </div>
      </>
    );
  }

  // =======================================================================
  // RENDER: Playing phase
  // =======================================================================
  if (phase === "playing" || phase === "event_pause") {
    return (
      <div className="flex-1 flex flex-col bg-[#0F1419] relative">
        <ScreenHeader
          title=""
          onBack={onBack}
          variant="dark"
          rightAction={
            <span className="text-xs text-gray-400 font-mono">
              {currentTick?.date ?? ""}
            </span>
          }
        />

        {/* Year + Portfolio Value */}
        <div className="px-5 pt-2 pb-1 flex items-end justify-between">
          <div>
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">
              Year
            </span>
            <div className="text-white text-2xl font-bold">
              {currentTick?.year ?? "—"}
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">
              Portfolio
            </span>
            <div className="text-primary text-xl font-bold tabular-nums">
              CHF{" "}
              {(currentTick?.portfolioValue ?? 100_000).toLocaleString("de-CH")}
            </div>
            <span
              className={cn(
                "text-xs font-bold",
                (currentTick?.portfolioReturn ?? 0) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {(currentTick?.portfolioReturn ?? 0) >= 0 ? "+" : ""}
              {currentTick?.portfolioReturn ?? 0}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-2">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 px-2 min-h-0">
          <SimulationChart ticks={visibleTicks} />
        </div>

        {/* Legend */}
        <div className="px-5 py-2 flex gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-primary inline-block" /> Your
            Portfolio
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <span className="w-3 h-0.5 bg-gray-500 inline-block border-dashed" />{" "}
            SMI Benchmark
          </span>
        </div>

        {/* Story Beat overlay */}
        {storyBeat && phase === "playing" && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-white/80 text-xs leading-relaxed">
              {storyBeat}
            </p>
          </motion.div>
        )}

        {/* Event Pause Decision Overlay */}
        {phase === "event_pause" && pausedEvent && (
          <motion.div
            className="absolute inset-0 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            <motion.div
              className="relative z-10 px-4 pb-6"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Event card */}
              <div
                className={cn(
                  "rounded-2xl p-5 mb-4 border",
                  pausedEvent.severity === "critical"
                    ? "bg-red-950/90 border-red-500/40"
                    : "bg-yellow-950/90 border-yellow-500/40"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      pausedEvent.severity === "critical"
                        ? "bg-red-500/30 text-red-300"
                        : "bg-yellow-500/30 text-yellow-300"
                    )}
                  >
                    {pausedEvent.severity === "critical"
                      ? "⚠ CRISIS"
                      : "⚡ MAJOR EVENT"}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-1">
                  {pausedEvent.title}
                </h3>
                <p className="text-white/70 text-xs leading-relaxed mb-3">
                  {pausedEvent.mentorLine || pausedEvent.description}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-primary text-lg font-bold tabular-nums">
                    CHF{" "}
                    {(currentTick?.portfolioValue ?? 0).toLocaleString("de-CH")}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      (currentTick?.portfolioReturn ?? 0) >= 0
                        ? "bg-green-500/30 text-green-300"
                        : "bg-red-500/30 text-red-300"
                    )}
                  >
                    {(currentTick?.portfolioReturn ?? 0) >= 0 ? "+" : ""}
                    {currentTick?.portfolioReturn ?? 0}%
                  </span>
                </div>
              </div>

              {/* Decision buttons */}
              <div className="space-y-2">
                {(
                  [
                    {
                      type: "hold" as const,
                      icon: "💎",
                      label: "Hold — Stay the course",
                      border: "border-emerald-500/50",
                      text: "text-emerald-300",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      type: "buy_more" as const,
                      icon: "📈",
                      label: "Buy More — Into the dip",
                      border: "border-primary/50",
                      text: "text-primary",
                      bg: "bg-primary/10",
                    },
                    {
                      type: "rebalance" as const,
                      icon: "⚖️",
                      label: "Rebalance — Reset allocation",
                      border: "border-gray-400/40",
                      text: "text-gray-300",
                      bg: "bg-white/5",
                    },
                    {
                      type: "panic_sell" as const,
                      icon: "🏃",
                      label: "Panic Sell — Move to cash",
                      border: "border-red-500/50",
                      text: "text-red-300",
                      bg: "bg-red-500/10",
                    },
                  ] as const
                ).map(({ type, icon, label, border, text, bg }) => (
                  <button
                    key={type}
                    onClick={() => handleDecision(type)}
                    className={cn(
                      "w-full p-3.5 rounded-xl border text-left flex items-center gap-3 active:scale-[0.98] transition-all",
                      border,
                      text,
                      bg
                    )}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  // =======================================================================
  // RENDER: Results phase
  // =======================================================================
  if (phase === "results" && scoreResult) {
    const dims = scoreResult.dimensions;
    const dimensionList = [
      dims.diversification,
      dims.emotionalDiscipline,
      dims.longTermThinking,
      dims.riskAppropriateness,
    ];

    const renderStars = (stars: number) => {
      return Array.from({ length: 5 }, (_, i) =>
        i < stars ? "★" : "☆"
      ).join("");
    };

    return (
      <>
        <ScreenHeader title="Results" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-background">
          {/* Score Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-black text-foreground">
                {scoreResult.total}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Behavioral Score
            </h2>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </div>

          {/* Final portfolio stats */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Final Portfolio
                </span>
                <div className="text-lg font-bold text-foreground">
                  CHF{" "}
                  {allTicks[allTicks.length - 1]?.portfolioValue.toLocaleString(
                    "de-CH"
                  ) ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Return
                </span>
                <div
                  className={cn(
                    "text-lg font-bold",
                    (allTicks[allTicks.length - 1]?.portfolioReturn ?? 0) >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  )}
                >
                  {(allTicks[allTicks.length - 1]?.portfolioReturn ?? 0) >= 0
                    ? "+"
                    : ""}
                  {allTicks[allTicks.length - 1]?.portfolioReturn ?? 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Dimension Cards */}
          <div className="space-y-3 mb-4">
            {dimensionList.map((dim) => (
              <div
                key={dim.label}
                className="bg-card rounded-2xl shadow-sm border border-border p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">
                    {dim.label}
                  </span>
                  <span className="text-primary text-sm tracking-wider">
                    {renderStars(dim.stars)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dim.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Cost of Panic Selling */}
          {scoreResult.costOfPanicSelling > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 mb-4">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Cost of Panic Selling
              </span>
              <div className="text-lg font-bold text-red-600 mt-1">
                −CHF{" "}
                {scoreResult.costOfPanicSelling.toLocaleString("de-CH")}
              </div>
              <p className="text-xs text-red-600/80 mt-1">
                This is how much you lost compared to simply holding your
                original allocation.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pb-4">
            <Button onClick={handleTryAgain} size="lg">
              Try Again
            </Button>
            <Button onClick={onBack} variant="ghost" size="lg">
              Back to Academy
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Fallback (should never render)
  return null;
}
