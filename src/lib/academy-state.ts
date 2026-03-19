/** Academy progression state */

export type RankId = "cadet" | "analyst" | "strategist" | "portfolio_manager" | "graduate";

export interface Rank {
  id: RankId;
  label: string;
  icon: string;
  requiredMissions: number;
  xpThreshold: number;
}

export const RANKS: Rank[] = [
  { id: "cadet", label: "Cadet", icon: "🎖️", requiredMissions: 0, xpThreshold: 0 },
  { id: "analyst", label: "Analyst", icon: "📊", requiredMissions: 1, xpThreshold: 100 },
  { id: "strategist", label: "Strategist", icon: "🧠", requiredMissions: 3, xpThreshold: 350 },
  { id: "portfolio_manager", label: "Portfolio Manager", icon: "💼", requiredMissions: 5, xpThreshold: 700 },
  { id: "graduate", label: "Graduate", icon: "🎓", requiredMissions: 7, xpThreshold: 1000 },
];

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  concept: string;
  duration: string;
  rankUnlock: RankId;
  description: string;
  color: string; // tailwind gradient classes
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Know Thyself",
    subtitle: "Risk Profiling",
    icon: "🪞",
    concept: "Your risk tolerance is personal and valid",
    duration: "2-3 min",
    rankUnlock: "analyst",
    description: "Discover your investing personality through real crisis scenarios.",
    color: "from-amber-400 to-yellow-500",
  },
  {
    id: 2,
    title: "Don't Put All Your Eggs",
    subtitle: "Diversification",
    icon: "🥚",
    concept: "Spread your risk across asset classes",
    duration: "3-4 min",
    rankUnlock: "analyst",
    description: "Build a portfolio and watch what happens when markets move.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: 3,
    title: "When Markets Bleed",
    subtitle: "Volatility & Crashes",
    icon: "📉",
    concept: "Crashes are normal. Panic selling is not.",
    duration: "4-5 min",
    rankUnlock: "strategist",
    description: "Survive the COVID crash. Will you hold or fold?",
    color: "from-red-400 to-rose-600",
  },
  {
    id: 4,
    title: "The Long Game",
    subtitle: "Compound Growth",
    icon: "⏳",
    concept: "Time is your greatest investing advantage",
    duration: "3-4 min",
    rankUnlock: "strategist",
    description: "See why starting early beats investing more.",
    color: "from-emerald-400 to-green-600",
  },
  {
    id: 5,
    title: "Asset Classes 101",
    subtitle: "Understanding Assets",
    icon: "🏛️",
    concept: "Each asset class serves a purpose",
    duration: "3-4 min",
    rankUnlock: "portfolio_manager",
    description: "Build a portfolio for a real client brief.",
    color: "from-violet-400 to-purple-600",
  },
  {
    id: 6,
    title: "The Arena",
    subtitle: "Competitive Challenge",
    icon: "⚔️",
    concept: "Compare strategies, learn from others",
    duration: "5-7 min",
    rankUnlock: "portfolio_manager",
    description: "Face the same market as your classmates.",
    color: "from-orange-400 to-amber-600",
  },
  {
    id: 7,
    title: "Graduation",
    subtitle: "Investment DNA Report",
    icon: "🧬",
    concept: "Self-knowledge is the ultimate skill",
    duration: "2-3 min",
    rankUnlock: "graduate",
    description: "Receive your personalized Investment DNA.",
    color: "from-yellow-400 to-amber-500",
  },
];

export type RiskArchetype =
  | "conservative"
  | "balanced_conservative"
  | "balanced"
  | "balanced_growth"
  | "aggressive";

export interface AcademyProgress {
  playerName: string;
  xp: number;
  currentRank: RankId;
  completedMissions: number[];
  missionScores: Record<number, { grade: string; score: number; xpEarned: number }>;
  riskProfile?: RiskArchetype;
  crashBehavior?: "sold" | "held" | "bought_more" | "sold_half";
  diversificationScore?: number;
  longTermScore?: number;
  assetKnowledgeScore?: number;
  arenaStats?: {
    elo: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export const INITIAL_PROGRESS: AcademyProgress = {
  playerName: "Academy Student",
  xp: 0,
  currentRank: "cadet",
  completedMissions: [],
  missionScores: {},
  arenaStats: { elo: 1000, wins: 0, losses: 0, draws: 0 },
};

export function getCurrentRank(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xpThreshold) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(xp: number): Rank | null {
  const current = getCurrentRank(xp);
  const idx = RANKS.findIndex((r) => r.id === current.id);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getXpProgress(xp: number): { current: number; required: number; percentage: number } {
  const currentRank = getCurrentRank(xp);
  const nextRank = getNextRank(xp);
  if (!nextRank) return { current: xp, required: xp, percentage: 100 };

  const rangeStart = currentRank.xpThreshold;
  const rangeEnd = nextRank.xpThreshold;
  const progress = xp - rangeStart;
  const total = rangeEnd - rangeStart;
  return {
    current: progress,
    required: total,
    percentage: Math.min(100, Math.round((progress / total) * 100)),
  };
}

export function isMissionUnlocked(_missionId: number, _completedMissions: number[]): boolean {
  // All missions are unlocked — players can explore in any order
  return true;
}

export function getMissionStatus(
  missionId: number,
  completedMissions: number[]
): "locked" | "available" | "completed" {
  if (completedMissions.includes(missionId)) return "completed";
  return "available";
}
