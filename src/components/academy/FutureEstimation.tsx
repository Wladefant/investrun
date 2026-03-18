"use client";

import { useState, useEffect, useRef } from "react";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GOALS,
  type Goal,
  calculateEstimations,
  yearsSaved,
} from "@/lib/estimation";

type Phase = "goal" | "investment" | "reveal" | "cta";

export function FutureEstimationScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("goal");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [monthlyInvestment, setMonthlyInvestment] = useState(300);
  const [barsAnimated, setBarsAnimated] = useState(false);

  const targetAmount = selectedGoal?.amount ?? 0;

  function handleGoalSelect(goal: Goal) {
    setSelectedGoal(goal);
    setPhase("investment");
  }

  function handleCustomGoal() {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      setSelectedGoal({
        id: "custom",
        label: "Custom Goal",
        icon: "🎯",
        amount,
      });
      setPhase("investment");
    }
  }

  function handleReveal() {
    setBarsAnimated(false);
    setPhase("reveal");
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F3F3F3] overflow-hidden">
      <ScreenHeader
        title="My Future"
        onBack={phase === "goal" ? onBack : () => {
          if (phase === "investment") setPhase("goal");
          else if (phase === "reveal") setPhase("investment");
          else if (phase === "cta") setPhase("reveal");
        }}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {phase === "goal" && (
          <GoalSelection
            onSelect={handleGoalSelect}
            customAmount={customAmount}
            onCustomAmountChange={setCustomAmount}
            onCustomSubmit={handleCustomGoal}
          />
        )}

        {phase === "investment" && selectedGoal && (
          <InvestmentPicker
            goal={selectedGoal}
            monthly={monthlyInvestment}
            onMonthlyChange={setMonthlyInvestment}
            onNext={handleReveal}
          />
        )}

        {phase === "reveal" && selectedGoal && (
          <RevealPhase
            targetAmount={targetAmount}
            monthlyInvestment={monthlyInvestment}
            animated={barsAnimated}
            onAnimated={() => setBarsAnimated(true)}
            onNext={() => setPhase("cta")}
          />
        )}

        {phase === "cta" && (
          <CtaPhase onBack={onBack} />
        )}
      </div>
    </div>
  );
}

/* ─── Phase 1: Goal Selection ─── */

function GoalSelection({
  onSelect,
  customAmount,
  onCustomAmountChange,
  onCustomSubmit,
}: {
  onSelect: (goal: Goal) => void;
  customAmount: string;
  onCustomAmountChange: (v: string) => void;
  onCustomSubmit: () => void;
}) {
  return (
    <div className="pt-4 space-y-3">
      <h2 className="text-xl font-bold text-[#333333] mb-4">
        What&apos;s your dream?
      </h2>

      {GOALS.map((goal) => (
        <button
          key={goal.id}
          onClick={() => onSelect(goal)}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
        >
          <span className="text-3xl">{goal.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#333333]">{goal.label}</p>
            <p className="text-sm text-[#767676]">
              CHF {goal.amount.toLocaleString("de-CH")}
            </p>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#767676"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      ))}

      {/* Custom amount */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <p className="font-semibold text-[#333333]">Or enter your own amount</p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#767676] text-sm">
              CHF
            </span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              placeholder="0"
              className="w-full h-11 pl-12 pr-3 rounded-lg border border-gray-200 text-[#333333] text-sm focus:outline-none focus:border-[#FFC800] focus:ring-1 focus:ring-[#FFC800]"
            />
          </div>
          <Button
            onClick={onCustomSubmit}
            disabled={!customAmount || parseFloat(customAmount) <= 0}
            size="sm"
            className="h-11 px-4"
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Phase 2: Monthly Investment ─── */

function InvestmentPicker({
  goal,
  monthly,
  onMonthlyChange,
  onNext,
}: {
  goal: Goal;
  monthly: number;
  onMonthlyChange: (v: number) => void;
  onNext: () => void;
}) {
  const quickPicks = [100, 300, 500, 1000];

  return (
    <div className="pt-4 space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-[#767676]">
          Goal: {goal.icon} {goal.label}
        </p>
        <p className="text-sm text-[#767676]">
          CHF {goal.amount.toLocaleString("de-CH")}
        </p>
      </div>

      {/* Big number */}
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-1">
        <p className="text-sm text-[#767676]">Monthly investment</p>
        <p className="text-4xl font-bold text-[#333333]">
          CHF {monthly.toLocaleString("de-CH")}
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={monthly}
          onChange={(e) => onMonthlyChange(Number(e.target.value))}
          className="w-full accent-[#FFC800] h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FFC800 ${((monthly - 50) / (2000 - 50)) * 100}%, #E5E7EB ${((monthly - 50) / (2000 - 50)) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#767676]">
          <span>CHF 50</span>
          <span>CHF 2,000</span>
        </div>
      </div>

      {/* Quick picks */}
      <div className="flex gap-2 justify-center flex-wrap">
        {quickPicks.map((amount) => (
          <button
            key={amount}
            onClick={() => onMonthlyChange(amount)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              monthly === amount
                ? "bg-[#FFC800] text-[#333333]"
                : "bg-white border border-gray-200 text-[#333333] hover:border-[#FFC800]"
            )}
          >
            {amount}
          </button>
        ))}
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        Show me my future
      </Button>
    </div>
  );
}

/* ─── Phase 3: The Reveal ─── */

function RevealPhase({
  targetAmount,
  monthlyInvestment,
  animated,
  onAnimated,
  onNext,
}: {
  targetAmount: number;
  monthlyInvestment: number;
  animated: boolean;
  onAnimated: () => void;
  onNext: () => void;
}) {
  const { saving, profiles } = calculateEstimations(targetAmount, monthlyInvestment);
  const bestSaved = yearsSaved(targetAmount, monthlyInvestment, 0.07);

  const allResults = [saving, ...profiles];
  const maxYears = saving.years;

  // Trigger animation after mount
  const [show, setShow] = useState(animated);
  useEffect(() => {
    if (!animated) {
      const timer = setTimeout(() => {
        setShow(true);
        onAnimated();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [animated, onAnimated]);

  const barColors = [
    "bg-gray-400",       // Just Saving
    "bg-[#FFC800]/50",   // Cautious
    "bg-[#FFC800]/80",   // Balanced
    "bg-[#FFC800]",      // Growth
  ];

  const barLabels = [
    "Just Saving (0%)",
    "Cautious (3%)",
    "Balanced (5%)",
    "Growth (7%)",
  ];

  return (
    <div className="pt-4 space-y-5">
      <h2 className="text-xl font-bold text-[#333333]">
        Time to reach your goal
      </h2>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        {allResults.map((result, i) => {
          const widthPct = maxYears > 0 ? (result.years / maxYears) * 100 : 0;
          const displayYears = Math.round(result.years * 10) / 10;

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#333333] font-medium">
                  {barLabels[i]}
                </span>
                <span className="text-[#767676]">
                  {displayYears} yr{displayYears !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    barColors[i]
                  )}
                  style={{
                    width: show ? `${Math.max(widthPct, 4)}%` : "0%",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Punchline */}
      <div className="bg-[#FFC800]/10 border border-[#FFC800]/30 rounded-2xl p-5 text-center space-y-2">
        <p className="text-2xl font-bold text-[#333333]">
          {Math.round(bestSaved * 10) / 10} years
        </p>
        <p className="text-sm text-[#767676]">
          Investing buys you back from waiting. That&apos;s time you could spend
          living your dream instead of just saving for it.
        </p>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        What happens in real markets?
      </Button>
    </div>
  );
}

/* ─── Phase 4: CTA ─── */

function CtaPhase({ onBack }: { onBack: () => void }) {
  return (
    <div className="pt-8 flex flex-col items-center text-center space-y-6 px-2">
      <div className="text-5xl">📈</div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-[#333333]">
          But markets don&apos;t go in straight lines
        </h2>
        <p className="text-sm text-[#767676] leading-relaxed">
          Real returns bounce around. Some years you&apos;re up 20%, others
          you&apos;re down 15%. Want to see what really happens to your money
          over time?
        </p>
      </div>

      <div className="bg-[#FFC800]/10 border border-[#FFC800]/30 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-medium text-[#333333]">
          Continue your academy missions to learn how to handle market
          volatility, diversify your portfolio, and build real investing skills.
        </p>
      </div>

      <Button onClick={onBack} className="w-full" size="lg">
        Back to Missions
      </Button>
    </div>
  );
}
