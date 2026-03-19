"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ─── Compound Growth Math ─────────────────────────────────────────
// FV = PMT * [((1 + r)^n - 1) / r]
// For a lump sum growing: FV = PV * (1 + r)^n

function futureValueAnnuity(pmt: number, rateMonthly: number, months: number): number {
  if (rateMonthly === 0) return pmt * months;
  return pmt * ((Math.pow(1 + rateMonthly, months) - 1) / rateMonthly);
}

function futureValueLumpSum(pv: number, rateMonthly: number, months: number): number {
  return pv * Math.pow(1 + rateMonthly, months);
}

// ─── Investor Simulation ──────────────────────────────────────────

interface YearSnapshot {
  age: number;
  investorA: number;
  investorB: number;
  investedA: number;
  investedB: number;
}

function buildSimulation(): YearSnapshot[] {
  const r = 0.07 / 12; // 7% annual, monthly compounding
  const pmt = 200;
  const snapshots: YearSnapshot[] = [];

  for (let age = 25; age <= 65; age++) {
    // Investor A: contributes 200/month from 25-35, then lets it grow
    let valA: number;
    let investedA: number;
    if (age <= 35) {
      const monthsContributing = (age - 25) * 12;
      valA = futureValueAnnuity(pmt, r, monthsContributing);
      investedA = pmt * monthsContributing;
    } else {
      // Value at 35 after 10 years of contributions
      const valAt35 = futureValueAnnuity(pmt, r, 10 * 12);
      const monthsGrowing = (age - 35) * 12;
      valA = futureValueLumpSum(valAt35, r, monthsGrowing);
      investedA = 24000; // fixed at 200 * 120
    }

    // Investor B: contributes 200/month from 35-65
    let valB: number;
    let investedB: number;
    if (age < 35) {
      valB = 0;
      investedB = 0;
    } else {
      const monthsContributing = (age - 35) * 12;
      valB = futureValueAnnuity(pmt, r, monthsContributing);
      investedB = pmt * monthsContributing;
    }

    snapshots.push({
      age,
      investorA: Math.round(valA),
      investorB: Math.round(valB),
      investedA: Math.round(investedA),
      investedB: Math.round(investedB),
    });
  }

  return snapshots;
}

const FULL_SIMULATION = buildSimulation();
const FINAL = FULL_SIMULATION[FULL_SIMULATION.length - 1];

// ─── Quiz Data ────────────────────────────────────────────────────

const QUIZ_OPTIONS = [
  { label: "Pick the best stocks", icon: "🎰", correct: false },
  { label: "Start as early as possible", icon: "🌱", correct: true },
  { label: "Wait until you have enough money", icon: "⏳", correct: false },
  { label: "Time the market perfectly", icon: "📊", correct: false },
];

const QUIZ_REACTIONS: Record<number, string> = {
  0: "Stock picking sounds exciting, but research shows most professionals can't consistently beat the market. The real edge isn't picking winners -- it's time.",
  1: "Exactly right. Starting early is the single most powerful advantage you have. A 25-year-old investing CHF 200/month beats a 35-year-old investing CHF 200/month for 30 years. Time is the ultimate superpower.",
  2: "This is the most common excuse -- and the most expensive one. Even CHF 50/month at age 20 is worth more than CHF 500/month starting at 40. There's no 'enough' -- just 'early enough'.",
  3: "Nobody can time the market consistently. Even the best fund managers fail at it. The real secret is time IN the market, not timing the market.",
};

// ─── Risk Levels for Planner ──────────────────────────────────────

const RISK_LEVELS = [
  { label: "Cautious", rate: 0.03, color: "text-blue-600" },
  { label: "Balanced", rate: 0.05, color: "text-primary" },
  { label: "Growth", rate: 0.07, color: "text-emerald-600" },
];

// ─── Component ────────────────────────────────────────────────────

export function Mission4Screen({
  onComplete,
  onBack,
}: {
  onComplete: (score: number, data?: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<
    "briefing" | "comparison" | "reveal" | "planner" | "quiz"
  >("briefing");

  // Comparison animation state
  const [animYear, setAnimYear] = useState(0); // index into FULL_SIMULATION
  const [animDone, setAnimDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Planner state
  const [monthlyAmount, setMonthlyAmount] = useState(300);
  const [horizon, setHorizon] = useState(20);
  const [riskLevel, setRiskLevel] = useState(1); // index into RISK_LEVELS

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // ── Comparison Animation ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "comparison") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setAnimYear((prev) => {
        const next = prev + 1;
        if (next >= FULL_SIMULATION.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setAnimDone(true);
          return prev;
        }
        return next;
      });
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // ── Planner Calculations ──────────────────────────────────────
  const plannerCalc = useCallback(() => {
    const r = RISK_LEVELS[riskLevel].rate / 12;
    const months = horizon * 12;
    const totalInvested = monthlyAmount * months;
    const projected = Math.round(futureValueAnnuity(monthlyAmount, r, months));
    const growth = projected - totalInvested;
    return { totalInvested, projected, growth };
  }, [monthlyAmount, horizon, riskLevel]);

  const planResult = plannerCalc();

  const getProfessorPlanComment = () => {
    const ratio = planResult.projected / planResult.totalInvested;
    if (horizon >= 30 && riskLevel === 2) {
      return "Now THAT is a long-term plan. With 30+ years and a growth allocation, compound interest becomes truly extraordinary.";
    }
    if (ratio > 3) {
      return "Look at that growth multiple! Your money is working harder than you are. That's the power of compound interest over time.";
    }
    if (ratio > 2) {
      return "Solid plan. Your investments would more than double. The longer you hold, the more compound growth accelerates.";
    }
    if (horizon <= 10) {
      return "A shorter horizon limits compound growth. If you can extend even 5 more years, the difference is dramatic.";
    }
    return "A reasonable start. Consider how increasing either the horizon or the monthly amount would amplify your results.";
  };

  // ── Briefing ──────────────────────────────────────────────────
  if (phase === "briefing") {
    return (
      <>
        <ScreenHeader title="Mission 4" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center text-foregroundxl mb-6 shadow-lg">
              ⏳
            </div>
            <h1 className="text-primary-foregroundxl font-bold text-foreground mb-2">
              The Long Game
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Compound Growth
            </p>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">
                  Professor Fortuna:
                </span>{" "}
                Time is the most powerful force in investing. Let me show you
                why.
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                I&apos;m going to introduce you to two investors. Same monthly
                amount. Same returns. But one secret difference that changes
                everything.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
              <span className="bg-muted px-2.5 py-1 rounded-full">
                ⏱ 3-4 min
              </span>
              <span className="bg-muted px-2.5 py-1 rounded-full">
                Interactive
              </span>
              <span className="bg-muted px-2.5 py-1 rounded-full">
                +130 XP
              </span>
            </div>
          </motion.div>

          <Button
            onClick={() => setPhase("comparison")}
            size="lg"
            className="w-full"
          >
            Start Mission
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // ── Comparison Phase ──────────────────────────────────────────
  if (phase === "comparison") {
    const current = FULL_SIMULATION[animYear];

    return (
      <>
        <ScreenHeader title="Mission 4" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-bold text-muted-foreground mb-3 text-center">
              TWO INVESTORS, SAME CHF 200/MONTH, 7% RETURN
            </p>

            {/* Side-by-side cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Investor A */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-1.5 bg-emerald-500" />
                <div className="p-3">
                  <p className="text-xs font-bold text-emerald-600 mb-1">
                    INVESTOR A
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Starts at 25, stops at 35
                  </p>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Age</p>
                      <p className="text-lg font-bold text-foreground">
                        {current.age}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Invested
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        CHF{" "}
                        {current.investedA.toLocaleString("de-CH")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Value
                      </p>
                      <p className="text-base font-bold text-emerald-600">
                        CHF{" "}
                        {current.investorA.toLocaleString("de-CH")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investor B */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-1.5 bg-blue-500" />
                <div className="p-3">
                  <p className="text-xs font-bold text-blue-600 mb-1">
                    INVESTOR B
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Starts at 35, invests 30 yrs
                  </p>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Age</p>
                      <p className="text-lg font-bold text-foreground">
                        {current.age}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Invested
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        CHF{" "}
                        {current.investedB.toLocaleString("de-CH")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Value
                      </p>
                      <p className="text-base font-bold text-blue-600">
                        CHF{" "}
                        {current.investorB.toLocaleString("de-CH")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-[#FFD633] rounded-full"
                animate={{
                  width: `${((animYear + 1) / FULL_SIMULATION.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Status annotation */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-bold text-primary">
                  Professor Fortuna:
                </span>{" "}
                {current.age < 35
                  ? "Both investors are in their early years. Watch what happens when Investor A stops contributing..."
                  : current.age < 50
                    ? "Investor A stopped contributing at 35, but their money keeps growing. Investor B is catching up with fresh contributions..."
                    : !animDone
                      ? "We're approaching the finish line. Look at how close they are despite vastly different contribution amounts..."
                      : "And there it is. Investor A wins -- with a third of the money invested."}
              </p>
            </div>
          </motion.div>

          {animDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={() => setPhase("reveal")}
                size="lg"
                className="w-full"
              >
                See the Reveal
                <ChevronRight size={18} />
              </Button>
            </motion.div>
          )}
        </div>
      </>
    );
  }

  // ── Reveal Phase ──────────────────────────────────────────────
  if (phase === "reveal") {
    const difference = FINAL.investorA - FINAL.investorB;
    const chartData = FULL_SIMULATION.map((s) => ({
      age: s.age,
      A: s.investorA,
      B: s.investorB,
    }));

    return (
      <>
        <ScreenHeader title="The Reveal" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Big number reveal */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 12 }}
          >
            <p className="text-sm font-bold text-muted-foreground mb-2">
              STARTING 10 YEARS EARLIER WAS WORTH
            </p>
            <p className="text-4xl font-bold text-emerald-600">
              CHF {Math.abs(difference).toLocaleString("de-CH")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">more</p>
          </motion.div>

          {/* Comparison summary */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
              <p className="text-xs font-bold text-emerald-600 mb-1">
                INVESTOR A
              </p>
              <p className="text-lg font-bold text-emerald-700">
                CHF {FINAL.investorA.toLocaleString("de-CH")}
              </p>
              <p className="text-[10px] text-emerald-600 mt-1">
                Invested only CHF 24,000
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
              <p className="text-xs font-bold text-blue-600 mb-1">
                INVESTOR B
              </p>
              <p className="text-lg font-bold text-blue-700">
                CHF {FINAL.investorB.toLocaleString("de-CH")}
              </p>
              <p className="text-[10px] text-blue-600 mt-1">
                Invested CHF 72,000
              </p>
            </div>
          </motion.div>

          {/* Growth chart */}
          <motion.div
            className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs font-bold text-muted-foreground mb-2">
              GROWTH OVER TIME
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 10, fill: "#999" }}
                    tickFormatter={(v) => `${v}`}
                    axisLine={{ stroke: "#e5e5e5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#999" }}
                    tickFormatter={(v) =>
                      `${Math.round(v / 1000)}k`
                    }
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `CHF ${value.toLocaleString("de-CH")}`,
                    ]}
                    labelFormatter={(label) => `Age ${label}`}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="A"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    name="Investor A"
                  />
                  <Area
                    type="monotone"
                    dataKey="B"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    name="Investor B"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Professor explanation */}
          <motion.div
            className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-primary">
                Professor Fortuna:
              </span>{" "}
              Investor A put in a third of the money but started 10 years
              earlier. Compound growth did the rest. Einstein reportedly called
              it the eighth wonder of the world.
            </p>
            <p className="text-sm text-foreground leading-relaxed mt-3">
              The lesson is simple: it&apos;s not about how much you invest.
              It&apos;s about how long your money has to grow.
            </p>
          </motion.div>

          <Button
            onClick={() => setPhase("planner")}
            size="lg"
            className="w-full"
          >
            Build Your Plan
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // ── Planner Phase ─────────────────────────────────────────────
  if (phase === "planner") {
    return (
      <>
        <ScreenHeader title="Your Plan" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-1">
              Now build YOUR plan
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Adjust the sliders to see how compound growth works for you.
            </p>

            {/* Monthly Amount Slider */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-muted-foreground">
                  MONTHLY INVESTMENT
                </p>
                <p className="text-sm font-bold text-foreground">
                  CHF {monthlyAmount}
                </p>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={50}
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#FFC800]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>CHF 50</span>
                <span>CHF 1,000</span>
              </div>
            </div>

            {/* Horizon Slider */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-muted-foreground">
                  INVESTMENT HORIZON
                </p>
                <p className="text-sm font-bold text-foreground">
                  {horizon} years
                </p>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#FFC800]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>5 years</span>
                <span>40 years</span>
              </div>
            </div>

            {/* Risk Level */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4">
              <p className="text-xs font-bold text-muted-foreground mb-3">
                RISK LEVEL
              </p>
              <div className="grid grid-cols-3 gap-2">
                {RISK_LEVELS.map((level, i) => (
                  <button
                    key={level.label}
                    onClick={() => setRiskLevel(i)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all",
                      riskLevel === i
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <p className="text-xs font-bold text-foreground">
                      {level.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(level.rate * 100).toFixed(0)}% return
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <motion.div
              className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-4"
              key={`${monthlyAmount}-${horizon}-${riskLevel}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs font-bold text-muted-foreground mb-3">
                YOUR PROJECTION
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Total Invested
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    CHF{" "}
                    {planResult.totalInvested.toLocaleString("de-CH")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Projected Value
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    CHF{" "}
                    {planResult.projected.toLocaleString("de-CH")}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Growth from Compound Interest
                  </span>
                  <span className="text-sm font-bold text-primary">
                    + CHF{" "}
                    {planResult.growth.toLocaleString("de-CH")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Your money works for you
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {horizon} years
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Professor comment */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-6">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-bold text-primary">
                  Professor Fortuna:
                </span>{" "}
                {getProfessorPlanComment()}
              </p>
            </div>

            <Button
              onClick={() => setPhase("quiz")}
              size="lg"
              className="w-full"
            >
              Final Question
              <ChevronRight size={18} />
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Quiz Phase ────────────────────────────────────────────────
  const handleQuizAnswer = (index: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(index);
  };

  const handleComplete = () => {
    const correct = quizAnswer !== null && QUIZ_OPTIONS[quizAnswer].correct;
    const base = correct ? 85 : 55;
    const bonus = Math.floor(Math.random() * 16); // 0-15
    const score = base + bonus;
    onComplete(score, { longTermScore: score });
  };

  return (
    <>
      <ScreenHeader title="Final Question" onBack={onBack} />
      <div className="flex-1 flex flex-col px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-5">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-primary">
                Professor Fortuna:
              </span>{" "}
              If you could give one piece of investing advice to your
              18-year-old self, what would it be?
            </p>
          </div>

          <div className="space-y-2.5 mb-4">
            {QUIZ_OPTIONS.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleQuizAnswer(i)}
                disabled={quizAnswer !== null}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                  quizAnswer === i
                    ? opt.correct
                      ? "bg-emerald-50 border-emerald-400 shadow-sm"
                      : "bg-red-50 border-red-300 shadow-sm"
                    : quizAnswer !== null
                      ? opt.correct
                        ? "bg-emerald-50 border-emerald-300 opacity-80"
                        : "bg-muted/50 border-border opacity-60"
                      : "bg-card border-border hover:border-primary/50 active:scale-[0.98] shadow-sm"
                )}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm font-medium text-foreground">
                  {opt.label}
                </span>
                {quizAnswer !== null && opt.correct && (
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Professor reaction */}
          {quizAnswer !== null && (
            <motion.div
              className="bg-card rounded-2xl p-4 border border-primary/20 shadow-sm mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-bold text-primary">Professor:</span>{" "}
                {QUIZ_REACTIONS[quizAnswer]}
              </p>
            </motion.div>
          )}
        </motion.div>

        {quizAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button onClick={handleComplete} size="lg" className="w-full">
              <Sparkles size={18} />
              Complete Mission
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
}
