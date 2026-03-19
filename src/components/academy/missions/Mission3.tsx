"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertTriangle, TrendingDown, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface CrashWeek {
  week: number;
  label: string;
  portfolioValue: number;
  change: number; // cumulative %
  news?: string;
  isDecisionPoint?: boolean;
  professorLine?: string;
}

const CRASH_DATA: CrashWeek[] = [
  { week: 1, label: "Jan W1", portfolioValue: 100000, change: 0 },
  { week: 2, label: "Jan W2", portfolioValue: 101200, change: 1.2 },
  { week: 3, label: "Jan W3", portfolioValue: 102300, change: 2.3 },
  { week: 4, label: "Feb W1", portfolioValue: 101800, change: 1.8 },
  { week: 5, label: "Feb W2", portfolioValue: 103100, change: 3.1, news: "Markets steady. Your portfolio is growing nicely." },
  { week: 6, label: "Feb W3", portfolioValue: 101500, change: 1.5, news: "A respiratory virus is spreading in Asia. WHO monitoring." },
  { week: 7, label: "Feb W4", portfolioValue: 97000, change: -3.0, news: "COVID-19 cases reported in Europe. Markets dip 3%." },
  { week: 8, label: "Mar W1", portfolioValue: 91000, change: -9.0, news: "Italy in lockdown. Oil prices collapse. Fear rising." },
  {
    week: 9, label: "Mar W2", portfolioValue: 78000, change: -22.0,
    news: "WHO declares global pandemic. Circuit breakers triggered.",
    isDecisionPoint: true,
    professorLine: "Your portfolio is down 22%. The news says it could get worse. Other academy students are selling. What do you do?",
  },
  { week: 10, label: "Mar W3", portfolioValue: 69000, change: -31.0, news: "Markets in freefall. Worst week since 2008." },
  {
    week: 11, label: "Mar W4", portfolioValue: 66000, change: -34.0,
    news: "Global lockdowns. Unemployment surging. Stimulus announced.",
    isDecisionPoint: true,
    professorLine: "Down 34% from the peak. CHF 34,000 gone in 3 weeks. This is the hardest moment. The absolute bottom. What do you do?",
  },
  { week: 12, label: "Apr W1", portfolioValue: 72000, change: -28.0, news: "First signs of recovery. Central banks inject liquidity." },
  { week: 13, label: "Apr W2", portfolioValue: 76000, change: -24.0 },
  { week: 14, label: "May W1", portfolioValue: 82000, change: -18.0, news: "Markets rallying. Recovery faster than expected." },
  { week: 15, label: "Jun W1", portfolioValue: 88000, change: -12.0 },
  { week: 16, label: "Jul W1", portfolioValue: 93000, change: -7.0 },
  { week: 17, label: "Aug W1", portfolioValue: 98000, change: -2.0, news: "Vaccine trials showing promise. Optimism returns." },
  { week: 18, label: "Sep W1", portfolioValue: 101000, change: 1.0 },
  { week: 19, label: "Oct W1", portfolioValue: 104000, change: 4.0 },
  { week: 20, label: "Nov W1", portfolioValue: 112000, change: 12.0, news: "Vaccine approved! Markets surge to new highs." },
  { week: 21, label: "Dec W1", portfolioValue: 118000, change: 18.0 },
  { week: 22, label: "Dec W4", portfolioValue: 122000, change: 22.0 },
];

type Decision = "sell" | "sell_half" | "hold" | "buy_more";

function getDecisionMultiplier(decision: Decision): number {
  switch (decision) {
    case "sell": return 0; // moved to cash, missed recovery
    case "sell_half": return 0.5;
    case "hold": return 1;
    case "buy_more": return 1.3;
  }
}

function getDecisionScore(decisions: Decision[]): number {
  let score = 50;
  for (const d of decisions) {
    if (d === "hold") score += 20;
    else if (d === "buy_more") score += 25;
    else if (d === "sell_half") score += 5;
    else if (d === "sell") score -= 15;
  }
  return Math.max(0, Math.min(100, score));
}

export function Mission3Screen({
  onComplete,
  onBack,
}: {
  onComplete: (score: number, crashBehavior: string) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<"briefing" | "simulation" | "decision" | "aftermath" | "debrief">("briefing");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [decisionPointIndex, setDecisionPointIndex] = useState(0);
  const [showNews, setShowNews] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulation timer
  useEffect(() => {
    if (phase !== "simulation") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentWeek((prev) => {
        const next = prev + 1;
        if (next >= CRASH_DATA.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPhase("debrief");
          return prev;
        }

        const week = CRASH_DATA[next];

        // Show news
        if (week.news) {
          setShowNews(week.news);
          setTimeout(() => setShowNews(null), 2500);
        }

        // Decision point
        if (week.isDecisionPoint) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPhase("decision");
          return next;
        }

        return next;
      });
    }, 400);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const handleDecision = (decision: Decision) => {
    setDecisions((prev) => [...prev, decision]);
    setDecisionPointIndex((i) => i + 1);
    setPhase("simulation");
  };

  const currentData = CRASH_DATA.slice(0, currentWeek + 1);
  const currentWeekData = CRASH_DATA[currentWeek];

  // Adjust final values based on decisions
  const getAdjustedValue = () => {
    if (decisions.length === 0) return currentWeekData?.portfolioValue || 100000;
    const lastDecision = decisions[decisions.length - 1];
    const mult = getDecisionMultiplier(lastDecision);
    const base = currentWeekData?.portfolioValue || 100000;
    if (lastDecision === "sell") {
      // Sold at decision point, so value is frozen
      const soldAt = CRASH_DATA.find((d) => d.isDecisionPoint)?.portfolioValue || 78000;
      return soldAt;
    }
    return Math.round(base * mult + base * (1 - mult));
  };

  if (phase === "briefing") {
    return (
      <>
        <ScreenHeader title="Mission 3" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center text-foregroundxl mb-6 shadow-lg">
              📉
            </div>
            <h1 className="text-primary-foregroundxl font-bold text-foreground mb-2">When Markets Bleed</h1>
            <p className="text-muted-foreground text-sm mb-6">Volatility & Crashes</p>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
                This is your hardest test. You start with a diversified CHF 100,000
                portfolio. Then a crisis hits — the fastest market crash in history.
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                Your portfolio will fall. The question is: <span className="font-bold">what will you do?</span>
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-100 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-xs font-bold text-red-700">Warning</span>
              </div>
              <p className="text-xs text-red-600">
                92% of real investors made their worst mistake during this crash.
                Will you be different?
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="bg-muted px-2.5 py-1 rounded-full">⏱ 4-5 min</span>
              <span className="bg-muted px-2.5 py-1 rounded-full">2 decision points</span>
              <span className="bg-muted px-2.5 py-1 rounded-full">+200 XP</span>
            </div>
          </motion.div>

          <Button onClick={() => setPhase("simulation")} size="lg" className="w-full" variant="secondary">
            <TrendingDown size={18} />
            Enter the Crash
          </Button>
        </div>
      </>
    );
  }

  if (phase === "decision") {
    return (
      <motion.div
        className="flex-1 flex flex-col bg-gradient-to-b from-red-950 via-red-900 to-[#1A2332]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ScreenHeader title="" variant="dark" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-4 justify-end">
          {/* Alert */}
          <motion.div
            className="bg-red-500/20 border border-red-500/40 rounded-2xl p-5 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-400" />
              <span className="text-red-300 text-xs font-bold">⚠️ MARKET CRISIS</span>
            </div>
            <p className="text-white text-sm font-bold leading-relaxed">
              {currentWeekData?.professorLine}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-red-400 text-primary-foregroundxl font-bold">
                CHF {(currentWeekData?.portfolioValue || 0).toLocaleString("de-CH")}
              </span>
              <span className="bg-red-500/30 px-2 py-0.5 rounded-full text-red-300 text-xs font-bold">
                {currentWeekData?.change}%
              </span>
            </div>
          </motion.div>

          {/* Decision buttons */}
          <div className="space-y-2.5">
            {[
              { decision: "hold" as Decision, icon: "💎", label: "Hold — Stay the course", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
              { decision: "buy_more" as Decision, icon: "📈", label: "Buy More — Into the dip", color: "bg-primary/20 border-primary/40 text-primary" },
              { decision: "sell_half" as Decision, icon: "⚖️", label: "Sell Half — Reduce risk", color: "bg-card/10 border-white/20 text-muted-foreground" },
              { decision: "sell" as Decision, icon: "🏃", label: "Panic Sell — Move to cash", color: "bg-red-500/20 border-red-500/40 text-red-300" },
            ].map(({ decision, icon, label, color }) => (
              <motion.button
                key={decision}
                onClick={() => handleDecision(decision)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left flex items-center gap-3 active:scale-[0.98] transition-all",
                  color
                )}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-bold">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (phase === "debrief") {
    const score = getDecisionScore(decisions);
    const primaryDecision = decisions[0] || "hold";
    const held = primaryDecision === "hold" || primaryDecision === "buy_more";

    // Calculate counterfactual
    const heldFinal = CRASH_DATA[CRASH_DATA.length - 1].portfolioValue;
    const soldValue = CRASH_DATA.find((d) => d.isDecisionPoint)?.portfolioValue || 78000;
    const costOfSelling = held ? 0 : heldFinal - soldValue;

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
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4",
              held ? "bg-emerald-100" : "bg-red-100"
            )}>
              {held ? "💎" : "😰"}
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {held ? "You held through the crash." : "You sold during the crash."}
            </h2>
          </motion.div>

          {/* What happened chart */}
          <motion.div
            className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs font-bold text-muted-foreground mb-2">WHAT ACTUALLY HAPPENED</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CRASH_DATA.map((d) => ({
                  week: d.label,
                  value: d.change,
                }))}>
                  <XAxis dataKey="week" tick={false} axisLine={{ stroke: "#e5e5e5" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#999" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="#e5e5e5" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="value" stroke="#FFC800" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              The market crashed 34%, then recovered +22% within months.
            </p>
          </motion.div>

          {/* Cost of selling */}
          {!held && costOfSelling > 0 && (
            <motion.div
              className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-red-500 text-foregroundxl font-bold">
                CHF {costOfSelling.toLocaleString("de-CH")}
              </p>
              <p className="text-red-600 text-xs mt-1">
                The cost of panic selling. If you&apos;d held, you&apos;d have
                CHF {heldFinal.toLocaleString("de-CH")} — not CHF {soldValue.toLocaleString("de-CH")}.
              </p>
            </motion.div>
          )}

          {/* Professor debrief */}
          <motion.div
            className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
              {held
                ? "You held through the worst of it. That takes discipline. In 20 years of market data, every single crash recovered. Every one. The lesson: time in the market beats timing the market."
                : "You sold at the bottom. That locks in the loss permanently. The market recovered within months — but you weren't in it. This is the single most expensive mistake in investing. The good news? You just experienced it here, not with real money. You won't forget this."}
            </p>
          </motion.div>

          <Button
            onClick={() => onComplete(score, primaryDecision)}
            size="lg"
            className="w-full"
          >
            Complete Mission
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // Simulation phase (playing)
  return (
    <div className="flex-1 flex flex-col bg-[#0F1419]">
      <ScreenHeader title="" variant="dark" onBack={onBack} />

      {/* Portfolio value */}
      <div className="px-5 pb-4">
        <p className="text-muted-foreground text-xs mb-1">Your Portfolio</p>
        <div className="flex items-baseline gap-3">
          <span className="text-white text-foregroundxl font-bold">
            CHF {(currentWeekData?.portfolioValue || 100000).toLocaleString("de-CH")}
          </span>
          <span className={cn(
            "text-sm font-bold px-2 py-0.5 rounded-full",
            (currentWeekData?.change || 0) >= 0
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          )}>
            {(currentWeekData?.change || 0) >= 0 ? "+" : ""}{currentWeekData?.change || 0}%
          </span>
        </div>
        <p className="text-muted-foreground text-xs mt-1">{currentWeekData?.label || ""}</p>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData.map((d) => ({ week: d.label, value: d.change }))}>
            <XAxis dataKey="week" tick={false} axisLine={false} />
            <YAxis hide domain={[-40, 25]} />
            <ReferenceLine y={0} stroke="#333" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="value"
              stroke={(currentWeekData?.change || 0) >= 0 ? "#22C55E" : "#EF4444"}
              strokeWidth={2.5}
              dot={false}
              animationDuration={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* News overlay */}
      <AnimatePresence>
        {showNews && (
          <motion.div
            className="absolute bottom-24 left-4 right-4 bg-card/95 backdrop-blur rounded-xl p-4 shadow-lg border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-start gap-2">
              <Newspaper size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-foreground font-medium">{showNews}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="px-5 py-3">
        <div className="w-full h-1 bg-card/10 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(currentWeek / CRASH_DATA.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
