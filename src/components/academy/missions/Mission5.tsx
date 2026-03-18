"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "briefing" | "client" | "build" | "evaluation";

interface AssetClass {
  name: string;
  icon: string;
  color: string;
  borderColor: string;
  description: string;
}

const ASSET_CLASSES: AssetClass[] = [
  {
    name: "Stocks",
    icon: "📈",
    color: "bg-blue-50",
    borderColor: "border-l-blue-500",
    description:
      "Ownership in companies. ~7-9% annual returns historically, but can drop 30-40% in a year. Best for 10+ year goals.",
  },
  {
    name: "Bonds",
    icon: "🛡️",
    color: "bg-green-50",
    borderColor: "border-l-green-500",
    description:
      "Loans to governments/companies. ~2-3% returns. Stable. Your portfolio's shock absorber.",
  },
  {
    name: "Gold",
    icon: "🥇",
    color: "bg-amber-50",
    borderColor: "border-l-amber-500",
    description:
      "Store of value for 5,000 years. No dividends, but holds value during crises. Insurance, not growth.",
  },
  {
    name: "Cash",
    icon: "💵",
    color: "bg-emerald-50",
    borderColor: "border-l-emerald-500",
    description:
      "Safest option. ~1% in savings. Inflation erodes it. Essential for emergencies, costly for long-term.",
  },
  {
    name: "Real Estate",
    icon: "🏠",
    color: "bg-purple-50",
    borderColor: "border-l-purple-500",
    description:
      "Property or REITs. Rental income + appreciation. Less liquid. Swiss real estate has been very stable.",
  },
];

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function evaluatePortfolio(
  houseFund: { stocks: number; bonds: number; cash: number },
  retirementFund: { stocks: number; bonds: number; gold: number }
) {
  // 1. House Fund Safety (penalise stocks > 30%)
  let houseSafety: number;
  if (houseFund.stocks <= 30) {
    houseSafety = 100 - houseFund.stocks; // 70-100
  } else {
    houseSafety = Math.max(0, 100 - (houseFund.stocks - 30) * 2.5);
  }

  // 2. Retirement Growth (penalise stocks < 40%)
  let retirementGrowth: number;
  if (retirementFund.stocks >= 40) {
    retirementGrowth = Math.min(100, 60 + retirementFund.stocks * 0.5);
  } else {
    retirementGrowth = Math.max(0, retirementFund.stocks * 2);
  }

  // 3. Cash Buffer (bonus if house fund has 10-20% cash)
  let cashBuffer: number;
  if (houseFund.cash >= 10 && houseFund.cash <= 20) {
    cashBuffer = 100;
  } else if (houseFund.cash > 0 && houseFund.cash < 10) {
    cashBuffer = houseFund.cash * 8;
  } else if (houseFund.cash > 20 && houseFund.cash <= 40) {
    cashBuffer = 100 - (houseFund.cash - 20) * 3;
  } else if (houseFund.cash === 0) {
    cashBuffer = 20;
  } else {
    cashBuffer = Math.max(10, 40 - houseFund.cash);
  }

  houseSafety = Math.round(houseSafety);
  retirementGrowth = Math.round(retirementGrowth);
  cashBuffer = Math.round(Math.min(100, Math.max(0, cashBuffer)));

  const overall = Math.round((houseSafety + retirementGrowth + cashBuffer) / 3);

  return { houseSafety, retirementGrowth, cashBuffer, overall };
}

function getHouseFundComment(stocks: number): string {
  if (stocks > 60)
    return `You put ${stocks}% of Maria's house fund in stocks. In 5 years, there's a real chance that could be worth less than today. That's a gamble with her home.`;
  if (stocks > 30)
    return `${stocks}% stocks for a 5-year goal is still risky. One bad year and Maria's house fund could lose 15-20%. Consider more bonds.`;
  if (stocks >= 15)
    return "A modest stock allocation for the house fund. Enough for some growth, but bonds and cash keep the core safe. Solid.";
  return "Very conservative house fund. Maria's down payment is well protected, though she might miss a bit of growth. Safety first makes sense here.";
}

function getRetirementComment(stocks: number): string {
  if (stocks < 20)
    return `Only ${stocks}% in stocks for a 30-year horizon. Maria is leaving significant growth on the table. With three decades, she can ride out any crash.`;
  if (stocks < 40)
    return `Maria has 30 years until retirement. With only ${stocks}% in stocks, she's playing it too safe. Time is her greatest asset — let it work.`;
  if (stocks <= 70)
    return "Good growth allocation for retirement. With 30 years of compounding, this mix gives Maria strong upside while bonds smooth the ride.";
  return `${stocks}% stocks is aggressive, but with 30 years, history strongly favours equities. Bold and defensible.`;
}

function getCashBufferComment(cash: number): string {
  if (cash >= 10 && cash <= 20)
    return "Perfect cash buffer. Enough liquidity for unexpected costs without dragging returns. Textbook.";
  if (cash === 0)
    return "No cash at all in the house fund? What if Maria has an emergency before the 5 years are up? A small buffer matters.";
  if (cash < 10)
    return "A thin cash buffer. Consider bumping it to 10-20% so Maria has flexibility if plans change.";
  if (cash <= 40)
    return "That's a lot of cash sitting idle. Inflation will quietly eat into it. 10-20% is the sweet spot.";
  return "Way too much cash. At this level, inflation is a guaranteed loss. Move some into bonds for at least a small return.";
}

function getOverallComment(overall: number): string {
  if (overall >= 85)
    return "Nice work. You matched the time horizon to the risk level. That's the key principle of asset allocation.";
  if (overall >= 65)
    return "Decent portfolio. You're on the right track, but there's room to better match risk to each goal's timeline.";
  if (overall >= 45)
    return "Some good instincts, but the allocation doesn't fully match Maria's two very different time horizons. The house fund and retirement fund should look quite different.";
  return "This needs work. The core idea: short-term goals need safety, long-term goals need growth. Your allocations got that backwards.";
}

// ---------------------------------------------------------------------------
// Slider component
// ---------------------------------------------------------------------------

function AllocationSlider({
  label,
  icon,
  value,
  onChange,
  color,
}: {
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <span className="text-xs font-bold text-foreground">{value}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${value}%, #e5e7eb ${value}%)`,
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score bar component
// ---------------------------------------------------------------------------

function ScoreBar({ label, score }: { label: string; score: number }) {
  const barColor =
    score >= 75
      ? "bg-green-500"
      : score >= 50
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground">{score}/100</span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Normalise sliders so a group always sums to 100
// ---------------------------------------------------------------------------

function normaliseAllocation(
  current: Record<string, number>,
  changedKey: string,
  newValue: number
): Record<string, number> {
  const keys = Object.keys(current);
  const otherKeys = keys.filter((k) => k !== changedKey);
  const remaining = 100 - newValue;
  const otherTotal = otherKeys.reduce((s, k) => s + current[k], 0);

  const result: Record<string, number> = { [changedKey]: newValue };

  if (otherTotal === 0) {
    // Distribute remaining evenly
    const each = Math.floor(remaining / otherKeys.length);
    let leftover = remaining - each * otherKeys.length;
    otherKeys.forEach((k, i) => {
      result[k] = each + (i < leftover ? 1 : 0);
    });
  } else {
    let distributed = 0;
    otherKeys.forEach((k, i) => {
      if (i === otherKeys.length - 1) {
        result[k] = remaining - distributed;
      } else {
        const proportion = current[k] / otherTotal;
        const val = Math.round(remaining * proportion);
        result[k] = val;
        distributed += val;
      }
    });
  }

  // Clamp all values
  for (const k of keys) {
    result[k] = Math.max(0, Math.min(100, result[k]));
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Mission5Screen({
  onComplete,
  onBack,
}: {
  onComplete: (score: number, data?: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // House fund sliders (5-year horizon — conservative)
  const [houseFund, setHouseFund] = useState({ stocks: 20, bonds: 60, cash: 20 });
  // Retirement fund sliders (30-year horizon — growth)
  const [retirementFund, setRetirementFund] = useState({ stocks: 60, bonds: 30, gold: 10 });

  const updateHouseFund = (key: string, value: number) => {
    const normalised = normaliseAllocation(houseFund, key, value);
    setHouseFund({
      stocks: normalised.stocks,
      bonds: normalised.bonds,
      cash: normalised.cash,
    });
  };

  const updateRetirementFund = (key: string, value: number) => {
    const normalised = normaliseAllocation(retirementFund, key, value);
    setRetirementFund({
      stocks: normalised.stocks,
      bonds: normalised.bonds,
      gold: normalised.gold,
    });
  };

  const houseTotal = houseFund.stocks + houseFund.bonds + houseFund.cash;
  const retireTotal = retirementFund.stocks + retirementFund.bonds + retirementFund.gold;

  const scores = evaluatePortfolio(houseFund, retirementFund);

  // -----------------------------------------------------------------------
  // Phase: Briefing
  // -----------------------------------------------------------------------
  if (phase === "briefing") {
    return (
      <>
        <ScreenHeader title="Mission 5" onBack={onBack} />
        <div className="flex-1 flex flex-col px-5 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
              🏛️
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Asset Classes 101
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Understanding Assets
            </p>

            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-[#FFC800]">
                  Professor Fortuna:
                </span>{" "}
                Every asset class serves a purpose. Today you&apos;ll learn by
                doing — I have a client who needs your help.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
              <span className="bg-muted px-2.5 py-1 rounded-full">
                ⏱ 3-4 minutes
              </span>
              <span className="bg-muted px-2.5 py-1 rounded-full">
                5 asset classes
              </span>
              <span className="bg-muted px-2.5 py-1 rounded-full">+140 XP</span>
            </div>
          </motion.div>

          <Button onClick={() => setPhase("client")} size="lg" className="w-full">
            Meet Your Client
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Phase: Client Brief
  // -----------------------------------------------------------------------
  if (phase === "client") {
    return (
      <>
        <ScreenHeader title="Mission 5" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-4">
              Your Client
            </h2>

            {/* Client card */}
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-5">
              {/* Header row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl shrink-0">
                  👩‍💼
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Maria</h3>
                  <p className="text-xs text-muted-foreground">Age 35</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Income
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    CHF 95,000/yr
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Savings
                  </p>
                  <p className="text-sm font-bold text-foreground">CHF 40,000</p>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-blue-50/50 rounded-xl p-3">
                  <span className="text-lg">🏠</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Goal 1: Buy a house in 5 years
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Needs ~CHF 80,000 for down payment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-amber-50/50 rounded-xl p-3">
                  <span className="text-lg">🏖️</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Goal 2: Start retirement savings
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      30 years away
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Risk tolerance:
                </span>
                <span className="text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full">
                  Cautious but open to learning
                </span>
              </div>
            </div>

            {/* Professor comment */}
            <div className="bg-white rounded-2xl p-5 border border-[#FFC800]/20 shadow-sm mb-6">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-[#FFC800]">
                  Professor Fortuna:
                </span>{" "}
                Maria has two very different goals with two very different time
                horizons. That&apos;s the key insight here.
              </p>
            </div>
          </motion.div>

          <Button onClick={() => setPhase("build")} size="lg" className="w-full">
            Build Her Portfolio
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Phase: Build (Asset cards + Portfolio sliders)
  // -----------------------------------------------------------------------
  if (phase === "build") {
    return (
      <>
        <ScreenHeader title="Mission 5" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Asset class fact cards */}
          <h2 className="text-sm font-bold text-foreground mb-3">
            Asset Classes
          </h2>
          <div className="space-y-2 mb-6">
            {ASSET_CLASSES.map((asset, i) => {
              const isExpanded = expandedCard === i;
              return (
                <button
                  key={asset.name}
                  onClick={() => setExpandedCard(isExpanded ? null : i)}
                  className={cn(
                    "w-full text-left rounded-xl border border-border shadow-sm transition-all overflow-hidden",
                    isExpanded
                      ? cn("border-l-4", asset.borderColor, asset.color)
                      : "bg-white"
                  )}
                >
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-xl">{asset.icon}</span>
                    <span className="text-sm font-semibold text-foreground flex-1">
                      {asset.name}
                    </span>
                    <motion.span
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      className="text-muted-foreground"
                    >
                      <ChevronRight size={16} />
                    </motion.span>
                  </div>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-3 pb-3"
                    >
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {asset.description}
                      </p>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Portfolio allocation */}
          <div className="space-y-5 mb-6">
            {/* House Fund */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-foreground">
                  🏠 House Fund{" "}
                  <span className="text-muted-foreground font-normal">
                    (5 years)
                  </span>
                </h3>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    houseTotal === 100
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {houseTotal}%
                </span>
              </div>
              <div className="space-y-4">
                <AllocationSlider
                  label="Stocks"
                  icon="📈"
                  value={houseFund.stocks}
                  onChange={(v) => updateHouseFund("stocks", v)}
                  color="#3B82F6"
                />
                <AllocationSlider
                  label="Bonds"
                  icon="🛡️"
                  value={houseFund.bonds}
                  onChange={(v) => updateHouseFund("bonds", v)}
                  color="#22C55E"
                />
                <AllocationSlider
                  label="Cash"
                  icon="💵"
                  value={houseFund.cash}
                  onChange={(v) => updateHouseFund("cash", v)}
                  color="#10B981"
                />
              </div>
            </div>

            {/* Retirement Fund */}
            <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-foreground">
                  🏖️ Retirement Fund{" "}
                  <span className="text-muted-foreground font-normal">
                    (30 years)
                  </span>
                </h3>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    retireTotal === 100
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {retireTotal}%
                </span>
              </div>
              <div className="space-y-4">
                <AllocationSlider
                  label="Stocks"
                  icon="📈"
                  value={retirementFund.stocks}
                  onChange={(v) => updateRetirementFund("stocks", v)}
                  color="#3B82F6"
                />
                <AllocationSlider
                  label="Bonds"
                  icon="🛡️"
                  value={retirementFund.bonds}
                  onChange={(v) => updateRetirementFund("bonds", v)}
                  color="#22C55E"
                />
                <AllocationSlider
                  label="Gold"
                  icon="🥇"
                  value={retirementFund.gold}
                  onChange={(v) => updateRetirementFund("gold", v)}
                  color="#F59E0B"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => setPhase("evaluation")}
            size="lg"
            className="w-full"
            disabled={houseTotal !== 100 || retireTotal !== 100}
          >
            Submit Portfolio
            <ChevronRight size={18} />
          </Button>
        </div>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Phase: Evaluation
  // -----------------------------------------------------------------------
  return (
    <>
      <ScreenHeader title="Portfolio Review" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Overall score */}
          <div className="text-center mb-5">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-[#FFC800] to-[#E6B400] rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <span className="text-3xl font-black text-[#1A2332]">
                {scores.overall}
              </span>
            </motion.div>
            <h2 className="text-lg font-bold text-foreground">
              Portfolio Score
            </h2>
          </div>

          {/* Criteria breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm space-y-4 mb-4">
            <ScoreBar label="House Fund Safety" score={scores.houseSafety} />
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-bold text-[#FFC800]">
                  Professor Fortuna:
                </span>{" "}
                {getHouseFundComment(houseFund.stocks)}
              </p>
            </div>

            <ScoreBar label="Retirement Growth" score={scores.retirementGrowth} />
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-bold text-[#FFC800]">
                  Professor Fortuna:
                </span>{" "}
                {getRetirementComment(retirementFund.stocks)}
              </p>
            </div>

            <ScoreBar label="Cash Buffer" score={scores.cashBuffer} />
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-bold text-[#FFC800]">
                  Professor Fortuna:
                </span>{" "}
                {getCashBufferComment(houseFund.cash)}
              </p>
            </div>
          </div>

          {/* Overall professor comment */}
          <div className="bg-white rounded-2xl p-5 border border-[#FFC800]/20 shadow-sm mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-[#FFC800]">
                Professor Fortuna:
              </span>{" "}
              {getOverallComment(scores.overall)}
            </p>
          </div>

          <Button
            onClick={() =>
              onComplete(scores.overall, {
                assetKnowledgeScore: scores.overall,
                houseFundSafety: scores.houseSafety,
                retirementGrowth: scores.retirementGrowth,
                cashBuffer: scores.cashBuffer,
                houseFundAllocation: houseFund,
                retirementFundAllocation: retirementFund,
              })
            }
            size="lg"
            className="w-full"
          >
            <Sparkles size={18} />
            Complete Mission
          </Button>
        </motion.div>
      </div>
    </>
  );
}
