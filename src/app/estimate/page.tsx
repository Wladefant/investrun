"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IPhoneFrame from "@/components/IPhoneFrame";
import Link from "next/link";
import {
  GOALS,
  calculateEstimations,
  yearsSaved,
  type Goal,
} from "@/lib/estimation";

type Step = "goal" | "amount" | "reveal";

export default function EstimatePage() {
  const [step, setStep] = useState<Step>("goal");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [monthlyInvestment, setMonthlyInvestment] = useState(300);

  const goalAmount = selectedGoal?.amount ?? customAmount;

  return (
    <IPhoneFrame>
      <AnimatePresence mode="wait">
        {step === "goal" && (
          <GoalStep
            key="goal"
            onSelect={(goal) => {
              setSelectedGoal(goal);
              setStep("amount");
            }}
            onCustom={(amount) => {
              setSelectedGoal(null);
              setCustomAmount(amount);
              setStep("amount");
            }}
          />
        )}
        {step === "amount" && (
          <AmountStep
            key="amount"
            goalLabel={selectedGoal?.label ?? "Your Goal"}
            goalAmount={goalAmount}
            monthlyInvestment={monthlyInvestment}
            onChangeMonthly={setMonthlyInvestment}
            onReveal={() => setStep("reveal")}
            onBack={() => setStep("goal")}
          />
        )}
        {step === "reveal" && (
          <RevealStep
            key="reveal"
            goalLabel={selectedGoal?.label ?? "Your Goal"}
            goalIcon={selectedGoal?.icon ?? "🎯"}
            goalAmount={goalAmount}
            monthlyInvestment={monthlyInvestment}
            onBack={() => setStep("amount")}
          />
        )}
      </AnimatePresence>
    </IPhoneFrame>
  );
}

function GoalStep({
  onSelect,
  onCustom,
}: {
  onSelect: (goal: Goal) => void;
  onCustom: (amount: number) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState("");

  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Link
        href="/"
        className="text-pf-gray-500 text-sm mb-4 flex items-center gap-1"
      >
        ← Back
      </Link>
      <h1 className="text-2xl font-extrabold mb-1">What&apos;s your goal?</h1>
      <p className="text-pf-gray-500 text-sm mb-6">
        Pick something you want. We&apos;ll show you how investing gets you there
        faster.
      </p>

      <div className="flex flex-col gap-3 flex-1">
        {GOALS.map((goal, i) => (
          <motion.button
            key={goal.id}
            onClick={() => onSelect(goal)}
            className="flex items-center gap-4 p-4 rounded-xl border border-pf-gray-800 bg-pf-gray-900 active:scale-[0.98] active:border-pf-yellow transition-all text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <span className="text-2xl">{goal.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{goal.label}</p>
              <p className="text-pf-gray-500 text-xs">
                CHF {goal.amount.toLocaleString("de-CH")}
              </p>
            </div>
            <span className="text-pf-gray-600">→</span>
          </motion.button>
        ))}

        {!showCustom ? (
          <motion.button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-pf-gray-700 active:scale-[0.98] transition-all text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-2xl">✏️</span>
            <p className="font-bold text-sm text-pf-gray-300">Custom amount</p>
          </motion.button>
        ) : (
          <motion.div
            className="flex items-center gap-3 p-4 rounded-xl border border-pf-yellow bg-pf-gray-900"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-pf-gray-500 font-bold">CHF</span>
            <input
              type="number"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              placeholder="50,000"
              className="flex-1 bg-transparent text-pf-white font-bold text-lg outline-none"
              autoFocus
            />
            <button
              onClick={() => {
                const val = parseInt(customVal);
                if (val > 0) onCustom(val);
              }}
              className="bg-pf-yellow text-pf-black font-bold px-4 py-2 rounded-lg text-sm"
            >
              Go
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function AmountStep({
  goalLabel,
  goalAmount,
  monthlyInvestment,
  onChangeMonthly,
  onReveal,
  onBack,
}: {
  goalLabel: string;
  goalAmount: number;
  monthlyInvestment: number;
  onChangeMonthly: (v: number) => void;
  onReveal: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={onBack}
        className="text-pf-gray-500 text-sm mb-4 flex items-center gap-1 self-start"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-extrabold mb-1">
        How much can you invest monthly?
      </h1>
      <p className="text-pf-gray-500 text-sm mb-8">
        For your {goalLabel} (CHF {goalAmount.toLocaleString("de-CH")})
      </p>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Big number display */}
        <div className="text-center">
          <p className="text-pf-gray-500 text-sm mb-2">Monthly investment</p>
          <p className="text-5xl font-extrabold text-pf-yellow">
            CHF {monthlyInvestment}
          </p>
        </div>

        {/* Slider */}
        <div className="w-full px-4">
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={monthlyInvestment}
            onChange={(e) => onChangeMonthly(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FFC800 ${
                ((monthlyInvestment - 50) / 1950) * 100
              }%, #404040 ${((monthlyInvestment - 50) / 1950) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-pf-gray-500 text-xs">
            <span>CHF 50</span>
            <span>CHF 2,000</span>
          </div>
        </div>

        {/* Quick picks */}
        <div className="flex gap-2">
          {[100, 300, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => onChangeMonthly(v)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                monthlyInvestment === v
                  ? "bg-pf-yellow text-pf-black"
                  : "bg-pf-gray-800 text-pf-gray-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={onReveal}
        className="bg-pf-yellow text-pf-black font-bold text-lg py-4 rounded-2xl active:scale-[0.98] transition-transform mt-4"
        whileTap={{ scale: 0.98 }}
      >
        Show Me My Future →
      </motion.button>
    </motion.div>
  );
}

function RevealStep({
  goalLabel,
  goalIcon,
  goalAmount,
  monthlyInvestment,
  onBack,
}: {
  goalLabel: string;
  goalIcon: string;
  goalAmount: number;
  monthlyInvestment: number;
  onBack: () => void;
}) {
  const { saving, profiles } = calculateEstimations(goalAmount, monthlyInvestment);
  const bestProfile = profiles[profiles.length - 1]; // Growth
  const saved = yearsSaved(goalAmount, monthlyInvestment, bestProfile.profile.annualReturn);

  const allResults = [saving, ...profiles];

  return (
    <motion.div
      className="flex flex-col h-full px-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={onBack}
        className="text-pf-gray-500 text-sm mb-4 flex items-center gap-1 self-start"
      >
        ← Adjust
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-4xl mb-2 block">{goalIcon}</span>
        <h1 className="text-xl font-extrabold">{goalLabel}</h1>
        <p className="text-pf-gray-500 text-sm">
          CHF {goalAmount.toLocaleString("de-CH")} · CHF {monthlyInvestment}/month
        </p>
      </div>

      {/* Timeline bars */}
      <div className="flex flex-col gap-3 mb-6">
        {allResults.map((result, i) => {
          const maxYears = saving.years;
          const barWidth = Math.min(100, (result.years / maxYears) * 100);

          return (
            <motion.div
              key={result.profile.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + 0.15 * i }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span>{result.profile.icon}</span>
                  {result.profile.label}
                </span>
                <span
                  className={`text-sm font-bold ${
                    i === 0 ? "text-pf-gray-500" : "text-pf-yellow"
                  }`}
                >
                  {result.years.toFixed(1)} years
                </span>
              </div>
              <div className="w-full h-3 bg-pf-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    i === 0 ? "bg-pf-gray-500" : "bg-pf-yellow"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: 0.4 + 0.15 * i, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Punchline */}
      <motion.div
        className="bg-pf-gray-900 border border-pf-yellow/30 rounded-2xl p-5 text-center mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-pf-yellow text-3xl font-extrabold mb-2">
          {saved.toFixed(1)} years
        </p>
        <p className="text-pf-gray-300 text-sm">
          Investing doesn&apos;t just grow your money.
          <br />
          <span className="text-pf-white font-bold">
            It buys you {saved.toFixed(0)} years of your life back.
          </span>
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="flex flex-col gap-3 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-pf-gray-500 text-xs text-center">
          But markets don&apos;t go in straight lines. Want to see what really happens?
        </p>
        <Link href="/simulate">
          <button className="w-full bg-pf-yellow text-pf-black font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-transform">
            Simulate 20 Years →
          </button>
        </Link>
        <Link href="/">
          <button className="w-full text-pf-gray-500 text-sm py-2">
            Back to menu
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
