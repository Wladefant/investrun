"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IPhoneFrame from "@/components/IPhoneFrame";
import Link from "next/link";
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

type Phase = "risk_profile" | "portfolio" | "playing" | "event_pause" | "results";

export default function SimulatePage() {
  const [phase, setPhase] = useState<Phase>("risk_profile");
  const [riskProfile, setRiskProfile] = useState<"cautious" | "balanced" | "growth">("balanced");
  const [allocation, setAllocation] = useState<Allocation>(DEFAULT_ALLOCATIONS.balanced);
  const [weeklyData, setWeeklyData] = useState<DailyPrice[]>([]);
  const [ticks, setTicks] = useState<SimulationTick[]>([]);
  const [currentTickIndex, setCurrentTickIndex] = useState(0);
  const [actions, setActions] = useState<PlayerAction[]>([]);
  const [paused, setPaused] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<MarketEvent | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load market data
  useEffect(() => {
    fetch("/api/market-data")
      .then((res) => res.json())
      .then((data) => {
        setWeeklyData(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (weeklyData.length === 0) return;

    const events = marketEventsData as MarketEvent[];
    const simTicks = buildSimulation(weeklyData, events, allocation);
    setTicks(simTicks);
    setCurrentTickIndex(0);
    setActions([]);
    setPhase("playing");
  }, [weeklyData, allocation]);

  // Simulation timer
  useEffect(() => {
    if (phase !== "playing" || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentTickIndex((prev) => {
        const next = prev + 1;
        if (next >= ticks.length) {
          // Simulation complete
          if (intervalRef.current) clearInterval(intervalRef.current);
          const result = calculateScore(ticks, actions, riskProfile);
          setScore(result);
          setPhase("results");
          return prev;
        }

        const tick = ticks[next];

        // Check for decision point (pause)
        if (tick.isDecisionPoint && tick.event) {
          setCurrentEvent(tick.event);
          setPhase("event_pause");
          if (intervalRef.current) clearInterval(intervalRef.current);
          return next;
        }

        return next;
      });
    }, 150); // ~150ms per tick = ~5 min for 20 years of weekly data

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, paused, ticks, actions, riskProfile]);

  const handleEventDecision = (type: PlayerAction["type"]) => {
    const action: PlayerAction = {
      tickIndex: currentTickIndex,
      type,
    };

    if (type === "panic_sell") {
      const panicAlloc: Allocation = {
        swiss_stocks: 0, us_stocks: 0, eu_stocks: 0,
        bonds: 0, gold: 0, cash: 100,
      };
      action.newAllocation = panicAlloc;
      const newTicks = applyRebalance(ticks, currentTickIndex, panicAlloc, weeklyData);
      setTicks(newTicks);
      setAllocation(panicAlloc);
    } else if (type === "buy_more") {
      const currentAlloc = ticks[currentTickIndex].allocation;
      const buyMoreAlloc: Allocation = {
        ...currentAlloc,
        swiss_stocks: currentAlloc.swiss_stocks + 5,
        us_stocks: currentAlloc.us_stocks + 5,
        cash: Math.max(0, currentAlloc.cash - 10),
      };
      action.newAllocation = buyMoreAlloc;
      const newTicks = applyRebalance(ticks, currentTickIndex, buyMoreAlloc, weeklyData);
      setTicks(newTicks);
      setAllocation(buyMoreAlloc);
    }

    setActions((prev) => [...prev, action]);
    setCurrentEvent(null);
    setPhase("playing");
  };

  if (loading) {
    return (
      <IPhoneFrame>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-pf-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-pf-gray-500 text-sm">Loading 20 years of market data...</p>
          </div>
        </div>
      </IPhoneFrame>
    );
  }

  return (
    <IPhoneFrame>
      <AnimatePresence mode="wait">
        {phase === "risk_profile" && (
          <RiskProfileStep
            key="risk"
            onSelect={(profile) => {
              setRiskProfile(profile);
              setAllocation(DEFAULT_ALLOCATIONS[profile]);
              setPhase("portfolio");
            }}
          />
        )}
        {phase === "portfolio" && (
          <PortfolioStep
            key="portfolio"
            allocation={allocation}
            riskProfile={riskProfile}
            onChangeAllocation={setAllocation}
            onStart={startSimulation}
            onBack={() => setPhase("risk_profile")}
          />
        )}
        {(phase === "playing" || phase === "event_pause") && (
          <PlayingStep
            key="playing"
            ticks={ticks}
            currentTickIndex={currentTickIndex}
            currentEvent={currentEvent}
            isPaused={phase === "event_pause"}
            onDecision={handleEventDecision}
          />
        )}
        {phase === "results" && score && (
          <ResultsStep
            key="results"
            score={score}
            ticks={ticks}
            riskProfile={riskProfile}
          />
        )}
      </AnimatePresence>
    </IPhoneFrame>
  );
}

// --- Sub-components ---

function RiskProfileStep({
  onSelect,
}: {
  onSelect: (profile: "cautious" | "balanced" | "growth") => void;
}) {
  const profiles = [
    {
      id: "cautious" as const,
      icon: "🛡️",
      label: "Cautious",
      desc: "Protect first, grow second.",
    },
    {
      id: "balanced" as const,
      icon: "⚖️",
      label: "Balanced",
      desc: "Growth with guardrails.",
    },
    {
      id: "growth" as const,
      icon: "🚀",
      label: "Growth",
      desc: "Maximum returns. Bumpier ride.",
    },
  ];

  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Link href="/" className="text-pf-gray-500 text-sm mb-4">← Back</Link>
      <h1 className="text-2xl font-extrabold mb-2">What kind of investor are you?</h1>
      <p className="text-pf-gray-500 text-sm mb-8">
        This sets your starting portfolio. You can change it anytime.
      </p>

      <div className="flex flex-col gap-4 flex-1 justify-center">
        {profiles.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="flex items-center gap-4 p-5 rounded-2xl border border-pf-gray-800 bg-pf-gray-900 active:scale-[0.98] active:border-pf-yellow transition-all text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <span className="text-3xl">{p.icon}</span>
            <div>
              <p className="font-bold">{p.label}</p>
              <p className="text-pf-gray-500 text-sm">{p.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function PortfolioStep({
  allocation,
  riskProfile,
  onChangeAllocation,
  onStart,
  onBack,
}: {
  allocation: Allocation;
  riskProfile: string;
  onChangeAllocation: (a: Allocation) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const categories = [
    { key: "swiss_stocks" as const, icon: "🇨🇭", label: "Swiss Stocks" },
    { key: "us_stocks" as const, icon: "🇺🇸", label: "US Stocks" },
    { key: "eu_stocks" as const, icon: "🇪🇺", label: "EU Stocks" },
    { key: "bonds" as const, icon: "🛡️", label: "Bonds" },
    { key: "gold" as const, icon: "🥇", label: "Gold" },
    { key: "cash" as const, icon: "💵", label: "Cash" },
  ];

  const total = Object.values(allocation).reduce((a, b) => a + b, 0);

  const handleChange = (key: keyof Allocation, value: number) => {
    onChangeAllocation({ ...allocation, [key]: value });
  };

  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button onClick={onBack} className="text-pf-gray-500 text-sm mb-4 self-start">
        ← Back
      </button>
      <h1 className="text-xl font-extrabold mb-1">Build Your Portfolio</h1>
      <p className="text-pf-gray-500 text-xs mb-4">
        {riskProfile} profile · CHF 100,000 starting capital
      </p>

      <div className="flex flex-col gap-3 flex-1">
        {categories.map(({ key, icon, label }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm flex items-center gap-2">
                {icon} {label}
              </span>
              <span className="text-sm font-bold text-pf-yellow">
                {allocation[key]}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={allocation[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #FFC800 ${allocation[key]}%, #404040 ${allocation[key]}%)`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className={`text-center text-sm font-bold mb-3 ${total === 100 ? "text-pf-green" : "text-pf-red"}`}>
          Total: {total}% {total !== 100 && `(must be 100%)`}
        </div>
        <button
          onClick={onStart}
          disabled={total !== 100}
          className="w-full bg-pf-yellow text-pf-black font-bold py-4 rounded-2xl disabled:opacity-30 active:scale-[0.98] transition-all"
        >
          Start Simulation →
        </button>
      </div>
    </motion.div>
  );
}

function PlayingStep({
  ticks,
  currentTickIndex,
  currentEvent,
  isPaused,
  onDecision,
}: {
  ticks: SimulationTick[];
  currentTickIndex: number;
  currentEvent: MarketEvent | null;
  isPaused: boolean;
  onDecision: (type: PlayerAction["type"]) => void;
}) {
  const tick = ticks[currentTickIndex];
  if (!tick) return null;

  const progress = (currentTickIndex / ticks.length) * 100;
  const visibleTicks = ticks.slice(0, currentTickIndex + 1);

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Top bar */}
      <div className="px-4 py-3 border-b border-pf-gray-800">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-pf-gray-500">Year {tick.year}</span>
          <span className={`text-sm font-bold ${tick.portfolioReturn >= 0 ? "text-pf-green" : "text-pf-red"}`}>
            {tick.portfolioReturn >= 0 ? "+" : ""}{tick.portfolioReturn}%
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-extrabold">
            CHF {tick.portfolioValue.toLocaleString("de-CH")}
          </span>
        </div>
        <div className="w-full h-1 bg-pf-gray-800 rounded-full">
          <div
            className="h-full bg-pf-yellow rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 py-2">
        <SimulationChart ticks={visibleTicks} />
      </div>

      {/* Story beat */}
      {tick.storyBeat && (
        <motion.div
          className="mx-4 mb-2 p-3 bg-pf-gray-900 border border-pf-gray-800 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-pf-gray-300 text-xs italic">{tick.storyBeat.line}</p>
        </motion.div>
      )}

      {/* Event decision overlay */}
      <AnimatePresence>
        {isPaused && currentEvent && (
          <motion.div
            className="absolute inset-0 bg-pf-black/90 flex flex-col justify-end z-40 rounded-[52px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-6">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                currentEvent.severity === "critical" ? "bg-pf-red/20 text-pf-red" : "bg-pf-yellow/20 text-pf-yellow"
              }`}>
                {currentEvent.severity === "critical" ? "⚠️ CRISIS" : "📰 MAJOR EVENT"}
              </div>
              <h2 className="text-xl font-extrabold mb-2">{currentEvent.title}</h2>
              <p className="text-pf-gray-300 text-sm mb-6">
                {currentEvent.mentorLine || currentEvent.description}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onDecision("hold")}
                  className="w-full py-3 bg-pf-green/20 border border-pf-green/40 text-pf-green font-bold rounded-xl active:scale-[0.98]"
                >
                  💎 Hold — Stay the course
                </button>
                <button
                  onClick={() => onDecision("buy_more")}
                  className="w-full py-3 bg-pf-yellow/20 border border-pf-yellow/40 text-pf-yellow font-bold rounded-xl active:scale-[0.98]"
                >
                  📈 Buy More — Increase stocks
                </button>
                <button
                  onClick={() => onDecision("rebalance")}
                  className="w-full py-3 bg-pf-gray-800 border border-pf-gray-700 text-pf-gray-300 font-bold rounded-xl active:scale-[0.98]"
                >
                  ⚖️ Rebalance — Adjust mix
                </button>
                <button
                  onClick={() => onDecision("panic_sell")}
                  className="w-full py-3 bg-pf-red/10 border border-pf-red/30 text-pf-red font-bold rounded-xl active:scale-[0.98]"
                >
                  🏃 Panic Sell — Move to cash
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultsStep({
  score,
  ticks,
  riskProfile,
}: {
  score: ScoreResult;
  ticks: SimulationTick[];
  riskProfile: string;
}) {
  const finalTick = ticks[ticks.length - 1];
  const dims = score.dimensions;

  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Score header */}
      <div className="text-center mb-6">
        <motion.p
          className="text-6xl font-extrabold text-pf-yellow mb-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        >
          {score.total}
        </motion.p>
        <p className="text-pf-gray-500 text-sm">YOUR FUTURE SCORE</p>
        <p className="text-pf-gray-300 text-xs mt-1">
          Final: CHF {finalTick.portfolioValue.toLocaleString("de-CH")} ({finalTick.portfolioReturn >= 0 ? "+" : ""}{finalTick.portfolioReturn}%)
        </p>
      </div>

      {/* Dimensions */}
      <div className="flex flex-col gap-4 mb-6">
        {Object.values(dims).map((dim, i) => (
          <motion.div
            key={dim.label}
            className="bg-pf-gray-900 rounded-xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + 0.1 * i }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">{dim.label}</span>
              <span className="text-pf-yellow font-bold text-sm">
                {"★".repeat(dim.stars)}{"☆".repeat(5 - dim.stars)} ({dim.score})
              </span>
            </div>
            <p className="text-pf-gray-400 text-xs">{dim.explanation}</p>
          </motion.div>
        ))}
      </div>

      {/* Cost of panic selling */}
      {score.costOfPanicSelling > 0 && (
        <motion.div
          className="bg-pf-red/10 border border-pf-red/30 rounded-xl p-4 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-pf-red text-2xl font-extrabold">
            CHF {score.costOfPanicSelling.toLocaleString("de-CH")}
          </p>
          <p className="text-pf-gray-400 text-xs mt-1">
            Estimated cost of your panic selling.
            That&apos;s real money left on the table.
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <Link href="/simulate">
          <button className="w-full bg-pf-yellow text-pf-black font-bold py-4 rounded-2xl active:scale-[0.98]">
            Try Again →
          </button>
        </Link>
        <Link href="/">
          <button className="w-full text-pf-gray-500 text-sm py-2">
            Back to menu
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
