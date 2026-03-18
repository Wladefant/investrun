"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { ScreenHeader } from "@/components/academy/MobileLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "briefing" | "setup" | "arena" | "decision" | "results";

interface Allocation {
  swissStocks: number;
  usStocks: number;
  euStocks: number;
  bonds: number;
  gold: number;
  cash: number;
}

interface Participant {
  id: string;
  name: string;
  emoji: string;
  color: string;
  allocation: Allocation;
  value: number;
  prevRank: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STARTING_VALUE = 100_000;

const YEARLY_RETURNS = [
  { year: 1, stocks: 0.08, bonds: 0.02, gold: 0.05, cash: 0.005 },
  { year: 2, stocks: 0.12, bonds: 0.01, gold: -0.03, cash: 0.005 },
  { year: 3, stocks: -0.25, bonds: 0.04, gold: 0.15, cash: 0.005 }, // CRASH
  { year: 4, stocks: 0.18, bonds: 0.01, gold: 0.02, cash: 0.005 },
  { year: 5, stocks: 0.1, bonds: 0.02, gold: 0.08, cash: 0.005 },
  { year: 6, stocks: 0.06, bonds: 0.03, gold: -0.02, cash: 0.005 },
  { year: 7, stocks: -0.15, bonds: 0.05, gold: 0.12, cash: 0.005 }, // CORRECTION
  { year: 8, stocks: 0.22, bonds: 0.01, gold: -0.05, cash: 0.005 },
  { year: 9, stocks: 0.09, bonds: 0.02, gold: 0.03, cash: 0.005 },
  { year: 10, stocks: 0.11, bonds: 0.02, gold: 0.04, cash: 0.005 },
];

const DECISION_YEARS = [3, 6, 8];

const ASSET_LABELS: { key: keyof Allocation; label: string }[] = [
  { key: "swissStocks", label: "Swiss Stocks" },
  { key: "usStocks", label: "US Stocks" },
  { key: "euStocks", label: "EU Stocks" },
  { key: "bonds", label: "Bonds" },
  { key: "gold", label: "Gold" },
  { key: "cash", label: "Cash" },
];

const BOTS: {
  id: string;
  name: string;
  emoji: string;
  color: string;
  dotColor: string;
  desc: string;
}[] = [
  {
    id: "alice",
    name: "Aggressive Alice",
    emoji: "🔴",
    color: "#EF4444",
    dotColor: "bg-red-500",
    desc: "100% stocks, buys every dip",
  },
  {
    id: "carlos",
    name: "Cautious Carlos",
    emoji: "🔵",
    color: "#3B82F6",
    dotColor: "bg-blue-500",
    desc: "80% bonds and cash, sells at first trouble",
  },
  {
    id: "tanya",
    name: "Trendy Tanya",
    emoji: "🟣",
    color: "#A855F7",
    dotColor: "bg-purple-500",
    desc: "Chases whatever did best last year",
  },
  {
    id: "stefan",
    name: "Steady Stefan",
    emoji: "🟢",
    color: "#22C55E",
    dotColor: "bg-green-500",
    desc: "60/40 balanced, rebalances yearly, never panics",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function totalStocks(a: Allocation): number {
  return a.swissStocks + a.usStocks + a.euStocks;
}

function allocTotal(a: Allocation): number {
  return a.swissStocks + a.usStocks + a.euStocks + a.bonds + a.gold + a.cash;
}

function weightedReturn(a: Allocation, yr: (typeof YEARLY_RETURNS)[number]): number {
  const stockShare = totalStocks(a) / 100;
  const bondShare = a.bonds / 100;
  const goldShare = a.gold / 100;
  const cashShare = a.cash / 100;
  return stockShare * yr.stocks + bondShare * yr.bonds + goldShare * yr.gold + cashShare * yr.cash;
}

function applyYear(value: number, a: Allocation, yr: (typeof YEARLY_RETURNS)[number]): number {
  return value * (1 + weightedReturn(a, yr));
}

/** Herfindahl-Hirschman Index for diversification (lower = more diversified) */
function hhi(a: Allocation): number {
  const shares = [a.swissStocks, a.usStocks, a.euStocks, a.bonds, a.gold, a.cash].map(
    (v) => v / 100
  );
  return shares.reduce((sum, s) => sum + s * s, 0);
}

function formatCHF(v: number): string {
  if (v >= 1_000_000) return `CHF ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `CHF ${(v / 1_000).toFixed(0)}k`;
  return `CHF ${v.toFixed(0)}`;
}

function pctChange(current: number, start: number): string {
  const pct = ((current - start) / start) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

// Bot strategy: compute next-year allocation
function botAllocAfterYear(
  botId: string,
  currentAlloc: Allocation,
  yearIndex: number // 0-based, the year that just completed
): Allocation {
  const yr = YEARLY_RETURNS[yearIndex];

  switch (botId) {
    case "alice": {
      // 100% equities. In crash years, moves everything to stocks.
      if (yr.stocks < 0) {
        return { swissStocks: 34, usStocks: 33, euStocks: 33, bonds: 0, gold: 0, cash: 0 };
      }
      return { swissStocks: 34, usStocks: 33, euStocks: 33, bonds: 0, gold: 0, cash: 0 };
    }
    case "carlos": {
      // Sells stocks after any negative stock year
      if (yr.stocks < 0) {
        return { swissStocks: 0, usStocks: 0, euStocks: 0, bonds: 60, gold: 20, cash: 20 };
      }
      return { swissStocks: 7, usStocks: 7, euStocks: 6, bonds: 50, gold: 20, cash: 10 };
    }
    case "tanya": {
      // Goes 70% into best asset class last year, 30% split among rest
      const returns = { stocks: yr.stocks, bonds: yr.bonds, gold: yr.gold, cash: yr.cash };
      const best = (Object.keys(returns) as (keyof typeof returns)[]).reduce((a, b) =>
        returns[a] > returns[b] ? a : b
      );
      const base: Allocation = {
        swissStocks: 8,
        usStocks: 7,
        euStocks: 7,
        bonds: 8,
        gold: 0,
        cash: 0,
      };
      // Distribute 30% among non-best, 70% to best
      if (best === "stocks") {
        return { swissStocks: 24, usStocks: 23, euStocks: 23, bonds: 10, gold: 10, cash: 10 };
      } else if (best === "bonds") {
        return { swissStocks: 8, usStocks: 7, euStocks: 7, bonds: 70, gold: 4, cash: 4 };
      } else if (best === "gold") {
        return { swissStocks: 8, usStocks: 7, euStocks: 7, bonds: 4, gold: 70, cash: 4 };
      }
      return base; // cash best (unlikely)
    }
    case "stefan": {
      // Always rebalances to 60/40 target
      return { swissStocks: 14, usStocks: 13, euStocks: 13, bonds: 30, gold: 15, cash: 15 };
    }
    default:
      return currentAlloc;
  }
}

function getInitialBotAlloc(botId: string): Allocation {
  switch (botId) {
    case "alice":
      return { swissStocks: 34, usStocks: 33, euStocks: 33, bonds: 0, gold: 0, cash: 0 };
    case "carlos":
      return { swissStocks: 7, usStocks: 7, euStocks: 6, bonds: 50, gold: 20, cash: 10 };
    case "tanya":
      return { swissStocks: 17, usStocks: 17, euStocks: 16, bonds: 17, gold: 17, cash: 16 };
    case "stefan":
      return { swissStocks: 14, usStocks: 13, euStocks: 13, bonds: 30, gold: 15, cash: 15 };
    default:
      return { swissStocks: 17, usStocks: 17, euStocks: 16, bonds: 17, gold: 17, cash: 16 };
  }
}

function getDecisionDialogue(yearNum: number): { botId: string; line: string }[] {
  if (yearNum === 3) {
    return [
      { botId: "alice", line: "Stocks are ON SALE! I'm buying everything!" },
      { botId: "carlos", line: "I told you stocks were dangerous. My bonds are fine." },
      { botId: "tanya", line: "Gold did great last year, I'm going all in on gold!" },
      { botId: "stefan", line: "Rebalancing back to 60/40. Same as always." },
    ];
  }
  if (yearNum === 6) {
    return [
      { botId: "alice", line: "Still all in on stocks. They always come back!" },
      { botId: "carlos", line: "Markets feel shaky. Moving more into bonds." },
      { botId: "tanya", line: "Stocks have been climbing, I'm following the trend!" },
      { botId: "stefan", line: "Rebalancing. Discipline beats emotion." },
    ];
  }
  // Year 8
  return [
    { botId: "alice", line: "Told you! Stocks are booming. Never sell!" },
    { botId: "carlos", line: "I missed the recovery... maybe I should buy stocks now?" },
    { botId: "tanya", line: "Stocks did amazing, switching everything to stocks!" },
    { botId: "stefan", line: "Rebalancing again. Boring works." },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Mission6Screen({
  onComplete,
  onBack,
}: {
  onComplete: (score: number, data?: Record<string, unknown>) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [currentYear, setCurrentYear] = useState(0); // 0 = not started, 1-10 = year completed
  const [playerAlloc, setPlayerAlloc] = useState<Allocation>({
    swissStocks: 20,
    usStocks: 20,
    euStocks: 10,
    bonds: 25,
    gold: 15,
    cash: 10,
  });
  const [tempAlloc, setTempAlloc] = useState<Allocation>(playerAlloc);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [panicSellCount, setPanicSellCount] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [heldThroughCrash, setHeldThroughCrash] = useState(true);
  const [finalScore, setFinalScore] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Initialize participants
  const initParticipants = useCallback(
    (alloc: Allocation) => {
      const player: Participant = {
        id: "player",
        name: "YOU",
        emoji: "🏆",
        color: "#FFC800",
        allocation: { ...alloc },
        value: STARTING_VALUE,
        prevRank: 1,
      };
      const bots: Participant[] = BOTS.map((b, i) => ({
        id: b.id,
        name: b.name.split(" ")[1], // Alice, Carlos, etc.
        emoji: b.emoji,
        color: b.color,
        allocation: getInitialBotAlloc(b.id),
        value: STARTING_VALUE,
        prevRank: i + 2,
      }));
      setParticipants([player, ...bots]);
    },
    []
  );

  // Advance one year for all participants
  const advanceYear = useCallback(
    (prevParticipants: Participant[], yearIndex: number): Participant[] => {
      const yr = YEARLY_RETURNS[yearIndex];
      const updated = prevParticipants.map((p) => {
        const newValue = applyYear(p.value, p.allocation, yr);
        // Update bot allocations for next year
        const newAlloc =
          p.id === "player"
            ? p.allocation
            : botAllocAfterYear(p.id, p.allocation, yearIndex);
        return { ...p, value: newValue, allocation: newAlloc };
      });
      // Sort and assign ranks
      const sorted = [...updated].sort((a, b) => b.value - a.value);
      return updated.map((p) => ({
        ...p,
        prevRank: sorted.findIndex((s) => s.id === p.id) + 1,
      }));
    },
    []
  );

  // Start arena simulation
  const startArena = useCallback(() => {
    let year = 0;
    let currentParticipants = participants;

    intervalRef.current = setInterval(() => {
      if (year >= 10) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("results");
        return;
      }

      const nextParticipants = advanceYear(currentParticipants, year);
      currentParticipants = nextParticipants;
      year++;

      setParticipants(nextParticipants);
      setCurrentYear(year);

      // Check for decision points
      if (DECISION_YEARS.includes(year)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("decision");
      }
    }, 800);
  }, [participants, advanceYear]);

  // Resume after decision
  const resumeArena = useCallback(() => {
    setPhase("arena");
    let year = currentYear;
    let currentParticipants = participants;

    intervalRef.current = setInterval(() => {
      if (year >= 10) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("results");
        return;
      }

      const nextParticipants = advanceYear(currentParticipants, year);
      currentParticipants = nextParticipants;
      year++;

      setParticipants(nextParticipants);
      setCurrentYear(year);

      if (DECISION_YEARS.includes(year)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("decision");
      }
    }, 800);
  }, [currentYear, participants, advanceYear]);

  // Calculate final score
  const calculateScore = useCallback((): number => {
    const playerP = participants.find((p) => p.id === "player");
    if (!playerP) return 0;

    const bestBotValue = Math.max(
      ...participants.filter((p) => p.id !== "player").map((p) => p.value)
    );

    // Returns component (25%): relative to best bot
    const returnRatio = Math.min(playerP.value / bestBotValue, 1.2);
    const returnsScore = Math.round(returnRatio * 25);

    // Diversification (25%): lower HHI = better
    const playerHHI = hhi(playerP.allocation);
    // Perfect diversification (equal split 6 ways) = HHI of ~0.167
    // Worst (100% one asset) = 1.0
    const divScore = Math.round(Math.max(0, (1 - playerHHI) * 30));
    const divCapped = Math.min(divScore, 25);

    // Behavioral (25%): penalty for panic selling, bonus for holding
    let behavScore = 20;
    behavScore -= panicSellCount * 8;
    if (heldThroughCrash) behavScore += 5;
    behavScore = Math.max(0, Math.min(25, behavScore));

    // Consistency (25%): fewer trades = better
    const consistScore = Math.max(0, 25 - tradeCount * 5);

    return Math.min(100, returnsScore + divCapped + behavScore + consistScore);
  }, [participants, panicSellCount, heldThroughCrash, tradeCount]);

  // Handle setup slider change
  const handleSliderChange = (key: keyof Allocation, value: number) => {
    setTempAlloc((prev) => ({ ...prev, [key]: value }));
  };

  // Lock in setup allocation
  const handleLockIn = () => {
    const total = allocTotal(tempAlloc);
    if (total !== 100) return;
    setPlayerAlloc({ ...tempAlloc });
    initParticipants(tempAlloc);
    setPhase("arena");
  };

  // After initParticipants sets state, start the arena
  useEffect(() => {
    if (phase === "arena" && currentYear === 0 && participants.length > 0) {
      startArena();
    }
  }, [phase, currentYear, participants.length, startArena]);

  // Decision: hold
  const handleHold = () => {
    resumeArena();
  };

  // Decision: rebalance
  const handleRebalance = () => {
    const total = allocTotal(tempAlloc);
    if (total !== 100) return;
    setPlayerAlloc({ ...tempAlloc });
    setParticipants((prev) =>
      prev.map((p) => (p.id === "player" ? { ...p, allocation: { ...tempAlloc } } : p))
    );
    setTradeCount((c) => c + 1);
    resumeArena();
  };

  // Decision: panic sell
  const handlePanicSell = () => {
    const cashAlloc: Allocation = {
      swissStocks: 0,
      usStocks: 0,
      euStocks: 0,
      bonds: 0,
      gold: 0,
      cash: 100,
    };
    setPlayerAlloc(cashAlloc);
    setParticipants((prev) =>
      prev.map((p) => (p.id === "player" ? { ...p, allocation: cashAlloc } : p))
    );
    setPanicSellCount((c) => c + 1);
    setTradeCount((c) => c + 1);
    if (currentYear === 3 || currentYear === 7) setHeldThroughCrash(false);
    resumeArena();
  };

  // When entering decision phase, reset temp alloc to current player alloc
  useEffect(() => {
    if (phase === "decision") {
      setTempAlloc({ ...playerAlloc });
    }
  }, [phase, playerAlloc]);

  // Calculate score when reaching results
  useEffect(() => {
    if (phase === "results") {
      setFinalScore(calculateScore());
    }
  }, [phase, calculateScore]);

  // Sort participants by value for leaderboard
  const ranked = [...participants].sort((a, b) => b.value - a.value);

  // -------------------------------------------------------------------------
  // RENDER: Briefing
  // -------------------------------------------------------------------------
  if (phase === "briefing") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ScreenHeader title="Mission 6" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Mission icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-4xl shadow-lg">
              ⚔️
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-[#1A2332]">The Arena</h2>
            <p className="text-sm text-muted-foreground">Competitive Challenge</p>
          </div>

          {/* Professor intro */}
          <div className="border border-border shadow-sm rounded-2xl bg-white p-4">
            <p className="text-sm leading-relaxed">
              <span className="font-bold text-[#FFC800]">Professor Fortuna:</span>{" "}
              &quot;Your final exam before graduation. You&apos;ll face the same market as
              your classmates. Let&apos;s see who invests best.&quot;
            </p>
          </div>

          {/* Bot cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1A2332]">Your Competitors</h3>
            {BOTS.map((bot) => (
              <div
                key={bot.id}
                className="border border-border shadow-sm rounded-2xl bg-white p-4 flex items-start gap-3"
              >
                <span className="text-2xl">{bot.emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-[#1A2332]">{bot.name}</p>
                  <p className="text-xs text-muted-foreground">{bot.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full h-12 rounded-xl bg-[#FFC800] text-[#1A2332] font-bold text-base hover:bg-[#FFD633]"
            onClick={() => setPhase("setup")}
          >
            Enter the Arena
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: Setup
  // -------------------------------------------------------------------------
  if (phase === "setup") {
    const total = allocTotal(tempAlloc);
    const isValid = total === 100;

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ScreenHeader title="Portfolio Setup" onBack={() => setPhase("briefing")} />
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          <div className="border border-border shadow-sm rounded-2xl bg-white p-4">
            <p className="text-sm leading-relaxed">
              <span className="font-bold text-[#FFC800]">Professor Fortuna:</span>{" "}
              &quot;Set your starting allocation. You&apos;ll get chances to adjust during
              the 10-year simulation.&quot;
            </p>
          </div>

          <div className="space-y-4">
            {ASSET_LABELS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#1A2332] font-medium">{label}</span>
                  <span className="font-bold text-[#1A2332]">{tempAlloc[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={tempAlloc[key]}
                  onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                  className="w-full accent-[#FFC800]"
                />
              </div>
            ))}
          </div>

          <div
            className={cn(
              "text-center text-sm font-bold py-2 rounded-xl",
              isValid ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
            )}
          >
            Total: {total}% {isValid ? "✓" : `(must be 100%)`}
          </div>

          <Button
            className="w-full h-12 rounded-xl bg-[#FFC800] text-[#1A2332] font-bold text-base hover:bg-[#FFD633] disabled:opacity-40"
            disabled={!isValid}
            onClick={handleLockIn}
          >
            Lock In &amp; Start
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: Arena (simulation running)
  // -------------------------------------------------------------------------
  if (phase === "arena") {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "#0F1419" }}>
        <ScreenHeader title="The Arena" onBack={onBack} variant="dark" />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Year indicator */}
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Simulating</p>
            <p className="text-3xl font-bold text-white">
              Year {currentYear}{" "}
              <span className="text-sm text-gray-400">/ 10</span>
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFC800] rounded-full transition-all duration-700"
                style={{ width: `${(currentYear / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard ranked={ranked} />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: Decision Point
  // -------------------------------------------------------------------------
  if (phase === "decision") {
    const dialogue = getDecisionDialogue(currentYear);
    const total = allocTotal(tempAlloc);
    const isValid = total === 100;

    const yearData = YEARLY_RETURNS[currentYear - 1];
    const yearLabel =
      currentYear === 3
        ? "MARKET CRASH"
        : currentYear === 7
          ? "MARKET CORRECTION"
          : "Market Update";

    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "#0F1419" }}>
        <ScreenHeader title={`Year ${currentYear} — Decision`} onBack={onBack} variant="dark" />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Event banner */}
          <div
            className={cn(
              "rounded-2xl p-4 text-center",
              yearData.stocks < 0
                ? "bg-red-900/40 border border-red-700"
                : "bg-blue-900/30 border border-blue-700"
            )}
          >
            <p className="text-xs uppercase tracking-wider text-gray-300">{yearLabel}</p>
            <p className="text-2xl font-bold text-white mt-1">
              Stocks: {yearData.stocks > 0 ? "+" : ""}
              {(yearData.stocks * 100).toFixed(0)}%
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-300">
              <span>
                Bonds: {yearData.bonds > 0 ? "+" : ""}
                {(yearData.bonds * 100).toFixed(0)}%
              </span>
              <span>
                Gold: {yearData.gold > 0 ? "+" : ""}
                {(yearData.gold * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Current standings */}
          <Leaderboard ranked={ranked} compact />

          {/* Bot dialogue */}
          <div className="space-y-2">
            {dialogue.map((d) => {
              const bot = BOTS.find((b) => b.id === d.botId)!;
              return (
                <div
                  key={d.botId}
                  className="bg-gray-800 rounded-xl p-3 border-l-4"
                  style={{ borderLeftColor: bot.color }}
                >
                  <p className="text-xs text-gray-300">
                    <span className="font-bold" style={{ color: bot.color }}>
                      {bot.emoji} {bot.name.split(" ")[1]}:
                    </span>{" "}
                    &quot;{d.line}&quot;
                  </p>
                </div>
              );
            })}
          </div>

          {/* Player decision */}
          <div className="bg-gray-800/80 rounded-2xl p-4 space-y-4 border border-gray-700">
            <p className="text-sm font-bold text-[#FFC800]">Your Decision</p>

            {/* Rebalance sliders (collapsible feel) */}
            <div className="space-y-2">
              {ASSET_LABELS.map(({ key, label }) => (
                <div key={key} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">{label}</span>
                    <span className="font-bold text-white">{tempAlloc[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={tempAlloc[key]}
                    onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                    className="w-full accent-[#FFC800]"
                  />
                </div>
              ))}
              <div
                className={cn(
                  "text-center text-xs font-bold py-1 rounded-lg",
                  isValid ? "text-green-400" : "text-red-400"
                )}
              >
                Total: {total}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                className="h-10 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700"
                onClick={handleHold}
              >
                Hold
              </Button>
              <Button
                className="h-10 rounded-xl bg-[#FFC800] text-[#1A2332] text-xs font-bold hover:bg-[#FFD633] disabled:opacity-40"
                disabled={!isValid}
                onClick={handleRebalance}
              >
                Rebalance
              </Button>
              <Button
                className="h-10 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                onClick={handlePanicSell}
              >
                Panic Sell
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: Results
  // -------------------------------------------------------------------------
  const playerP = participants.find((p) => p.id === "player");
  const podium = ranked.slice(0, 3);

  const botLessons: Record<string, string> = {
    alice: "High risk can mean high reward — but also the biggest drawdowns.",
    carlos: "Playing it safe protects capital, but inflation and missed rallies cost long-term.",
    tanya: "Chasing last year's winner is the most common (and costly) amateur mistake.",
    stefan: "Boring, disciplined rebalancing often beats excitement over a full cycle.",
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ScreenHeader title="Arena Results" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* Podium */}
        <div className="flex items-end justify-center gap-3 h-40">
          {/* 2nd place */}
          {podium[1] && (
            <div className="flex flex-col items-center">
              <span className="text-2xl">{podium[1].emoji}</span>
              <div className="bg-gray-200 rounded-t-xl w-20 h-20 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-500">2nd</span>
                <span className="text-xs font-semibold text-[#1A2332]">{podium[1].name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatCHF(podium[1].value)}
                </span>
              </div>
            </div>
          )}
          {/* 1st place */}
          {podium[0] && (
            <div className="flex flex-col items-center">
              <Trophy className="w-6 h-6 text-[#FFC800] mb-1" />
              <span className="text-2xl">{podium[0].emoji}</span>
              <div className="bg-[#FFC800]/20 border-2 border-[#FFC800] rounded-t-xl w-24 h-28 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-[#FFC800]">1st</span>
                <span className="text-sm font-bold text-[#1A2332]">{podium[0].name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCHF(podium[0].value)}
                </span>
              </div>
            </div>
          )}
          {/* 3rd place */}
          {podium[2] && (
            <div className="flex flex-col items-center">
              <span className="text-2xl">{podium[2].emoji}</span>
              <div className="bg-gray-100 rounded-t-xl w-20 h-16 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400">3rd</span>
                <span className="text-xs font-semibold text-[#1A2332]">{podium[2].name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatCHF(podium[2].value)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Full leaderboard with final values */}
        <div className="border border-border shadow-sm rounded-2xl bg-white p-4 space-y-3">
          <h3 className="text-sm font-bold text-[#1A2332]">Final Standings</h3>
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl text-sm",
                p.id === "player" && "bg-[#FFC800]/10 border border-[#FFC800]/30"
              )}
            >
              <span className="w-6 text-center font-bold text-[#1A2332]">{i + 1}</span>
              <span>{p.emoji}</span>
              <span className="flex-1 font-medium text-[#1A2332]">
                {p.id === "player" ? "YOU" : p.name}
              </span>
              <span className="font-bold text-[#1A2332]">{formatCHF(p.value)}</span>
              <span
                className={cn(
                  "text-xs font-medium",
                  p.value >= STARTING_VALUE ? "text-green-600" : "text-red-500"
                )}
              >
                {pctChange(p.value, STARTING_VALUE)}
              </span>
            </div>
          ))}
        </div>

        {/* Score breakdown */}
        {playerP && (
          <div className="border border-border shadow-sm rounded-2xl bg-white p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#1A2332]">Your Arena Score</h3>
            <div className="text-center">
              <span className="text-4xl font-bold text-[#FFC800]">{finalScore}</span>
              <span className="text-lg text-gray-400">/100</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-muted-foreground">Returns</p>
                <p className="font-bold text-[#1A2332]">{pctChange(playerP.value, STARTING_VALUE)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-muted-foreground">Diversification</p>
                <p className="font-bold text-[#1A2332]">
                  {hhi(playerP.allocation) < 0.25 ? "Good" : "Low"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-muted-foreground">Panic Sells</p>
                <p className="font-bold text-[#1A2332]">{panicSellCount}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-muted-foreground">Trades</p>
                <p className="font-bold text-[#1A2332]">{tradeCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bot lessons */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#1A2332]">What Each Strategy Taught Us</h3>
          {BOTS.map((bot) => {
            const botP = participants.find((p) => p.id === bot.id);
            return (
              <div
                key={bot.id}
                className="border border-border shadow-sm rounded-2xl bg-white p-3 flex items-start gap-3"
              >
                <span className="text-lg">{bot.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1A2332]">{bot.name}</p>
                    {botP && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatCHF(botP.value)} ({pctChange(botP.value, STARTING_VALUE)})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{botLessons[bot.id]}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Professor debrief */}
        <div className="border border-border shadow-sm rounded-2xl bg-white p-4">
          <p className="text-sm leading-relaxed">
            <span className="font-bold text-[#FFC800]">Professor Fortuna:</span>{" "}
            &quot;Notice? The player with the highest returns isn&apos;t always first.
            That&apos;s because the Arena scores on behavior, not luck. Discipline,
            diversification, and consistency matter more than chasing returns.&quot;
          </p>
        </div>

        <Button
          className="w-full h-12 rounded-xl bg-[#FFC800] text-[#1A2332] font-bold text-base hover:bg-[#FFD633]"
          onClick={() => onComplete(finalScore, { arenaScore: finalScore })}
        >
          Complete Mission
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard sub-component (inline)
// ---------------------------------------------------------------------------

function Leaderboard({
  ranked,
  compact,
}: {
  ranked: Participant[];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3 space-y-1",
        compact ? "bg-gray-800/60" : "bg-gray-800/80 border border-gray-700"
      )}
    >
      {/* Header row */}
      <div className="grid grid-cols-[2rem_1.5rem_1fr_5rem_3.5rem] text-[10px] text-gray-500 uppercase tracking-wider px-1">
        <span>Rank</span>
        <span />
        <span>Name</span>
        <span className="text-right">Value</span>
        <span className="text-right">Chg</span>
      </div>
      {ranked.map((p, i) => {
        const rank = i + 1;
        const rankDiff = p.prevRank - rank; // positive = moved up
        return (
          <div
            key={p.id}
            className={cn(
              "grid grid-cols-[2rem_1.5rem_1fr_5rem_3.5rem] items-center rounded-xl px-1",
              compact ? "py-1" : "py-1.5",
              p.id === "player" && "bg-[#FFC800]/15"
            )}
          >
            <span className="text-sm font-bold text-white">{rank}</span>
            <span className="text-sm">{p.emoji}</span>
            <span
              className={cn(
                "text-xs font-semibold truncate",
                p.id === "player" ? "text-[#FFC800]" : "text-gray-200"
              )}
            >
              {p.id === "player" ? "YOU" : p.name}
            </span>
            <span className="text-xs font-mono text-right text-white">
              {formatCHF(p.value)}
            </span>
            <span className="text-right flex items-center justify-end gap-0.5">
              {rankDiff > 0 && (
                <TrendingUp className="w-3 h-3 text-green-400" />
              )}
              {rankDiff < 0 && (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium",
                  p.value >= STARTING_VALUE ? "text-green-400" : "text-red-400"
                )}
              >
                {pctChange(p.value, STARTING_VALUE)}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Mission6Screen;
