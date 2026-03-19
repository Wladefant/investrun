'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useArenaStore } from '@/lib/arena-store';
import type { ArenaPhase } from '@/lib/arena-store';
import { ArenaLobby } from './ArenaLobby';
import { ArenaMatchSetup } from './ArenaMatchSetup';
import { ArenaMatch } from './ArenaMatch';
import { ArenaRoundReveal } from './ArenaRoundReveal';
import { ArenaResults } from './ArenaResults';
import { ArenaLeaderboard } from './ArenaLeaderboard';
import { ArenaMultiplayer } from './ArenaMultiplayer';
import { OPPONENTS } from '@/lib/arena-opponents';

interface ArenaScreenProps {
  playerName: string;
  playerXp: number;
  arenaStats: { elo: number; wins: number; losses: number; draws: number };
  onStatsUpdate: (
    stats: { elo: number; wins: number; losses: number; draws: number },
    xpEarned: number
  ) => void;
}

// Placeholder for phases that will be built in Tasks 6-10
function PhasePlaceholder({ phase }: { phase: ArenaPhase }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm font-medium">
        Phase: <span className="text-primary font-bold">{phase}</span>
      </p>
    </div>
  );
}

export function ArenaScreen({
  playerName,
  playerXp,
  arenaStats,
  onStatsUpdate,
}: ArenaScreenProps) {
  const { phase, stats, opponent, currentRound, initStats } = useArenaStore();
  const opponentName = opponent ? OPPONENTS[opponent].name : 'Opponent';
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);

  // Sync parent stats into the store on mount
  useEffect(() => {
    initStats(arenaStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (showLeaderboard) {
    return (
      <ArenaLeaderboard
        onBack={() => setShowLeaderboard(false)}
        playerName={playerName}
        playerStats={stats}
      />
    );
  }

  if (showMultiplayer) {
    return (
      <ArenaMultiplayer
        playerName={playerName}
        onBack={() => setShowMultiplayer(false)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'lobby' && (
          <ArenaLobby
            key="lobby"
            playerName={playerName}
            stats={stats}
            onViewLeaderboard={() => setShowLeaderboard(true)}
            onMultiplayer={() => setShowMultiplayer(true)}
          />
        )}
        {(phase === 'matchmaking' || phase === 'setup') && (
          <ArenaMatchSetup
            key="matchmaking-setup"
            playerName={playerName}
            playerElo={arenaStats.elo}
          />
        )}
        {phase === 'match' && (
          <ArenaMatch
            key="match"
            playerName={playerName}
            opponentName={opponentName}
          />
        )}
        {phase === 'reveal' && (
          <ArenaRoundReveal key={`reveal-${currentRound}`} opponentName={opponentName} />
        )}
        {phase === 'results' && (
          <ArenaResults
            key="results"
            playerName={playerName}
            onStatsUpdate={onStatsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
