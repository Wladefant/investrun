"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GOALS, RISK_PROFILES, type Goal, type RiskProfile } from "@/lib/estimation";
import {
  ChevronRight,
  Sparkles,
  GraduationCap,
  ArrowLeft,
  Plus,
  Check,
  TrendingUp,
  Target,
  Trophy,
} from "lucide-react";

const TOTAL_STEPS = 9;

const INTRO_SLIDES = [
  {
    icon: TrendingUp,
    title: "See your financial future",
    subtitle:
      "Visualize how small investments today can grow into life-changing wealth.",
    gradient: "from-primary/15 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Target,
    title: "Train with real market scenarios",
    subtitle:
      "Experience decades of market history in minutes. Learn to stay calm when others panic.",
    gradient: "from-secondary/10 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: Trophy,
    title: "Compete and learn smarter",
    subtitle:
      "Challenge friends, climb leaderboards, and prove your investment instincts.",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export interface OnboardingResult {
  name: string;
  age: number;
  investmentHorizonMonths: number;
  monthlyContribution: number;
  selectedGoal: Goal;
  riskProfileId: RiskProfile["id"] | null;
}

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.25 },
};

export function OnboardingFlow({
  onComplete,
  onSkip,
}: {
  onComplete: (result: OnboardingResult) => void;
  onSkip?: () => void;
}) {
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [age, setAge] = useState(22);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [customGoalName, setCustomGoalName] = useState("");
  const [customGoalAmount, setCustomGoalAmount] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [riskId, setRiskId] = useState<RiskProfile["id"] | null>(null);

  const canProceed = (() => {
    switch (step) {
      case 4:
        return name.trim().length > 0;
      case 6:
        return monthlyContribution >= 50;
      case 7:
        return selectedGoal !== null;
      default:
        return true;
    }
  })();

  const handleNext = () => {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        name: name.trim(),
        age,
        investmentHorizonMonths: 60,
        monthlyContribution,
        selectedGoal: selectedGoal!,
        riskProfileId: riskId,
      });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleAddCustomGoal = () => {
    const amount = parseFloat(customGoalAmount);
    if (customGoalName.trim() && amount > 0) {
      setSelectedGoal({
        id: `custom-${Date.now()}`,
        label: customGoalName.trim(),
        icon: "🎯",
        amount,
      });
      setShowCustomForm(false);
      setCustomGoalName("");
      setCustomGoalAmount("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {step >= 1 && (
        <div className="px-5 pt-3 pb-1 shrink-0">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {step >= 1 && (
        <div className="px-4 pt-2 shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && <SplashStep key="splash" onNext={handleNext} onSkip={onSkip} />}

        {step >= 1 && step <= 3 && (
          <IntroStep
            key={`intro-${step}`}
            slideIndex={step - 1}
            onNext={handleNext}
          />
        )}

        {step === 4 && (
          <NameStep
            key="name"
            name={name}
            onNameChange={setName}
            canProceed={canProceed}
            onNext={handleNext}
          />
        )}

        {step === 5 && (
          <AgeStep
            key="age"
            age={age}
            onAgeChange={setAge}
            onNext={handleNext}
          />
        )}

        {step === 6 && (
          <ContributionStep
            key="contribution"
            monthlyContribution={monthlyContribution}
            onContributionChange={setMonthlyContribution}
            onNext={handleNext}
          />
        )}

        {step === 7 && (
          <GoalStep
            key="goal"
            selectedGoal={selectedGoal}
            onSelectGoal={(g) => {
              setSelectedGoal(g);
              setShowCustomForm(false);
            }}
            showCustomForm={showCustomForm}
            onShowCustomForm={() => {
              setShowCustomForm(true);
              setSelectedGoal(null);
            }}
            onHideCustomForm={() => setShowCustomForm(false)}
            customGoalName={customGoalName}
            onCustomGoalNameChange={setCustomGoalName}
            customGoalAmount={customGoalAmount}
            onCustomGoalAmountChange={setCustomGoalAmount}
            onAddCustomGoal={handleAddCustomGoal}
            canProceed={canProceed}
            onNext={handleNext}
          />
        )}

        {step === 8 && (
          <RiskStep
            key="risk"
            riskId={riskId}
            onSelectRisk={setRiskId}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Step 0: Welcome Splash ─── */

function SplashStep({ onNext, onSkip }: { onNext: () => void; onSkip?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mb-8 pf-glow-sm"
      >
        <GraduationCap size={48} className="text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-2xl font-bold text-foreground mb-1 tracking-tight"
      >
        Wealth Manager
      </motion.h1>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-primary mb-3"
      >
        Academy
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-[260px]"
      >
        Master the art of investing through guided missions. Learn by doing.
        Graduate with your Investment DNA.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex items-center gap-2 mb-10 flex-wrap justify-center"
      >
        {["🪞 Risk Profiling", "📉 Crash Survival", "🧬 DNA Report"].map(
          (item, i) => (
            <div
              key={i}
              className="bg-card border border-border px-3 py-1.5 rounded-full text-[10px] text-foreground font-medium shadow-sm"
            >
              {item}
            </div>
          )
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="w-full"
      >
        <Button size="lg" onClick={onNext}>
          Get Started <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip onboarding →
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Steps 1-3: Intro Slides ─── */

function IntroStep({
  slideIndex,
  onNext,
}: {
  slideIndex: number;
  onNext: () => void;
}) {
  const slide = INTRO_SLIDES[slideIndex];
  const Icon = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col px-6 pt-6"
    >
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b rounded-3xl p-8",
          slide.gradient
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center mb-8",
            slide.iconBg
          )}
        >
          <Icon className={cn("w-10 h-10", slide.iconColor)} />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-4 text-foreground text-balance"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-balance"
        >
          {slide.subtitle}
        </motion.p>
      </div>

      <div className="flex justify-center gap-2 py-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === slideIndex ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>

      <div className="pb-6">
        <Button onClick={onNext} size="lg">
          {slideIndex === 2 ? "Let\u2019s personalize" : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Step 4: Name Entry ─── */

function NameStep({
  name,
  onNameChange,
  canProceed,
  onNext,
}: {
  name: string;
  onNameChange: (v: string) => void;
  canProceed: boolean;
  onNext: () => void;
}) {
  return (
    <motion.div {...slideIn} className="flex-1 flex flex-col px-6 pt-6">
      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 pf-glow-sm">
        <GraduationCap size={28} className="text-primary-foreground" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        Welcome, future investor.
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        What should Professor Fortuna call you?
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Your name"
        maxLength={20}
        autoFocus
        className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground text-lg placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && canProceed) onNext();
        }}
      />

      <div className="flex-1" />

      <div className="pb-6">
        <Button size="lg" onClick={onNext} disabled={!canProceed}>
          Continue <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Step 5: Age Slider ─── */

function AgeStep({
  age,
  onAgeChange,
  onNext,
}: {
  age: number;
  onAgeChange: (v: number) => void;
  onNext: () => void;
}) {
  const pct = ((age - 16) / (65 - 16)) * 100;

  return (
    <motion.div {...slideIn} className="flex-1 flex flex-col px-6 pt-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        How old are you?
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Your age helps us show realistic projections.
      </p>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          className="text-center mb-8"
          key={age}
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
        >
          <span className="text-7xl font-bold text-primary">{age}</span>
          <span className="text-2xl text-muted-foreground ml-2">years</span>
        </motion.div>

        <input
          type="range"
          min={16}
          max={65}
          step={1}
          value={age}
          onChange={(e) => onAgeChange(Number(e.target.value))}
          className="pf-slider mb-4"
          style={{
            background: `linear-gradient(to right, var(--primary) ${pct}%, var(--border) ${pct}%)`,
          }}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>16</span>
          <span>65</span>
        </div>
      </div>

      <div className="pb-6">
        <Button onClick={onNext} size="lg">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Step 6: Monthly Investment Slider ─── */

function ContributionStep({
  monthlyContribution,
  onContributionChange,
  onNext,
}: {
  monthlyContribution: number;
  onContributionChange: (v: number) => void;
  onNext: () => void;
}) {
  const pct = ((monthlyContribution - 50) / (2000 - 50)) * 100;
  const quickPicks = [100, 300, 500, 1000];

  const encouragement =
    monthlyContribution < 200
      ? "Every franc counts. Small starts lead to big futures."
      : monthlyContribution < 500
        ? "Great start! You\u2019re building real momentum."
        : "Impressive commitment. Your future self will thank you.";

  return (
    <motion.div {...slideIn} className="flex-1 flex flex-col px-6 pt-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        How much can you invest monthly?
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Start small. Consistency beats perfection.
      </p>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          className="text-center mb-8"
          key={monthlyContribution}
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
        >
          <span className="text-5xl font-bold text-primary">
            CHF&nbsp;{monthlyContribution.toLocaleString("de-CH")}
          </span>
          <span className="text-lg text-muted-foreground ml-1">/month</span>
        </motion.div>

        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={monthlyContribution}
          onChange={(e) => onContributionChange(Number(e.target.value))}
          className="pf-slider mb-4"
          style={{
            background: `linear-gradient(to right, var(--primary) ${pct}%, var(--border) ${pct}%)`,
          }}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>CHF 50</span>
          <span>CHF 2,000</span>
        </div>

        <div className="flex gap-2 justify-center flex-wrap mt-6">
          {quickPicks.map((amount) => (
            <button
              key={amount}
              onClick={() => onContributionChange(amount)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                monthlyContribution === amount
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:border-primary"
              )}
            >
              {amount}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {encouragement}
        </p>
      </div>

      <div className="pb-6">
        <Button onClick={onNext} size="lg">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Step 7: Goal Selection ─── */

function GoalStep({
  selectedGoal,
  onSelectGoal,
  showCustomForm,
  onShowCustomForm,
  onHideCustomForm,
  customGoalName,
  onCustomGoalNameChange,
  customGoalAmount,
  onCustomGoalAmountChange,
  onAddCustomGoal,
  canProceed,
  onNext,
}: {
  selectedGoal: Goal | null;
  onSelectGoal: (g: Goal) => void;
  showCustomForm: boolean;
  onShowCustomForm: () => void;
  onHideCustomForm: () => void;
  customGoalName: string;
  onCustomGoalNameChange: (v: string) => void;
  customGoalAmount: string;
  onCustomGoalAmountChange: (v: string) => void;
  onAddCustomGoal: () => void;
  canProceed: boolean;
  onNext: () => void;
}) {
  const isCustomSelected = selectedGoal?.id.startsWith("custom-") ?? false;

  return (
    <motion.div
      {...slideIn}
      className="flex-1 flex flex-col px-6 pt-6 overflow-hidden"
    >
      <h2 className="text-2xl font-bold text-foreground mb-2 shrink-0">
        What are you investing for?
      </h2>
      <p className="text-muted-foreground text-sm mb-5 shrink-0">
        Pick a goal or create your own.
      </p>

      <div className="flex-1 overflow-y-auto space-y-2.5 -mx-1 px-1 pb-2">
        {GOALS.map((goal) => (
          <motion.button
            key={goal.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGoal(goal)}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all",
              selectedGoal?.id === goal.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {goal.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  CHF {goal.amount.toLocaleString("de-CH")}
                </p>
              </div>
              {selectedGoal?.id === goal.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check size={14} className="text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}

        {!showCustomForm ? (
          <button
            onClick={onShowCustomForm}
            className={cn(
              "w-full p-4 rounded-xl border-2 border-dashed text-left transition-all",
              isCustomSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Plus size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">
                  {isCustomSelected ? selectedGoal!.label : "Custom Goal"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isCustomSelected
                    ? `CHF ${selectedGoal!.amount.toLocaleString("de-CH")}`
                    : "Define your own target"}
                </p>
              </div>
              {isCustomSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check size={14} className="text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-card rounded-xl border-2 border-primary p-4 space-y-3"
          >
            <p className="font-semibold text-foreground text-sm">
              Create your goal
            </p>
            <input
              type="text"
              value={customGoalName}
              onChange={(e) => onCustomGoalNameChange(e.target.value)}
              placeholder="Goal name (e.g. Emergency Fund)"
              maxLength={30}
              autoFocus
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                CHF
              </span>
              <input
                type="number"
                value={customGoalAmount}
                onChange={(e) => onCustomGoalAmountChange(e.target.value)}
                placeholder="0"
                className="w-full bg-background border border-border rounded-lg pl-12 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onHideCustomForm}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <Button
                size="sm"
                onClick={onAddCustomGoal}
                disabled={
                  !customGoalName.trim() ||
                  !customGoalAmount ||
                  parseFloat(customGoalAmount) <= 0
                }
                className="flex-1 h-auto py-2"
              >
                Add Goal
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="pt-4 pb-6 shrink-0">
        <Button size="lg" onClick={onNext} disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Step 8: Risk Personalization ─── */

function RiskStep({
  riskId,
  onSelectRisk,
  onNext,
}: {
  riskId: RiskProfile["id"] | null;
  onSelectRisk: (id: RiskProfile["id"]) => void;
  onNext: () => void;
}) {
  return (
    <motion.div {...slideIn} className="flex-1 flex flex-col px-6 pt-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        How do you feel about risk?
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        This helps us personalize your learning experience.
      </p>

      <div className="space-y-3 flex-1">
        {RISK_PROFILES.map((profile) => (
          <motion.button
            key={profile.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRisk(profile.id)}
            className={cn(
              "w-full p-5 rounded-xl border-2 text-left transition-all",
              riskId === profile.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{profile.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{profile.label}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.description}
                </p>
              </div>
              {riskId === profile.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check size={14} className="text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="pb-6 space-y-2">
        <Button size="lg" onClick={onNext}>
          {riskId ? (
            <>
              <Sparkles className="mr-1 w-4 h-4" />
              Start My Journey
            </>
          ) : (
            "Skip for now"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          You can always change this later
        </p>
      </div>
    </motion.div>
  );
}
