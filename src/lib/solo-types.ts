export type AssetClass =
  | 'global-equity'
  | 'swiss-equity'
  | 'bonds'
  | 'gold'
  | 'cash'
  | 'bitcoin'
  | 'tech-growth';

export const ASSET_CLASSES: Record<AssetClass, { name: string; color: string; risk: number }> = {
  'global-equity': { name: 'Global Equity', color: '#10b981', risk: 3 },
  'swiss-equity': { name: 'Swiss Equity', color: '#3b82f6', risk: 3 },
  'bonds': { name: 'Bonds', color: '#8b5cf6', risk: 1 },
  'gold': { name: 'Gold', color: '#f59e0b', risk: 2 },
  'cash': { name: 'Cash', color: '#6b7280', risk: 0 },
  'bitcoin': { name: 'Bitcoin', color: '#f97316', risk: 5 },
  'tech-growth': { name: 'Tech Growth', color: '#ec4899', risk: 4 },
};

export interface Allocation {
  assetClass: AssetClass;
  percentage: number;
  value: number;
}

export interface Portfolio {
  totalValue: number;
  monthlyContribution: number;
  allocations: Allocation[];
  history: PortfolioSnapshot[];
}

export interface PortfolioSnapshot {
  year: number;
  quarter: number;
  totalValue: number;
  allocations: Allocation[];
}

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
