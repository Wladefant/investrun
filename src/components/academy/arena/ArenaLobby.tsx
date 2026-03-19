'use client';

import { motion } from 'framer-motion';
import { Swords, Zap, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArenaStore } from '@/lib/arena-store';
import { MOCK_LEADERBOARD, TIER_COLORS, getEloBadgeTier } from '@/data/arena-leaderboard';

interface ArenaLobbyProps {
  playerName: string;
  stats: { elo: number; wins: number; losses: number; draws: number };
  onViewLeaderboard: () => void;
  onMultiplayer?: () => void;
}

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
};

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Same Events, Different Choices',
    desc: 'Both players face identical market scenarios',
  },
  {
    step: 2,
    title: '15 Seconds to Decide',
    desc: 'Adjust your risk slider before time runs out',
  },
  {
    step: 3,
    title: 'See the Results',
    desc: 'Compare strategies and learn from each round',
  },
];

export function ArenaLobby({ playerName, stats, onViewLeaderboard, onMultiplayer }: ArenaLobbyProps) {
  const { startMatchmaking } = useArenaStore();
  const tier = getEloBadgeTier(stats.elo);
  const tierColor = TIER_COLORS[tier];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 space-y-4 pb-6">

        {/* Header card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Swords size={28} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">Investment Arena</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Turn-based strategy battles under real market conditions
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-muted rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-foreground">{stats.elo}</div>
              <div className="text-[10px] text-muted-foreground">ELO</div>
            </div>
            <div className="bg-muted rounded-xl p-2.5 text-center">
              <div className="text-sm font-bold text-foreground leading-tight">
                <span className="text-emerald-500">{stats.wins}</span>
                {' / '}
                <span className="text-red-500">{stats.losses}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">Wins / Losses</div>
            </div>
            <div className="bg-muted rounded-xl p-2.5 text-center">
              <div
                className="text-base font-bold capitalize"
                style={{ color: tierColor }}
              >
                {tier}
              </div>
              <div className="text-[10px] text-muted-foreground">Tier</div>
            </div>
          </div>
        </div>

        {/* Find Match button */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <motion.button
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={startMatchmaking}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Zap size={20} />
            Start Battle
          </motion.button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            8 rounds | Same market events | Make strategic decisions
          </p>

          {onMultiplayer && (
            <button
              onClick={onMultiplayer}
              className="w-full mt-3 h-12 rounded-xl border-2 border-primary text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-[0.98]"
            >
              <Users size={18} />
              Play vs Friend
            </button>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">How It Works</h3>
          <div className="space-y-3">
            {HOW_IT_WORKS_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Leaderboard */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">Leaderboard</h3>
            </div>
          </div>

          <div className="space-y-2">
            {MOCK_LEADERBOARD.slice(0, 5).map((entry, i) => {
              const entryTierColor = TIER_COLORS[entry.tier];
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span
                    className={cn(
                      'w-5 text-center text-xs font-bold shrink-0',
                      RANK_COLORS[entry.rank] ?? 'text-muted-foreground'
                    )}
                  >
                    {entry.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{entry.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{entry.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {entry.wins}W-{entry.losses}L
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold capitalize" style={{ color: entryTierColor }}>
                      {entry.tier}
                    </p>
                    <p className="text-[10px] text-muted-foreground">+{entry.avgReturn}%</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button
            onClick={() => {
              console.log('View All leaderboard — Task 10 will wire this');
              onViewLeaderboard();
            }}
            className="w-full mt-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            View All
          </button>
        </div>

      </div>
    </div>
  );
}
