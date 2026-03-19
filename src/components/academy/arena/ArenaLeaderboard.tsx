'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MOCK_LEADERBOARD, TIER_COLORS, getEloBadgeTier } from '@/data/arena-leaderboard';
import type { LeaderboardEntry } from '@/data/arena-leaderboard';
import { ScreenHeader } from '@/components/academy/MobileLayout';

interface ArenaLeaderboardProps {
  onBack: () => void;
  playerName: string;
  playerStats: { elo: number; wins: number; losses: number; draws: number };
}

interface RankedEntry extends Omit<LeaderboardEntry, 'rank'> {
  displayRank: number;
  isPlayer: boolean;
}

function rankCircleClass(rank: number): string {
  if (rank === 1) return 'bg-yellow-500 text-white';
  if (rank === 2) return 'bg-gray-400 text-white';
  if (rank === 3) return 'bg-amber-700 text-white';
  return 'bg-muted text-muted-foreground';
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ArenaLeaderboard({ onBack, playerName, playerStats }: ArenaLeaderboardProps) {
  const playerElo = playerStats.elo;

  // Build merged list: mock entries + player, sorted descending by ELO
  const rawEntries = [
    ...MOCK_LEADERBOARD.map((e) => ({
      name: e.name,
      avatar: e.avatar,
      elo: e.elo,
      tier: e.tier,
      wins: e.wins,
      losses: e.losses,
      avgReturn: e.avgReturn,
      isPlayer: false,
    })),
    {
      name: playerName,
      avatar: initials(playerName),
      elo: playerElo,
      tier: getEloBadgeTier(playerElo),
      wins: playerStats.wins,
      losses: playerStats.losses,
      avgReturn: 0, // not tracked for player in mock data
      isPlayer: true,
    },
  ].sort((a, b) => b.elo - a.elo);

  const ranked: RankedEntry[] = rawEntries.map((entry, i) => ({
    ...entry,
    displayRank: i + 1,
  }));

  const playerRankEntry = ranked.find((e) => e.isPlayer)!;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <ScreenHeader title="Leaderboard" onBack={onBack} />

      {/* Player rank highlight */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              rankCircleClass(playerRankEntry.displayRank)
            )}
          >
            {playerRankEntry.displayRank}
          </div>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-foreground">{playerRankEntry.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{playerRankEntry.name}</p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs capitalize font-semibold"
                style={{ color: TIER_COLORS[playerRankEntry.tier] }}
              >
                {playerRankEntry.tier}
              </span>
              <span className="text-xs text-muted-foreground">
                {playerRankEntry.wins}W-{playerRankEntry.losses}L
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-bold text-sm text-foreground">
              {playerRankEntry.avgReturn > 0 ? `+${playerRankEntry.avgReturn}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">{playerRankEntry.elo} ELO</p>
          </div>
        </div>
      </div>

      {/* Full leaderboard list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {ranked.map((entry, i) => (
            <motion.div
              key={entry.isPlayer ? '__player__' : `mock-${entry.displayRank}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5',
                entry.isPlayer && 'bg-primary/5 border border-primary/20'
              )}
            >
              {/* Rank circle */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  rankCircleClass(entry.displayRank)
                )}
              >
                {entry.displayRank}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-foreground">{entry.avatar}</span>
              </div>

              {/* Name + tier + W-L */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs capitalize"
                    style={{ color: TIER_COLORS[entry.tier] }}
                  >
                    {entry.tier}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.wins}W-{entry.losses}L
                  </span>
                </div>
              </div>

              {/* Avg return */}
              <div className="text-right shrink-0">
                <p className="font-mono font-bold text-sm text-foreground">
                  {entry.avgReturn > 0 ? `+${entry.avgReturn}%` : '—'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
