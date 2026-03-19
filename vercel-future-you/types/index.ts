// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  monthlyContribution: number;
  riskProfile: RiskProfile;
  currentStreak: number;
  xp: number;
  rank: number;
  tier: TierBadge;
  achievements: Achievement[];
  createdAt: Date;
}

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

export type TierBadge = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Goal Types
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  icon: string;
  category: GoalCategory;
}

export type GoalCategory = 'lifestyle' | 'vehicle' | 'property' | 'travel' | 'freedom';

export const PRESET_GOALS: Goal[] = [
  { id: 'iphone', name: 'New iPhone', targetAmount: 1500, icon: '📱', category: 'lifestyle' },
  { id: 'apartment', name: 'Apartment Down Payment', targetAmount: 50000, icon: '🏠', category: 'property' },
  { id: 'dreamcar', name: 'Dream Car', targetAmount: 35000, icon: '🚗', category: 'vehicle' },
  { id: 'lambo', name: 'Lamborghini', targetAmount: 300000, icon: '🏎️', category: 'vehicle' },
  { id: 'travel', name: 'Travel Fund', targetAmount: 10000, icon: '✈️', category: 'travel' },
  { id: 'freedom', name: 'Financial Freedom Starter', targetAmount: 100000, icon: '🎯', category: 'freedom' },
];

// Future Projection Types
export interface FutureProjection {
  yearsToGoal: number;
  monthlyMilestones: Milestone[];
  yearlyBalances: YearlyBalance[];
  scenarios: Scenario[];
  costOfWaiting: CostOfWaiting;
}

export interface Milestone {
  year: number;
  balance: number;
  percentComplete: number;
}

export interface YearlyBalance {
  year: number;
  balance: number;
  contributions: number;
  growth: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  yearsToGoal: number;
  finalBalance: number;
  changes: ScenarioChange[];
}

export interface ScenarioChange {
  afterYears: number;
  newContribution: number;
}

export interface CostOfWaiting {
  delayYears: number;
  lostValue: number;
  newYearsToGoal: number;
}

// Optimization suggestion for the Future screen
export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  newYearsToGoal: number;
  changeType: 'contribution' | 'return' | 'delay' | 'target';
  recommendation: string;
}

// Simulation Types
export interface SimulationState {
  id: string;
  currentYear: number;
  startYear: number;
  endYear: number;
  portfolio: Portfolio;
  events: SimulationEvent[];
  decisions: Decision[];
  isRunning: boolean;
  speed: SimulationSpeed;
}

export type SimulationSpeed = 'slow' | 'normal' | 'fast';

export interface Portfolio {
  totalValue: number;
  monthlyContribution: number;
  allocations: Allocation[];
  history: PortfolioSnapshot[];
}

export interface Allocation {
  assetClass: AssetClass;
  percentage: number;
  value: number;
}

export type AssetClass = 
  | 'global-equity'
  | 'swiss-equity'
  | 'bonds'
  | 'gold'
  | 'cash'
  | 'bitcoin'
  | 'tech-growth';

export const ASSET_CLASSES: Record<AssetClass, { name: string; color: string; risk: number }> = {
  'global-equity': { name: 'Global Equity Index', color: '#10b981', risk: 3 },
  'swiss-equity': { name: 'Swiss Equity Index', color: '#3b82f6', risk: 3 },
  'bonds': { name: 'Bonds', color: '#8b5cf6', risk: 1 },
  'gold': { name: 'Gold', color: '#f59e0b', risk: 2 },
  'cash': { name: 'Cash', color: '#6b7280', risk: 0 },
  'bitcoin': { name: 'Bitcoin', color: '#f97316', risk: 5 },
  'tech-growth': { name: 'Tech Growth Basket', color: '#ec4899', risk: 4 },
};

export interface PortfolioSnapshot {
  year: number;
  quarter: number;
  totalValue: number;
  allocations: Allocation[];
}

export interface SimulationEvent {
  id: string;
  year: number;
  quarter: number;
  type: EventType;
  title: string;
  description: string;
  impact: Record<AssetClass, number>;
}

export type EventType = 'bull' | 'crash' | 'recovery' | 'inflation' | 'sideways' | 'news';

export interface Decision {
  year: number;
  quarter: number;
  type: DecisionType;
  description: string;
  wasGood: boolean | null;
}

export type DecisionType = 'rebalance' | 'increase-contribution' | 'sell' | 'buy-dip' | 'hold';

// Simulation Report
export interface SimulationReport {
  finalValue: number;
  initialValue: number;
  totalContributions: number;
  annualizedReturn: number;
  maxDrawdown: number;
  diversificationScore: number;
  decisions: Decision[];
  mistakes: string[];
  goodDecisions: string[];
  coachingInsights: string[];
}

// Arena Types
export interface ArenaMatch {
  id: string;
  status: MatchStatus;
  player: ArenaPlayer;
  opponent: ArenaPlayer;
  scenario: SimulationState;
  startTime: Date;
  endTime?: Date;
  winner?: 'player' | 'opponent' | 'draw';
}

export type MatchStatus = 'waiting' | 'in-progress' | 'completed';

export interface ArenaPlayer {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  tier: TierBadge;
  portfolio: Portfolio;
  currentReturn: number;
  riskScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  player: ArenaPlayer;
  wins: number;
  losses: number;
  winRate: number;
  avgReturn: number;
}

// Arena Match State for turn-based gameplay
export interface ArenaMatchState {
  id: string;
  scenarioId: string;
  currentRound: number;
  totalRounds: number;
  timeHorizon: number;
  playerPortfolio: Portfolio;
  opponentPortfolio: Portfolio;
  opponentPersonality: 'cautious' | 'balanced' | 'greedy' | 'opportunistic';
  currentEvent: SimulationEvent | null;
  playerDecision: string | null;
  opponentDecision: string | null;
  decisionTimer: number;
  roundHistory: ArenaRound[];
  phase: 'countdown' | 'decision' | 'reveal' | 'complete';
}

export interface ArenaRound {
  round: number;
  event: SimulationEvent;
  playerDecision: string;
  opponentDecision: string;
  playerValueChange: number;
  opponentValueChange: number;
  playerTotalValue: number;
  opponentTotalValue: number;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: AchievementCategory;
}

export type AchievementCategory = 'beginner' | 'strategy' | 'resilience' | 'social';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-portfolio', name: 'First Portfolio', description: 'Created your first investment portfolio', icon: '🎯', category: 'beginner' },
  { id: 'held-through-crash', name: 'Held Through a Crash', description: 'Maintained position during a market crash', icon: '💪', category: 'resilience' },
  { id: 'diversification-starter', name: 'Diversification Starter', description: 'Allocated to 4+ asset classes', icon: '🎨', category: 'strategy' },
  { id: 'long-term-thinker', name: 'Long-Term Thinker', description: 'Completed a 30+ year simulation', icon: '🔮', category: 'strategy' },
  { id: 'risk-manager', name: 'Risk Manager', description: 'Maintained a balanced risk profile', icon: '⚖️', category: 'strategy' },
  { id: 'future-planner', name: 'Future Planner', description: 'Set and achieved a financial goal', icon: '📈', category: 'beginner' },
  { id: 'arena-challenger', name: 'Arena Challenger', description: 'Competed in your first arena match', icon: '⚔️', category: 'social' },
  { id: 'winning-streak', name: 'Winning Streak', description: 'Won 5 arena matches in a row', icon: '🔥', category: 'social' },
];

// AI Coach Types
export interface CoachMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  category?: CoachCategory;
}

export type CoachCategory = 
  | 'projection'
  | 'scenario'
  | 'regret'
  | 'future-self'
  | 'analysis'
  | 'mistake'
  | 'news'
  | 'competitive'
  | 'learning'
  | 'risk';

// Navigation Types
export type TabId = 'home' | 'future' | 'solo' | 'arena' | 'coach';

// Onboarding Types
export interface OnboardingState {
  currentStep: number;
  age: number | null;
  monthlyContribution: number | null;
  selectedGoal: Goal | null;
  riskPreference: RiskProfile | null;
  isComplete: boolean;
}
