'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Shield, Brain, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArenaStore, STARTING_CAPITAL, TOTAL_ROUNDS } from '@/lib/arena-store';
import { formatCHF, getRiskLabel } from '@/lib/arena-engine';
import { getArenaRounds, getScenarioById } from '@/data/arena-scenarios';
import { buildRoundContext, fetchArenaAI } from '@/lib/arena-ai';
import { useTypewriter } from '@/hooks/useTypewriter';

interface ArenaRoundRevealProps {
  opponentName: string;
}

export function ArenaRoundReveal({ opponentName }: ArenaRoundRevealProps) {
  const store = useArenaStore();
  const {
    currentRound,
    playerDecisions,
    opponentDecisions,
    playerPortfolio,
    opponentPortfolio,
    scenarioId,
    timeHorizon,
    opponent,
    currentEvent,
    setPhase,
    nextRound,
    setCurrentEvent,
  } = store;

  const [aiText, setAiText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Resolve the event for this round — currentEvent may be null (cleared by nextRound),
  // so fall back to looking it up from the scenario data
  const resolvedEvent = currentEvent ?? (() => {
    if (!scenarioId) return null;
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return null;
    const rounds = getArenaRounds(scenario, TOTAL_ROUNDS);
    return rounds[currentRound - 1] ?? null;
  })();

  // Derive last decision and portfolio values
  const lastPlayerDecision = playerDecisions[playerDecisions.length - 1] ?? 50;
  const lastOpponentDecision = opponentDecisions[opponentDecisions.length - 1] ?? 50;

  const currentPlayerValue = playerPortfolio[playerPortfolio.length - 1] ?? STARTING_CAPITAL;
  const prevPlayerValue = playerPortfolio[playerPortfolio.length - 2] ?? STARTING_CAPITAL;
  const playerChange = currentPlayerValue - prevPlayerValue;

  const currentOpponentValue = opponentPortfolio[opponentPortfolio.length - 1] ?? STARTING_CAPITAL;
  const prevOpponentValue = opponentPortfolio[opponentPortfolio.length - 2] ?? STARTING_CAPITAL;
  const opponentChange = currentOpponentValue - prevOpponentValue;

  const playerWonRound = playerChange > opponentChange;
  const opponentWonRound = opponentChange > playerChange;
  const isTie = playerChange === opponentChange;

  // Fetch AI commentary
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (!opponent || !resolvedEvent) {
      setAiText(null);
      setAiLoading(false);
      return;
    }

    const context = buildRoundContext(
      currentRound,
      TOTAL_ROUNDS,
      timeHorizon,
      resolvedEvent,
      lastPlayerDecision,
      opponent,
      lastOpponentDecision,
      playerPortfolio,
      opponentPortfolio,
    );

    fetchArenaAI('round', context).then((text) => {
      setAiText(text);
      setAiLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { displayed: typewriterText, done: typewriterDone } = useTypewriter(aiText);

  const canAdvance = !aiLoading && typewriterDone;

  const handleAdvance = useCallback(() => {
    if (currentRound >= TOTAL_ROUNDS) {
      setPhase('results');
    } else {
      nextRound();
      const newRound = currentRound + 1;
      const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
      if (scenario) {
        const rounds = getArenaRounds(scenario, TOTAL_ROUNDS);
        const nextEvent = rounds[newRound - 1];
        if (nextEvent) {
          setCurrentEvent(nextEvent);
        }
      }
      setPhase('match');
    }
  }, [currentRound, scenarioId, setPhase, nextRound, setCurrentEvent]);

  function formatChange(change: number): string {
    const abs = Math.round(Math.abs(change)).toLocaleString('de-CH');
    return change >= 0 ? `+CHF ${abs}` : `-CHF ${abs}`;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 space-y-4 pb-8">

        {/* Heading */}
        <h2 className="text-xl font-bold text-foreground text-center">
          Round {currentRound} Results
        </h2>

        {/* Split comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player side */}
          <div className={cn(
            'bg-card rounded-2xl shadow-sm border border-border p-3 text-center',
            playerWonRound && 'ring-2 ring-primary/30 bg-primary/10'
          )}>
            <p className="text-sm text-muted-foreground mb-1">Your Strategy</p>
            <p className="font-bold text-lg text-foreground">
              {getRiskLabel(lastPlayerDecision)}
            </p>
            <motion.span
              className={cn(
                'text-sm font-semibold block mt-1',
                playerChange >= 0 ? 'text-emerald-500' : 'text-red-500'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {formatChange(playerChange)}
            </motion.span>
          </div>

          {/* Opponent side */}
          <div className={cn(
            'bg-card rounded-2xl shadow-sm border border-border p-3 text-center',
            opponentWonRound && 'ring-2 ring-red-500/30 bg-red-500/5'
          )}>
            <p className="text-sm text-muted-foreground mb-1">Opponent&apos;s Strategy</p>
            <p className="font-bold text-lg text-foreground">
              {getRiskLabel(lastOpponentDecision)}
            </p>
            <motion.span
              className={cn(
                'text-sm font-semibold block mt-1',
                opponentChange >= 0 ? 'text-emerald-500' : 'text-red-500'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {formatChange(opponentChange)}
            </motion.span>
          </div>
        </div>

        {/* Round winner banner */}
        <motion.div
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold',
            playerWonRound && 'bg-primary/20 text-primary',
            opponentWonRound && 'bg-red-500/10 text-red-500',
            isTie && 'bg-muted text-foreground'
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          {playerWonRound && <><Sparkles size={16} /> You won this round!</>}
          {opponentWonRound && <><TrendingDown size={16} /> Opponent takes this round</>}
          {isTie && <><Shield size={16} /> It&apos;s a tie!</>}
        </motion.div>

        {/* Running totals */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Total</p>
              <p className="text-xl font-bold text-foreground">
                {formatCHF(currentPlayerValue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Opponent Total</p>
              <p className="text-xl font-bold text-foreground">
                {formatCHF(currentOpponentValue)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Commentary */}
        <motion.div
          className="bg-card rounded-2xl shadow-sm border border-border p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              AI Analysis
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
              {typewriterText}
              {!typewriterDone && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
              )}
            </p>
          )}
        </motion.div>

        {/* Next Round button */}
        <button
          onClick={handleAdvance}
          disabled={!canAdvance}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
            canAdvance
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {currentRound >= TOTAL_ROUNDS ? 'See Results' : 'Next Round'}
          <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
