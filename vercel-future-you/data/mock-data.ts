import type { 
  UserProfile, 
  Achievement, 
  LeaderboardEntry, 
  ArenaMatch,
  ArenaPlayer,
  Goal,
  PRESET_GOALS
} from '@/types';
import { ACHIEVEMENTS } from '@/types';

// Default user for demo
export const DEFAULT_USER: UserProfile = {
  id: 'user-1',
  name: 'Alex',
  age: 22,
  monthlyContribution: 300,
  riskProfile: 'balanced',
  currentStreak: 7,
  xp: 2450,
  rank: 156,
  tier: 'silver',
  achievements: [
    { ...ACHIEVEMENTS[0], unlockedAt: new Date('2024-01-15') },
    { ...ACHIEVEMENTS[2], unlockedAt: new Date('2024-02-20') },
    { ...ACHIEVEMENTS[5], unlockedAt: new Date('2024-03-01') },
  ],
  createdAt: new Date('2024-01-01'),
};

// Leaderboard data
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    player: {
      id: 'p1',
      name: 'SophiaW',
      avatar: '👩‍💼',
      rank: 1,
      tier: 'diamond',
      portfolio: { totalValue: 0, monthlyContribution: 0, allocations: [], history: [] },
      currentReturn: 34.2,
      riskScore: 65,
    },
    wins: 89,
    losses: 12,
    winRate: 88.1,
    avgReturn: 28.5,
  },
  {
    rank: 2,
    player: {
      id: 'p2',
      name: 'MaxInvest',
      avatar: '🧑‍💻',
      rank: 2,
      tier: 'diamond',
      portfolio: { totalValue: 0, monthlyContribution: 0, allocations: [], history: [] },
      currentReturn: 31.8,
      riskScore: 72,
    },
    wins: 76,
    losses: 15,
    winRate: 83.5,
    avgReturn: 26.3,
  },
  {
    rank: 3,
    player: {
      id: 'p3',
      name: 'FutureBuilder',
      avatar: '🚀',
      rank: 3,
      tier: 'platinum',
      portfolio: { totalValue: 0, monthlyContribution: 0, allocations: [], history: [] },
      currentReturn: 29.4,
      riskScore: 58,
    },
    wins: 65,
    losses: 18,
    winRate: 78.3,
    avgReturn: 24.1,
  },
  {
    rank: 4,
    player: {
      id: 'p4',
      name: 'SteadyGains',
      avatar: '🎯',
      rank: 4,
      tier: 'platinum',
      portfolio: { totalValue: 0, monthlyContribution: 0, allocations: [], history: [] },
      currentReturn: 27.1,
      riskScore: 45,
    },
    wins: 58,
    losses: 22,
    winRate: 72.5,
    avgReturn: 22.8,
  },
  {
    rank: 5,
    player: {
      id: 'p5',
      name: 'WealthPath',
      avatar: '💎',
      rank: 5,
      tier: 'gold',
      portfolio: { totalValue: 0, monthlyContribution: 0, allocations: [], history: [] },
      currentReturn: 25.6,
      riskScore: 52,
    },
    wins: 52,
    losses: 24,
    winRate: 68.4,
    avgReturn: 21.2,
  },
];

// Mock opponent for arena
export const MOCK_OPPONENT: ArenaPlayer = {
  id: 'opp-1',
  name: 'TradeMaster',
  avatar: '🎮',
  rank: 142,
  tier: 'silver',
  portfolio: {
    totalValue: 10000,
    monthlyContribution: 350,
    allocations: [
      { assetClass: 'global-equity', percentage: 50, value: 5000 },
      { assetClass: 'tech-growth', percentage: 25, value: 2500 },
      { assetClass: 'bonds', percentage: 15, value: 1500 },
      { assetClass: 'cash', percentage: 10, value: 1000 },
    ],
    history: [],
  },
  currentReturn: 0,
  riskScore: 68,
};

// Opponent action messages
export const OPPONENT_ACTIONS = [
  { action: 'Moved 15% into gold', timing: 'early' },
  { action: 'Increased equity exposure', timing: 'crash' },
  { action: 'Rebalanced portfolio', timing: 'recovery' },
  { action: 'Sold some tech stocks', timing: 'bull' },
  { action: 'Bought the dip aggressively', timing: 'crash' },
  { action: 'Shifted to defensive positions', timing: 'late' },
];

// Recent activity for home screen
export const RECENT_ACTIVITY = [
  { type: 'simulation', text: 'Completed 30-year simulation', time: '2h ago', icon: '🎮' },
  { type: 'achievement', text: 'Unlocked "Diversification Starter"', time: '1d ago', icon: '🏆' },
  { type: 'arena', text: 'Won against TradeMaster (+8.3%)', time: '2d ago', icon: '⚔️' },
  { type: 'streak', text: '7-day learning streak!', time: '3d ago', icon: '🔥' },
  { type: 'goal', text: 'Updated goal to "Dream Car"', time: '5d ago', icon: '🎯' },
];

// XP level thresholds
export const XP_LEVELS = [
  { level: 1, minXP: 0, title: 'Beginner Investor' },
  { level: 2, minXP: 500, title: 'Learning Trader' },
  { level: 3, minXP: 1500, title: 'Market Explorer' },
  { level: 4, minXP: 3000, title: 'Portfolio Builder' },
  { level: 5, minXP: 5000, title: 'Wealth Strategist' },
  { level: 6, minXP: 8000, title: 'Investment Pro' },
  { level: 7, minXP: 12000, title: 'Market Master' },
  { level: 8, minXP: 18000, title: 'Financial Guru' },
  { level: 9, minXP: 25000, title: 'Legend' },
  { level: 10, minXP: 35000, title: 'Investment Sage' },
];

export function getLevel(xp: number): { level: number; title: string; progress: number; nextLevelXP: number } {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];
  
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXP) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || XP_LEVELS[i];
      break;
    }
  }
  
  const progressXP = xp - currentLevel.minXP;
  const levelRange = nextLevel.minXP - currentLevel.minXP;
  const progress = levelRange > 0 ? (progressXP / levelRange) * 100 : 100;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progress: Math.min(progress, 100),
    nextLevelXP: nextLevel.minXP,
  };
}

// Tier badge colors
export const TIER_COLORS = {
  bronze: { bg: 'bg-amber-900/20', text: 'text-amber-600', border: 'border-amber-600' },
  silver: { bg: 'bg-slate-400/20', text: 'text-slate-400', border: 'border-slate-400' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500' },
  platinum: { bg: 'bg-cyan-400/20', text: 'text-cyan-400', border: 'border-cyan-400' },
  diamond: { bg: 'bg-purple-400/20', text: 'text-purple-400', border: 'border-purple-400' },
};

// Coach suggestion chips
export const COACH_SUGGESTIONS = [
  'Why did I lose money here?',
  'Was selling there a mistake?',
  'How could I reach my goal faster?',
  'What does diversification mean?',
  'What kind of investor am I?',
  'Explain compound interest',
];
