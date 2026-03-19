"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskArchetype } from "@/lib/academy-state";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface Scenario {
  id: number;
  situation: string;
  options: { label: string; icon: string; points: number }[];
  professorReaction: Record<number, string>;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    situation:
      "It's October 2008. Your portfolio just dropped 35% in six weeks. Your friend says sell everything.",
    options: [
      { label: "Sell everything", icon: "🏃", points: 0 },
      { label: "Sell half", icon: "⚖️", points: 1 },
      { label: "Hold firm", icon: "💎", points: 2 },
      { label: "Buy more", icon: "🎯", points: 3 },
    ],
    professorReaction: {
      0: "The instinct to flee is natural. But selling at the bottom locks in your losses permanently.",
      1: "A measured response. You kept some exposure while reducing risk. Let's see if that pattern holds...",
      2: "Composure under pressure. That's rarer than you think — most investors can't resist the urge to sell.",
      3: "Buying when others panic. Warren Buffett would approve. But do you have the stomach for more losses first?",
    },
  },
  {
    id: 2,
    situation:
      "You inherited CHF 50,000. You don't need it for 20 years. How do you invest it?",
    options: [
      { label: "100% savings account", icon: "🏦", points: 0 },
      { label: "Mostly bonds, some stocks", icon: "🛡️", points: 1 },
      { label: "60/40 stocks & bonds", icon: "⚖️", points: 2 },
      { label: "Mostly stocks", icon: "📈", points: 3 },
    ],
    professorReaction: {
      0: "Safe, but inflation will quietly eat 30-40% of that over 20 years. Safety has a hidden cost.",
      1: "Conservative for a 20-year horizon. Bonds are stable, but you're leaving significant growth on the table.",
      2: "The classic balanced approach. Historically solid for this timeframe. Smart and disciplined.",
      3: "With 20 years, you can ride out crashes. History strongly favors this approach for long horizons.",
    },
  },
  {
    id: 3,
    situation:
      "Your portfolio is up 25% this year. A colleague says it's time to lock in gains.",
    options: [
      { label: "Sell all — lock in gains", icon: "💰", points: 0 },
      { label: "Sell half", icon: "⚖️", points: 1 },
      { label: "Hold — stay the course", icon: "🧘", points: 2 },
      { label: "Add more — momentum", icon: "🚀", points: 3 },
    ],
    professorReaction: {
      0: "Interesting. You held during the crash but sold when winning. That's loss aversion meeting the disposition effect.",
      1: "Taking partial profits is disciplined. You're protecting gains while keeping upside. Balanced thinking.",
      2: "Staying the course regardless of short-term performance. That's consistency — the hallmark of good investors.",
      3: "Chasing momentum can work, but it's a form of trend-following. Make sure it's strategy, not greed.",
    },
  },
  {
    id: 4,
    situation:
      "Breaking news: a major European bank is collapsing. Markets down 8% today.",
    options: [
      { label: "Panic sell now", icon: "😰", points: 0 },
      { label: "Do nothing", icon: "😐", points: 2 },
      { label: "Don't even check", icon: "😎", points: 2 },
      { label: "Buy the dip", icon: "🎪", points: 3 },
    ],
    professorReaction: {
      0: "Reacting to headlines is the most common — and most expensive — investor mistake. One bad day is not a crisis.",
      2: "Not checking is actually a valid strategy. The less you look, the less you panic. Research confirms this.",
      3: "Contrarian instincts. Historically profitable, but requires conviction. Most people can't do this.",
    },
  },
  {
    id: 5,
    situation:
      "Choose one: Option A gives you CHF 5,000 guaranteed. Option B gives you 50% chance of CHF 15,000, 50% chance of nothing.",
    options: [
      { label: "A — Guaranteed CHF 5,000", icon: "🔒", points: 1 },
      { label: "B — The gamble", icon: "🎲", points: 2 },
    ],
    professorReaction: {
      1: "You prefer certainty. That's not wrong — it tells us you value capital preservation over expected value maximization.",
      2: "Mathematically optimal — the expected value of B is CHF 7,500. You think in probabilities, not emotions.",
    },
  },
];

function calculateArchetype(totalPoints: number): {
  archetype: RiskArchetype;
  label: string;
  icon: string;
  description: string;
} {
  if (totalPoints <= 4)
    return {
      archetype: "conservative",
      label: "The Guardian",
      icon: "🛡️",
      description: "You protect first, grow second. Stability is your priority.",
    };
  if (totalPoints <= 7)
    return {
      archetype: "balanced_conservative",
      label: "The Careful Builder",
      icon: "🏗️",
      description: "You grow steadily with guardrails. Calculated, patient.",
    };
  if (totalPoints <= 10)
    return {
      archetype: "balanced",
      label: "The Steady Navigator",
      icon: "🧭",
      description: "You balance risk and reward with discipline. The sweet spot.",
    };
  if (totalPoints <= 13)
    return {
      archetype: "balanced_growth",
      label: "The Bold Strategist",
      icon: "♟️",
      description: "You lean into growth while managing risk. Confident but not reckless.",
    };
  return {
    archetype: "aggressive",
    label: "The Pioneer",
    icon: "🚀",
    description: "You chase maximum growth and embrace volatility. High conviction.",
  };
}

export function Mission1Screen({
  onComplete,
  onBack,
}: {
  onComplete: (score: number, riskProfile: RiskArchetype) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<"briefing" | "questions" | "reveal">("briefing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showReaction, setShowReaction] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    const scenario = SCENARIOS[currentQ];
    const points = scenario.options[optionIndex].points;
    setSelectedAnswer(optionIndex);
    setTotalPoints((p) => p + points);
    setAnswers((a) => [...a, optionIndex]);
    setShowReaction(true);
  };

  const handleNext = () => {
    if (currentQ < SCENARIOS.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowReaction(false);
    } else {
      setPhase("reveal");
    }
  };

  if (phase === "briefing") {
    return (
      <>
        <ScreenHeader title="Mission 1" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center text-foregroundxl mb-6 shadow-lg">
              🪞
            </div>
            <h1 className="text-primary-foregroundxl font-bold text-foreground mb-2">Know Thyself</h1>
            <p className="text-muted-foreground text-sm mb-6">Risk Profiling</p>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">Professor Fortuna:</span>
                {" "}Before we begin your journey, I need to understand who you are as
                an investor. Not who you think you should be — who you actually are.
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                I&apos;ll present five real scenarios. There are no wrong answers — every
                response reveals something valuable about your investing personality.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
              <span className="bg-muted px-2.5 py-1 rounded-full">⏱ 2-3 minutes</span>
              <span className="bg-muted px-2.5 py-1 rounded-full">5 scenarios</span>
              <span className="bg-muted px-2.5 py-1 rounded-full">+150 XP</span>
            </div>
          </motion.div>

          <Button onClick={() => setPhase("questions")} size="lg" className="w-full">
            Begin Assessment
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  if (phase === "reveal") {
    const result = calculateArchetype(totalPoints);
    const radarData = [
      { trait: "Composure", value: Math.min(100, totalPoints * 7 + 20) },
      { trait: "Growth\nFocus", value: Math.min(100, totalPoints * 6 + 15) },
      { trait: "Risk\nTolerance", value: Math.min(100, totalPoints * 8) },
      { trait: "Patience", value: Math.min(100, (15 - totalPoints) * 5 + 30) },
      { trait: "Discipline", value: Math.min(100, 50 + totalPoints * 3) },
    ];

    return (
      <>
        <ScreenHeader title="Your Profile" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/90 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 pf-glow">
              {result.icon}
            </div>
            <h2 className="text-primary-foregroundxl font-bold text-foreground">{result.label}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
              {result.description}
            </p>
          </motion.div>

          <motion.div
            className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e5e5" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{ fontSize: 10, fill: "#737373" }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#FFC800"
                    fill="#FFC800"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-primary">Professor Fortuna:</span>{" "}
              Fascinating, {result.label}. Your responses show a clear pattern.
              Remember — your risk profile isn&apos;t a grade. It&apos;s a compass.
              Every great investor starts by knowing themselves. You&apos;ve passed the first test.
            </p>
          </motion.div>

          <Button
            onClick={() => onComplete(75 + totalPoints * 2, result.archetype)}
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

  // Questions phase
  const scenario = SCENARIOS[currentQ];
  const progress = ((currentQ + 1) / SCENARIOS.length) * 100;

  return (
    <>
      <ScreenHeader title={`Question ${currentQ + 1} of ${SCENARIOS.length}`} onBack={onBack} />
      <div className="flex-1 flex flex-col px-5 py-4">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-[#FFD633] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Scenario */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <p className="text-base font-bold text-foreground leading-relaxed mb-6">
              {scenario.situation}
            </p>

            <div className="space-y-2.5 mb-4">
              {scenario.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                    selectedAnswer === i
                      ? "bg-primary/10 border-primary shadow-sm"
                      : selectedAnswer !== null
                        ? "bg-muted/50 border-border opacity-60"
                        : "bg-card border-border hover:border-primary/50 active:scale-[0.98] shadow-sm"
                  )}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  {selectedAnswer === i && (
                    <motion.div
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A2332" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Professor reaction */}
            <AnimatePresence>
              {showReaction && selectedAnswer !== null && (
                <motion.div
                  className="bg-card rounded-2xl p-4 border border-primary/20 shadow-sm mb-4"
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-xs text-foreground leading-relaxed">
                    <span className="font-bold text-primary">Professor:</span>{" "}
                    {scenario.professorReaction[
                      scenario.options[selectedAnswer].points
                    ] ||
                      scenario.professorReaction[
                        Object.keys(scenario.professorReaction)[0] as unknown as number
                      ]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button onClick={handleNext} size="lg" className="w-full">
              {currentQ < SCENARIOS.length - 1 ? "Next Scenario" : "See Your Profile"}
              <ChevronRight size={18} />
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
}
