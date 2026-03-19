'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArenaStore, DEFAULT_RISK, STARTING_CAPITAL, TOTAL_ROUNDS } from '@/lib/arena-store';
import {
  getAllocationFromRisk,
  applyRoundReturn,
  calculateRoundReturn,
  formatCHF,
  getVolatilityScale,
  getRiskLabel,
} from '@/lib/arena-engine';
import { calculateOpponentRisk } from '@/lib/arena-opponents';
import { getArenaRounds, getScenarioById } from '@/data/arena-scenarios';
import type { ScenarioEvent } from '@/data/arena-scenarios';
import type { ArenaAssetClass } from '@/data/arena-scenarios';

interface ArenaMatchProps {
  playerName: string;
  opponentName: string;
}

// Asset display metadata
const ASSET_META: Record<ArenaAssetClass, { label: string; color: string }> = {
  'global-equity': { label: 'Equity', color: 'bg-blue-500' },
  'swiss-equity':  { label: 'CH Eq', color: 'bg-sky-500' },
  'bonds':         { label: 'Bonds', color: 'bg-emerald-500' },
  'cash':          { label: 'Cash', color: 'bg-slate-400' },
  'gold':          { label: 'Gold', color: 'bg-yellow-500' },
  'bitcoin':       { label: 'BTC', color: 'bg-orange-500' },
  'tech-growth':   { label: 'Tech', color: 'bg-purple-500' },
};

function getEventStyle(type: ScenarioEvent['type']) {
  if (type === 'crash' || type === 'crisis') {
    return {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      dotColor: 'bg-red-500',
      icon: <TrendingDown size={18} className="text-red-500" />,
    };
  }
  if (type === 'bull' || type === 'boom') {
    return {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      dotColor: 'bg-emerald-500',
      icon: <TrendingUp size={18} className="text-emerald-500" />,
    };
  }
  if (type === 'recovery') {
    return {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      dotColor: 'bg-amber-500',
      icon: <RefreshCw size={18} className="text-amber-500" />,
    };
  }
  return {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    dotColor: 'bg-amber-500',
    icon: <AlertTriangle size={18} className="text-amber-500" />,
  };
}

// SVG circular countdown timer
function CircleTimer({ seconds, max }: { seconds: number; max: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, seconds / max);
  const dashoffset = circumference * (1 - progress);

  const colorClass =
    seconds > 10 ? 'text-emerald-500' : seconds > 5 ? 'text-amber-500' : 'text-red-500';
  const strokeColor =
    seconds > 10 ? '#10b981' : seconds > 5 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      className={cn('relative w-12 h-12 flex items-center justify-center', colorClass)}
      animate={seconds <= 5 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={seconds <= 5 ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <svg width="48" height="48" className="-rotate-90 absolute inset-0">
        {/* Track */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="3"
          className="stroke-muted"
        />
        {/* Progress */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="3"
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className="text-sm font-bold relative z-10">{seconds}</span>
    </motion.div>
  );
}

export function ArenaMatch({ playerName, opponentName }: ArenaMatchProps) {
  const store = useArenaStore();
  const {
    currentRound,
    timer,
    scenarioId,
    currentEvent,
    playerPortfolio,
    playerDecisions,
    opponent,
    timeHorizon,
    setTimer,
    submitRound,
    setPhase,
  } = store;

  // Load rounds once
  const [rounds, setRounds] = useState<ScenarioEvent[]>([]);
  useEffect(() => {
    if (!scenarioId) return;
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return;
    setRounds(getArenaRounds(scenario, TOTAL_ROUNDS));
  }, [scenarioId]);

  // Reset per round
  const [playerRiskInput, setPlayerRiskInput] = useState<number>(DEFAULT_RISK);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setHasSubmitted(false);
    const lastDecision = playerDecisions.length > 0
      ? playerDecisions[playerDecisions.length - 1]
      : DEFAULT_RISK;
    setPlayerRiskInput(lastDecision);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  // Timer tick
  const hasSubmittedRef = useRef(hasSubmitted);
  hasSubmittedRef.current = hasSubmitted;

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasSubmittedRef.current) return;
      const current = useArenaStore.getState().timer;
      if (current <= 1) {
        clearInterval(interval);
        // Auto-submit: read latest playerRiskInput from ref
        handleSubmitRef.current();
      } else {
        setTimer(current - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  // Keep handleSubmit stable via ref so timer can call it without stale closure
  const playerRiskInputRef = useRef(playerRiskInput);
  playerRiskInputRef.current = playerRiskInput;

  const handleSubmitRef = useRef<() => void>(() => {});

  function handleSubmit() {
    if (hasSubmittedRef.current) return;
    setHasSubmitted(true);

    const event = currentEvent ?? rounds[currentRound - 1];
    if (!event || !opponent) return;

    const riskInput = playerRiskInputRef.current;
    const playerAlloc = getAllocationFromRisk(riskInput);

    const prevDecision = playerDecisions.length > 0
      ? playerDecisions[playerDecisions.length - 1]
      : null;
    const opponentRisk = calculateOpponentRisk(
      opponent,
      event.type,
      event.severity,
      prevDecision,
      currentRound
    );
    const opponentAlloc = getAllocationFromRisk(opponentRisk);

    const volScale = getVolatilityScale(timeHorizon);
    const playerReturn = calculateRoundReturn(playerAlloc, event.assetImpacts, volScale);
    const opponentReturn = calculateRoundReturn(opponentAlloc, event.assetImpacts, volScale);

    const currentPlayerValue = playerPortfolio.length > 0
      ? playerPortfolio[playerPortfolio.length - 1]
      : STARTING_CAPITAL;
    const currentOpponentValue = useArenaStore.getState().opponentPortfolio;
    const currentOppValue = currentOpponentValue.length > 0
      ? currentOpponentValue[currentOpponentValue.length - 1]
      : STARTING_CAPITAL;

    const newPlayerValue = applyRoundReturn(currentPlayerValue, playerReturn);
    const newOpponentValue = applyRoundReturn(currentOppValue, opponentReturn);

    submitRound(riskInput, opponentRisk, newPlayerValue, newOpponentValue);
    setPhase('reveal');
  }

  handleSubmitRef.current = handleSubmit;

  const event = currentEvent ?? rounds[currentRound - 1];
  const lastPortfolioValue = playerPortfolio.length > 0
    ? playerPortfolio[playerPortfolio.length - 1]
    : STARTING_CAPITAL;

  const allocation = getAllocationFromRisk(playerRiskInput);
  const riskLabel = getRiskLabel(playerRiskInput);
  const eventStyle = event ? getEventStyle(event.type) : getEventStyle('sideways');

  if (!event) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading round…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-3 space-y-3 pb-6">

        {/* Top bar: Round badge + timer */}
        <div className="flex items-center justify-between">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            Round {currentRound}/{TOTAL_ROUNDS}
          </span>
          <CircleTimer seconds={timer} max={15} />
        </div>

        {/* Score comparison */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5 truncate">{playerName}</p>
              <p className="text-lg font-bold text-primary">{formatCHF(lastPortfolioValue)}</p>
            </div>
            <div className="text-xs font-bold text-muted-foreground shrink-0 px-2">VS</div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5 truncate">{opponentName}</p>
              <p className="text-lg text-muted-foreground">???</p>
            </div>
          </div>
        </div>

        {/* Market Event card */}
        <div className={cn('rounded-2xl border p-3', eventStyle.border, eventStyle.bg)}>
          <div className="flex items-start gap-2 mb-2">
            <div className="shrink-0 mt-0.5">{eventStyle.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            </div>
          </div>
          {/* Severity dots */}
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full',
                  i < event.severity ? eventStyle.dotColor : 'bg-muted'
                )}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">Severity</span>
          </div>
        </div>

        {/* Risk Slider */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">Your Strategy</span>
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full',
              playerRiskInput <= 30
                ? 'bg-emerald-500/10 text-emerald-600'
                : playerRiskInput <= 70
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-red-500/10 text-red-600'
            )}>
              {riskLabel}
            </span>
          </div>

          {/* Range input */}
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={playerRiskInput}
            disabled={hasSubmitted}
            onChange={(e) => setPlayerRiskInput(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right,
                #10b981 0%,
                #f59e0b 50%,
                #ef4444 100%)`,
            }}
          />

          {/* Slider labels */}
          <div className="flex justify-between mt-1 mb-3">
            <span className="text-[10px] text-muted-foreground">Conservative</span>
            <span className="text-[10px] text-muted-foreground">Balanced</span>
            <span className="text-[10px] text-muted-foreground">Aggressive</span>
          </div>

          {/* Allocation bar */}
          <div className="h-4 rounded-full overflow-hidden flex">
            {(Object.entries(allocation) as [ArenaAssetClass, number][])
              .filter(([, pct]) => pct > 0)
              .map(([asset, pct]) => (
                <div
                  key={asset}
                  className={cn('transition-all duration-200', ASSET_META[asset].color)}
                  style={{ width: `${pct}%` }}
                  title={`${ASSET_META[asset].label}: ${Math.round(pct)}%`}
                />
              ))}
          </div>
          {/* Asset legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {(Object.entries(allocation) as [ArenaAssetClass, number][])
              .filter(([, pct]) => pct > 0)
              .map(([asset, pct]) => (
                <div key={asset} className="flex items-center gap-1">
                  <div className={cn('w-2 h-2 rounded-sm shrink-0', ASSET_META[asset].color)} />
                  <span className="text-[10px] text-muted-foreground">
                    {ASSET_META[asset].label} {Math.round(pct)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={hasSubmitted}
          className={cn(
            'w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity',
            'bg-primary text-primary-foreground',
            hasSubmitted && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check size={18} />
          Lock In Decision
        </button>

      </div>
    </div>
  );
}
