'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArenaStore } from '@/lib/arena-store';
import { OPPONENTS, getRandomOpponent } from '@/lib/arena-opponents';
import { getRandomScenario, getArenaRounds } from '@/data/arena-scenarios';
import type { ScenarioEvent } from '@/data/arena-scenarios';

export interface ArenaMatchSetupProps {
  playerName: string;
  playerElo: number;
}

const HORIZON_OPTIONS: { years: 20 | 30 | 40; label: string; volatility: string }[] = [
  { years: 20, label: '20 Years', volatility: 'High volatility' },
  { years: 30, label: '30 Years', volatility: 'Medium volatility' },
  { years: 40, label: '40 Years', volatility: 'Low volatility' },
];

// --- Sub-phase: Matchmaking ---
function MatchmakingView() {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => (d.length >= 3 ? '.' : d + '.'));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-background p-8">
      {/* Radar animation */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-primary/30"
            initial={{ width: 40, height: 40, opacity: 0.8 }}
            animate={{ width: ring * 52, height: ring * 52, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: (ring - 1) * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center z-10">
          <Swords size={26} className="text-primary" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-bold text-foreground">
          Finding opponent{dots}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Searching for a worthy challenger</p>
      </div>
    </div>
  );
}

// --- Sub-phase: Setup (VS screen + horizon picker) ---
interface SetupViewProps {
  playerName: string;
  playerElo: number;
  onStart: (rounds: ScenarioEvent[]) => void;
}

function SetupView({ playerName, playerElo, onStart }: SetupViewProps) {
  const { opponent, setTimeHorizon, setScenario, returnToLobby } = useArenaStore();
  const [selectedHorizon, setSelectedHorizon] = useState<20 | 30 | 40 | null>(null);

  const opponentData = opponent ? OPPONENTS[opponent] : null;
  const playerInitials = playerName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function handleBattleStart() {
    if (!selectedHorizon) return;
    setTimeHorizon(selectedHorizon);
    const scenario = getRandomScenario(selectedHorizon);
    setScenario(scenario.id);
    const rounds = getArenaRounds(scenario, 8);
    onStart(rounds);
  }

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto bg-background"
    >
      <div className="p-4 space-y-4 pb-6">

        {/* VS Screen */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
          <div className="flex items-center justify-between gap-2">
            {/* Player */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">{playerInitials}</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate max-w-full text-center">
                {playerName}
              </p>
              <p className="text-xs text-muted-foreground">{playerElo} ELO</p>
            </div>

            {/* VS center */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <Swords size={24} className="text-primary" />
              <span className="text-xs font-bold text-muted-foreground">VS</span>
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-full bg-chart-4/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">{opponentData?.emoji ?? '?'}</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate max-w-full text-center">
                {opponentData?.name ?? 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">{opponentData?.elo ?? '--'} ELO</p>
            </div>
          </div>

          {opponentData && (
            <p className="text-center text-xs text-muted-foreground mt-3 italic">
              "{opponentData.description}"
            </p>
          )}
        </div>

        {/* Time Horizon Picker */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <p className="text-sm font-bold text-foreground mb-3">Investment Horizon</p>
          <div className="grid grid-cols-3 gap-3">
            {HORIZON_OPTIONS.map(({ years, label, volatility }) => (
              <button
                key={years}
                onClick={() => setSelectedHorizon(years)}
                className={cn(
                  'bg-card border rounded-xl p-4 text-center transition-colors',
                  selectedHorizon === years
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <p className={cn(
                  'text-sm font-bold',
                  selectedHorizon === years ? 'text-primary' : 'text-foreground'
                )}>
                  {label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{volatility}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <AnimatePresence>
          {selectedHorizon && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={handleBattleStart}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Swords size={20} />
                Battle Start
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={returnToLobby}
          className="w-full py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          Cancel
        </button>

      </div>
    </motion.div>
  );
}

// --- Sub-phase: Countdown ---
interface CountdownViewProps {
  onComplete: () => void;
}

function CountdownView({ onComplete }: CountdownViewProps) {
  const [value, setValue] = useState<number | 'GO!'>(3);
  const completedRef = useRef(false);

  useEffect(() => {
    if (value === 'GO!') {
      if (!completedRef.current) {
        completedRef.current = true;
        const t = setTimeout(onComplete, 500);
        return () => clearTimeout(t);
      }
      return;
    }

    const t = setTimeout(() => {
      setValue(v => {
        if (v === 1) return 'GO!';
        return (v as number) - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [value, onComplete]);

  const isGo = value === 'GO!';

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={String(value)}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={cn(
            'text-[96px] font-black leading-none',
            isGo ? 'text-primary' : 'text-foreground'
          )}
        >
          {String(value)}
        </motion.div>
      </AnimatePresence>

      <motion.p
        key={isGo ? 'go-text' : 'ready-text'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-muted-foreground"
      >
        {isGo ? 'Round 1 starting...' : 'Get ready...'}
      </motion.p>
    </div>
  );
}

// --- Main component ---
export function ArenaMatchSetup({ playerName, playerElo }: ArenaMatchSetupProps) {
  const { phase, setOpponent, setPhase, startMatch, setCurrentEvent } = useArenaStore();
  const [isCountdown, setIsCountdown] = useState(false);
  const roundsRef = useRef<ScenarioEvent[]>([]);

  // Matchmaking: auto-select opponent after 2.5s
  useEffect(() => {
    if (phase !== 'matchmaking') return;
    const t = setTimeout(() => {
      const personality = getRandomOpponent();
      setOpponent(personality);
      setPhase('setup');
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, setOpponent, setPhase]);

  function handleBattleStart(rounds: ScenarioEvent[]) {
    roundsRef.current = rounds;
    setIsCountdown(true);
  }

  function handleCountdownComplete() {
    startMatch();
    if (roundsRef.current.length > 0) {
      setCurrentEvent(roundsRef.current[0]);
    }
  }

  if (isCountdown) {
    return <CountdownView onComplete={handleCountdownComplete} />;
  }

  if (phase === 'matchmaking') {
    return <MatchmakingView />;
  }

  // phase === 'setup'
  return (
    <SetupView
      playerName={playerName}
      playerElo={playerElo}
      onStart={handleBattleStart}
    />
  );
}
