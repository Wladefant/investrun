export type AssetClass =
  | 'tech-stocks'
  | 'blue-chip'
  | 'emerging-markets'
  | 'bonds'
  | 'gold'
  | 'cash';

export const ASSET_CLASSES: Record<AssetClass, { name: string; color: string; risk: number }> = {
  'tech-stocks': { name: 'Tech Stocks', color: '#ec4899', risk: 4 },
  'blue-chip': { name: 'Blue Chip Stocks', color: '#10b981', risk: 2 },
  'emerging-markets': { name: 'Emerging Markets', color: '#f97316', risk: 4 },
  'bonds': { name: 'Bonds', color: '#8b5cf6', risk: 1 },
  'gold': { name: 'Gold', color: '#f59e0b', risk: 2 },
  'cash': { name: 'Cash', color: '#6b7280', risk: 0 },
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

export interface EventOption {
  label: string;
  description: string;
  effect: Partial<Record<AssetClass, number>> | null;
  sentiment: 'good' | 'bad' | 'neutral';
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
  options: EventOption[];
}

export type EventType = 'bull' | 'crash' | 'recovery' | 'inflation' | 'sideways' | 'news';

export interface Decision {
  year: number;
  quarter: number;
  type: string;
  description: string;
  wasGood: boolean | null;
}

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
