'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Swords, Sparkles, ArrowUp, ArrowDown, RotateCcw, Zap, Brain } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useArenaStore, STARTING_CAPITAL, TOTAL_ROUNDS } from '@/lib/arena-store';
import {
  formatCHF,
  getReturnPercentage,
  calculateMatchXP,
  calculateNewElo,
} from '@/lib/arena-engine';
import { OPPONENTS } from '@/lib/arena-opponents';
import { getEloBadgeTier } from '@/data/arena-leaderboard';
import { getArenaRounds, getScenarioById } from '@/data/arena-scenarios';
import { buildMatchContext, fetchArenaAI } from '@/lib/arena-ai';
import { useTypewriter } from '@/hooks/useTypewriter';

interface ArenaResultsProps {
  playerName: string;
  onStatsUpdate: (
    stats: { elo: number; wins: number; losses: number; draws: number },
    xpEarned: number
  ) => void;
}

// Confetti particle — only shown on victory
function ConfettiParticles() {
  const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${8 + i * 9}%`,
    top: `${10 + (i % 3) * 15}%`,
    color: i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-primary' : 'bg-emerald-400',
    rotate: i * 37,
    delay: i * 0.07,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={cn('absolute w-2 h-2 rounded-sm', p.color)}
          style={{ left: p.left, top: p.top }}
          initial={{ opacity: 1, y: 0, rotate: p.rotate }}
          animate={{ opacity: 0, y: 80, rotate: p.rotate + 180 }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export function ArenaResults({ playerName, onStatsUpdate }: ArenaResultsProps) {
  const store = useArenaStore();
  const hasCalledRef = useRef(false);

  const [xpEarned, setXpEarned] = useState(0);
  const [eloChange, setEloChange] = useState(0);
  const [newElo, setNewElo] = useState(store.stats.elo);
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>('draw');
  const [oldTier, setOldTier] = useState(getEloBadgeTier(store.stats.elo));
  const [newTier, setNewTier] = useState(getEloBadgeTier(store.stats.elo));
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  // Run match outcome logic exactly once on mount, then fetch AI analysis
  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const finalPlayerValue =
      store.playerPortfolio[store.playerPortfolio.length - 1] ?? STARTING_CAPITAL;
    const finalOpponentValue =
      store.opponentPortfolio[store.opponentPortfolio.length - 1] ?? STARTING_CAPITAL;

    const matchResult: 'win' | 'loss' | 'draw' =
      finalPlayerValue > finalOpponentValue
        ? 'win'
        : finalPlayerValue < finalOpponentValue
        ? 'loss'
        : 'draw';

    const returnPct = getReturnPercentage(STARTING_CAPITAL, finalPlayerValue);
    const xp = calculateMatchXP(matchResult, returnPct);

    const opponentElo = store.opponent ? OPPONENTS[store.opponent].elo : 1000;
    const computedNewElo = calculateNewElo(
      store.stats.elo,
      opponentElo,
      matchResult === 'win' ? 1 : matchResult === 'draw' ? 0.5 : 0
    );

    const updatedStats = {
      elo: computedNewElo,
      wins: store.stats.wins + (matchResult === 'win' ? 1 : 0),
      losses: store.stats.losses + (matchResult === 'loss' ? 1 : 0),
      draws: store.stats.draws + (matchResult === 'draw' ? 1 : 0),
    };

    setResult(matchResult);
    setXpEarned(xp);
    setEloChange(computedNewElo - store.stats.elo);
    setNewElo(computedNewElo);
    setOldTier(getEloBadgeTier(store.stats.elo));
    setNewTier(getEloBadgeTier(computedNewElo));

    store.updateStats(matchResult, opponentElo);
    onStatsUpdate(updatedStats, xp);

    // Fetch AI post-match analysis after outcome is determined
    if (store.opponent && store.scenarioId) {
      const scenario = getScenarioById(store.scenarioId);
      const events = scenario ? getArenaRounds(scenario, TOTAL_ROUNDS) : [];
      const context = buildMatchContext(
        store.timeHorizon,
        matchResult,
        store.opponent,
        store.playerPortfolio,
        store.opponentPortfolio,
        store.playerDecisions,
        store.opponentDecisions,
        events,
      );
      fetchArenaAI('match', context).then((text) => {
        setAiAnalysis(text);
        setAiLoading(false);
      });
    } else {
      setAiLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalPlayerValue =
    store.playerPortfolio[store.playerPortfolio.length - 1] ?? STARTING_CAPITAL;
  const finalOpponentValue =
    store.opponentPortfolio[store.opponentPortfolio.length - 1] ?? STARTING_CAPITAL;
  const playerReturnPct = getReturnPercentage(STARTING_CAPITAL, finalPlayerValue);
  const opponentReturnPct = getReturnPercentage(STARTING_CAPITAL, finalOpponentValue);

  const opponentName = store.opponent ? OPPONENTS[store.opponent].name : 'Opponent';
  const margin = Math.abs(finalPlayerValue - finalOpponentValue);

  // Build chart data: round 0 = starting capital, then each round
  const chartData = store.playerPortfolio.map((playerVal, i) => ({
    round: i,
    player: Math.round(playerVal),
    opponent: Math.round(store.opponentPortfolio[i] ?? STARTING_CAPITAL),
  }));

  const tierChanged = oldTier !== newTier;

  const { displayed: analysisText, done: analysisDone } = useTypewriter(aiAnalysis);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 space-y-4 pb-8">

        {/* 1. Winner / Loser banner */}
        <motion.div
          className={cn(
            'relative bg-card rounded-2xl shadow-sm border-2 p-6 flex flex-col items-center gap-2 text-center overflow-hidden',
            result === 'win' && 'border-primary bg-primary/5',
            result === 'loss' && 'border-red-500 bg-red-500/5',
            result === 'draw' && 'border-muted bg-muted/50'
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {result === 'win' && <ConfettiParticles />}

          {result === 'win' && (
            <>
              <Trophy size={64} className="text-primary" />
              <p className="text-3xl font-bold text-primary">Victory!</p>
              <p className="text-sm text-muted-foreground">
                You outperformed {opponentName} by {formatCHF(margin)}
              </p>
            </>
          )}
          {result === 'loss' && (
            <>
              <Shield size={64} className="text-red-500" />
              <p className="text-3xl font-bold text-red-500">Defeat</p>
              <p className="text-sm text-muted-foreground">
                {opponentName} won by {formatCHF(margin)}
              </p>
            </>
          )}
          {result === 'draw' && (
            <>
              <Swords size={64} className="text-foreground" />
              <p className="text-3xl font-bold text-foreground">Draw!</p>
              <p className="text-sm text-muted-foreground">An evenly matched battle</p>
            </>
          )}
        </motion.div>

        {/* 2. Final portfolios */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="bg-card rounded-2xl shadow-sm border border-border p-4 text-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Your Final</p>
            <p className="text-2xl font-bold text-foreground">{formatCHF(finalPlayerValue)}</p>
            <p className={cn(
              'text-sm font-semibold mt-1',
              playerReturnPct >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {playerReturnPct >= 0 ? '+' : ''}{playerReturnPct.toFixed(1)}%
            </p>
          </motion.div>

          <motion.div
            className="bg-card rounded-2xl shadow-sm border border-border p-4 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-xs text-muted-foreground mb-1">{opponentName}&apos;s Final</p>
            <p className="text-2xl font-bold text-foreground">{formatCHF(finalOpponentValue)}</p>
            <p className={cn(
              'text-sm font-semibold mt-1',
              opponentReturnPct >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {opponentReturnPct >= 0 ? '+' : ''}{opponentReturnPct.toFixed(1)}%
            </p>
          </motion.div>
        </div>

        {/* 3. Round-by-round chart */}
        <motion.div
          className="bg-card rounded-2xl shadow-sm border border-border p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-sm font-semibold text-foreground mb-3">Portfolio Over Time</p>
          {/* Legend */}
          <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-primary rounded" />
              You
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }} />
              {opponentName}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="round"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => (v === 0 ? 'Start' : `R${v}`)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCHF(value),
                  name === 'player' ? 'You' : opponentName,
                ]}
                labelFormatter={(label) => (label === 0 ? 'Start' : `Round ${label}`)}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="player"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="player"
              />
              <Line
                type="monotone"
                dataKey="opponent"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
                name="opponent"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 4. AI Match Analysis */}
        <motion.div
          className="bg-card rounded-2xl shadow-sm border border-border p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Match Analysis
            </span>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-1 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
            </div>
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed">
              {analysisText}
              {!analysisDone && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
              )}
            </p>
          )}
        </motion.div>

        {/* 5. XP & ELO */}
        <motion.div
          className="bg-card rounded-2xl shadow-sm border border-border p-4 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* XP */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">XP Earned</span>
            </div>
            <motion.span
              className="text-lg font-bold text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              +{xpEarned} XP
            </motion.span>
          </div>

          {/* ELO */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">ELO Rating</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{newElo}</span>
              {eloChange !== 0 && (
                <span className={cn(
                  'flex items-center text-sm font-bold',
                  eloChange > 0 ? 'text-emerald-500' : 'text-red-500'
                )}>
                  {eloChange > 0
                    ? <><ArrowUp size={14} />+{eloChange}</>
                    : <><ArrowDown size={14} />{eloChange}</>
                  }
                </span>
              )}
            </div>
          </div>

          {/* Tier promotion */}
          {tierChanged && (
            <motion.div
              className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.35 }}
            >
              <Sparkles size={14} className="text-primary" />
              <span className="text-sm font-semibold text-primary capitalize">
                New tier: {newTier}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* 5. CTAs */}
        <div className="flex gap-3">
          <button
            onClick={() => store.returnToLobby()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <RotateCcw size={16} />
            Back to Lobby
          </button>
          <button
            onClick={() => store.rematch()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Zap size={16} />
            Rematch
          </button>
        </div>

      </div>
    </div>
  );
}
