import type { AssetClass } from '@/lib/solo-types';

export interface MarketScenario {
  id: string;
  title: string;
  description: string;
  minYears: number;
  maxYears: number;
  volatilityPattern: 'low' | 'medium' | 'high' | 'extreme';
  recoveryBehavior: 'fast' | 'gradual' | 'slow' | 'prolonged';
  events: ScenarioEvent[];
  assetPerformance: Record<AssetClass, AssetPerformanceProfile>;
}

export interface ScenarioEvent {
  yearOffset: number;
  quarterOffset: number;
  type: 'bull' | 'crash' | 'recovery' | 'inflation' | 'sideways' | 'crisis' | 'boom';
  title: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  assetImpacts: Partial<Record<AssetClass, number>>;
}

export interface AssetPerformanceProfile {
  baseReturn: number;
  volatility: number;
  crashSensitivity: number;
  inflationSensitivity: number;
}

export const MARKET_SCENARIOS: MarketScenario[] = [
  {
    id: 'tech-boom-crash',
    title: 'Tech Boom & Bust',
    description: 'Rapid tech growth followed by a sharp correction.',
    minYears: 10, maxYears: 25,
    volatilityPattern: 'extreme', recoveryBehavior: 'slow',
    events: [
      { yearOffset: 0, quarterOffset: 1, type: 'bull', title: 'Tech Innovation Wave', description: 'New technologies drive unprecedented market optimism', severity: 3, assetImpacts: { 'tech-stocks': 0.35, 'blue-chip': 0.15, 'emerging-markets': 0.20 } },
      { yearOffset: 2, quarterOffset: 0, type: 'boom', title: 'IPO Frenzy', description: 'Tech companies go public at record valuations', severity: 4, assetImpacts: { 'tech-stocks': 0.50, 'blue-chip': 0.20, 'bonds': -0.05 } },
      { yearOffset: 4, quarterOffset: 2, type: 'crash', title: 'Tech Bubble Bursts', description: 'Overvalued tech stocks collapse', severity: 5, assetImpacts: { 'tech-stocks': -0.55, 'blue-chip': -0.25, 'emerging-markets': -0.40, 'bonds': 0.08, 'gold': 0.12 } },
      { yearOffset: 6, quarterOffset: 0, type: 'sideways', title: 'Market Digestion', description: 'Markets consolidate as investors reassess', severity: 2, assetImpacts: { 'tech-stocks': 0.02, 'blue-chip': 0.03 } },
      { yearOffset: 8, quarterOffset: 2, type: 'recovery', title: 'Tech Rebirth', description: 'Surviving companies emerge stronger', severity: 3, assetImpacts: { 'tech-stocks': 0.25, 'blue-chip': 0.15 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.12, volatility: 0.35, crashSensitivity: 1.0, inflationSensitivity: -0.2 },
      'blue-chip': { baseReturn: 0.08, volatility: 0.18, crashSensitivity: 0.7, inflationSensitivity: -0.2 },
      'emerging-markets': { baseReturn: 0.10, volatility: 0.28, crashSensitivity: 0.9, inflationSensitivity: -0.1 },
      'bonds': { baseReturn: 0.03, volatility: 0.06, crashSensitivity: -0.3, inflationSensitivity: -0.5 },
      'gold': { baseReturn: 0.04, volatility: 0.15, crashSensitivity: -0.4, inflationSensitivity: 0.6 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.8 },
    },
  },
  {
    id: 'inflation-decade',
    title: 'The Inflation Decade',
    description: 'Prolonged high inflation eroding purchasing power.',
    minYears: 10, maxYears: 30,
    volatilityPattern: 'medium', recoveryBehavior: 'gradual',
    events: [
      { yearOffset: 1, quarterOffset: 0, type: 'inflation', title: 'Inflation Heats Up', description: 'CPI rises above 5%', severity: 3, assetImpacts: { 'gold': 0.20, 'bonds': -0.12, 'cash': -0.05, 'blue-chip': 0.02 } },
      { yearOffset: 3, quarterOffset: 1, type: 'crisis', title: 'Wage-Price Spiral', description: 'Inflation becomes entrenched', severity: 4, assetImpacts: { 'gold': 0.25, 'bonds': -0.15, 'blue-chip': -0.08, 'emerging-markets': 0.05 } },
      { yearOffset: 5, quarterOffset: 2, type: 'sideways', title: 'Central Bank Pivot', description: 'Aggressive rate hikes slow growth', severity: 3, assetImpacts: { 'bonds': -0.08, 'blue-chip': -0.10, 'gold': 0.05 } },
      { yearOffset: 7, quarterOffset: 0, type: 'recovery', title: 'Inflation Peaks', description: 'Price pressures begin to ease', severity: 2, assetImpacts: { 'blue-chip': 0.12, 'bonds': 0.05, 'gold': -0.05 } },
      { yearOffset: 9, quarterOffset: 2, type: 'bull', title: 'New Equilibrium', description: 'Markets adapt to higher rate environment', severity: 2, assetImpacts: { 'blue-chip': 0.15, 'emerging-markets': 0.12 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.06, volatility: 0.30, crashSensitivity: 0.9, inflationSensitivity: -0.3 },
      'blue-chip': { baseReturn: 0.05, volatility: 0.16, crashSensitivity: 0.5, inflationSensitivity: -0.3 },
      'emerging-markets': { baseReturn: 0.07, volatility: 0.22, crashSensitivity: 0.7, inflationSensitivity: 0.1 },
      'bonds': { baseReturn: 0.01, volatility: 0.10, crashSensitivity: -0.2, inflationSensitivity: -0.7 },
      'gold': { baseReturn: 0.08, volatility: 0.18, crashSensitivity: -0.5, inflationSensitivity: 0.8 },
      'cash': { baseReturn: 0.02, volatility: 0.02, crashSensitivity: 0, inflationSensitivity: -0.9 },
    },
  },
  {
    id: 'global-steady-growth',
    title: 'Golden Age of Growth',
    description: 'Sustained global expansion with low volatility.',
    minYears: 15, maxYears: 50,
    volatilityPattern: 'low', recoveryBehavior: 'fast',
    events: [
      { yearOffset: 2, quarterOffset: 1, type: 'bull', title: 'Synchronized Growth', description: 'All major economies expand together', severity: 3, assetImpacts: { 'blue-chip': 0.18, 'emerging-markets': 0.20, 'tech-stocks': 0.22 } },
      { yearOffset: 5, quarterOffset: 0, type: 'sideways', title: 'Healthy Pause', description: 'Markets consolidate gains', severity: 1, assetImpacts: { 'blue-chip': 0.04, 'bonds': 0.03 } },
      { yearOffset: 8, quarterOffset: 2, type: 'bull', title: 'Productivity Boom', description: 'Technology drives efficiency gains', severity: 3, assetImpacts: { 'blue-chip': 0.20, 'tech-stocks': 0.28, 'bonds': 0.02 } },
      { yearOffset: 12, quarterOffset: 1, type: 'sideways', title: 'Minor Correction', description: 'Brief pullback in equity markets', severity: 2, assetImpacts: { 'blue-chip': -0.08, 'gold': 0.05 } },
      { yearOffset: 15, quarterOffset: 0, type: 'bull', title: 'New Highs', description: 'Markets reach record levels on strong fundamentals', severity: 2, assetImpacts: { 'blue-chip': 0.15, 'emerging-markets': 0.12 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.14, volatility: 0.22, crashSensitivity: 0.7, inflationSensitivity: -0.1 },
      'blue-chip': { baseReturn: 0.10, volatility: 0.10, crashSensitivity: 0.4, inflationSensitivity: -0.2 },
      'emerging-markets': { baseReturn: 0.11, volatility: 0.18, crashSensitivity: 0.6, inflationSensitivity: -0.1 },
      'bonds': { baseReturn: 0.04, volatility: 0.05, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.03, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
    },
  },
  {
    id: 'multi-dip-recovery',
    title: 'The Rollercoaster Recovery',
    description: 'Multiple false starts before sustained recovery.',
    minYears: 12, maxYears: 30,
    volatilityPattern: 'high', recoveryBehavior: 'prolonged',
    events: [
      { yearOffset: 0, quarterOffset: 2, type: 'crash', title: 'Initial Shock', description: 'Major market correction', severity: 4, assetImpacts: { 'blue-chip': -0.28, 'tech-stocks': -0.35, 'emerging-markets': -0.40, 'gold': 0.15, 'bonds': 0.06 } },
      { yearOffset: 1, quarterOffset: 1, type: 'recovery', title: 'False Dawn', description: 'Markets bounce on shaky ground', severity: 2, assetImpacts: { 'blue-chip': 0.18, 'tech-stocks': 0.22 } },
      { yearOffset: 2, quarterOffset: 3, type: 'crash', title: 'Second Dip', description: 'Recovery falters, markets sell off', severity: 3, assetImpacts: { 'blue-chip': -0.20, 'tech-stocks': -0.25, 'gold': 0.10 } },
      { yearOffset: 4, quarterOffset: 0, type: 'recovery', title: 'Tentative Recovery', description: 'Cautious optimism returns', severity: 2, assetImpacts: { 'blue-chip': 0.15, 'bonds': 0.04 } },
      { yearOffset: 7, quarterOffset: 0, type: 'bull', title: 'Sustained Recovery', description: 'A durable uptrend emerges', severity: 3, assetImpacts: { 'blue-chip': 0.22, 'tech-stocks': 0.28 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.10, volatility: 0.35, crashSensitivity: 1.0, inflationSensitivity: -0.2 },
      'blue-chip': { baseReturn: 0.07, volatility: 0.22, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
      'emerging-markets': { baseReturn: 0.08, volatility: 0.30, crashSensitivity: 0.9, inflationSensitivity: -0.1 },
      'bonds': { baseReturn: 0.03, volatility: 0.07, crashSensitivity: -0.3, inflationSensitivity: -0.5 },
      'gold': { baseReturn: 0.05, volatility: 0.16, crashSensitivity: -0.5, inflationSensitivity: 0.6 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.7 },
    },
  },
  {
    id: 'equity-supercycle',
    title: 'The Great Bull Run',
    description: 'Extended equity dominance with minor corrections.',
    minYears: 15, maxYears: 50,
    volatilityPattern: 'low', recoveryBehavior: 'fast',
    events: [
      { yearOffset: 1, quarterOffset: 2, type: 'bull', title: 'Bull Market Begins', description: 'Strong corporate earnings drive gains', severity: 3, assetImpacts: { 'blue-chip': 0.22, 'tech-stocks': 0.28, 'emerging-markets': 0.18 } },
      { yearOffset: 4, quarterOffset: 0, type: 'sideways', title: 'Healthy Correction', description: 'Brief 10% pullback refreshes the rally', severity: 2, assetImpacts: { 'blue-chip': -0.10, 'tech-stocks': -0.12 } },
      { yearOffset: 5, quarterOffset: 1, type: 'bull', title: 'FOMO Rally', description: 'Retail investors pile into markets', severity: 3, assetImpacts: { 'blue-chip': 0.25, 'tech-stocks': 0.32, 'emerging-markets': 0.28 } },
      { yearOffset: 8, quarterOffset: 3, type: 'bull', title: 'Global Expansion', description: 'Emerging markets join the party', severity: 3, assetImpacts: { 'blue-chip': 0.20, 'emerging-markets': 0.25 } },
      { yearOffset: 12, quarterOffset: 0, type: 'sideways', title: 'Consolidation Phase', description: 'Markets pause to catch their breath', severity: 1, assetImpacts: { 'blue-chip': 0.05, 'bonds': 0.03 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.15, volatility: 0.25, crashSensitivity: 0.6, inflationSensitivity: -0.1 },
      'blue-chip': { baseReturn: 0.12, volatility: 0.12, crashSensitivity: 0.4, inflationSensitivity: -0.2 },
      'emerging-markets': { baseReturn: 0.13, volatility: 0.20, crashSensitivity: 0.5, inflationSensitivity: -0.1 },
      'bonds': { baseReturn: 0.03, volatility: 0.05, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.02, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
    },
  },
  {
    id: 'post-crisis-rebound',
    title: 'The Great Rebound',
    description: 'Dramatic V-shaped recovery from a severe crisis.',
    minYears: 10, maxYears: 30,
    volatilityPattern: 'high', recoveryBehavior: 'fast',
    events: [
      { yearOffset: 0, quarterOffset: 1, type: 'crash', title: 'The Crisis', description: 'Severe market crash, -40% drawdown', severity: 5, assetImpacts: { 'blue-chip': -0.35, 'tech-stocks': -0.45, 'emerging-markets': -0.50, 'gold': 0.15, 'bonds': 0.08 } },
      { yearOffset: 1, quarterOffset: 0, type: 'recovery', title: 'Massive Stimulus', description: 'Unprecedented policy response', severity: 4, assetImpacts: { 'blue-chip': 0.30, 'tech-stocks': 0.45, 'emerging-markets': 0.35 } },
      { yearOffset: 2, quarterOffset: 2, type: 'bull', title: 'V-Shaped Recovery', description: 'Markets fully recover and then some', severity: 4, assetImpacts: { 'blue-chip': 0.25, 'tech-stocks': 0.30 } },
      { yearOffset: 4, quarterOffset: 0, type: 'bull', title: 'New All-Time Highs', description: 'Markets reach unprecedented levels', severity: 3, assetImpacts: { 'blue-chip': 0.18, 'tech-stocks': 0.22 } },
      { yearOffset: 6, quarterOffset: 2, type: 'sideways', title: 'Normalization', description: 'Growth slows to sustainable pace', severity: 2, assetImpacts: { 'blue-chip': 0.05, 'bonds': 0.03 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.14, volatility: 0.30, crashSensitivity: 0.9, inflationSensitivity: -0.1 },
      'blue-chip': { baseReturn: 0.11, volatility: 0.20, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
      'emerging-markets': { baseReturn: 0.12, volatility: 0.28, crashSensitivity: 0.9, inflationSensitivity: -0.1 },
      'bonds': { baseReturn: 0.03, volatility: 0.07, crashSensitivity: -0.3, inflationSensitivity: -0.5 },
      'gold': { baseReturn: 0.04, volatility: 0.15, crashSensitivity: -0.4, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.7 },
    },
  },
  {
    id: 'ai-productivity-boom',
    title: 'The AI Revolution',
    description: 'AI transforms the economy, creating massive wealth.',
    minYears: 15, maxYears: 50,
    volatilityPattern: 'medium', recoveryBehavior: 'fast',
    events: [
      { yearOffset: 1, quarterOffset: 0, type: 'bull', title: 'AI Breakthrough', description: 'AGI advances capture market imagination', severity: 4, assetImpacts: { 'tech-stocks': 0.45, 'blue-chip': 0.20, 'emerging-markets': 0.15 } },
      { yearOffset: 3, quarterOffset: 2, type: 'crash', title: 'AI Bubble Concerns', description: 'Valuations questioned, correction ensues', severity: 3, assetImpacts: { 'tech-stocks': -0.30, 'blue-chip': -0.12 } },
      { yearOffset: 5, quarterOffset: 0, type: 'bull', title: 'Productivity Evidence', description: 'Real economic gains validate the hype', severity: 4, assetImpacts: { 'tech-stocks': 0.35, 'blue-chip': 0.22 } },
      { yearOffset: 8, quarterOffset: 1, type: 'sideways', title: 'Job Disruption', description: 'Labor market concerns slow momentum', severity: 2, assetImpacts: { 'tech-stocks': 0.05, 'blue-chip': 0.02 } },
      { yearOffset: 10, quarterOffset: 0, type: 'bull', title: 'New Economy', description: 'AI integration becomes universal', severity: 3, assetImpacts: { 'tech-stocks': 0.28, 'blue-chip': 0.18 } },
    ],
    assetPerformance: {
      'tech-stocks': { baseReturn: 0.18, volatility: 0.32, crashSensitivity: 0.8, inflationSensitivity: -0.1 },
      'blue-chip': { baseReturn: 0.10, volatility: 0.14, crashSensitivity: 0.5, inflationSensitivity: -0.2 },
      'emerging-markets': { baseReturn: 0.09, volatility: 0.20, crashSensitivity: 0.6, inflationSensitivity: -0.1 },
      'bonds': { baseReturn: 0.03, volatility: 0.06, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.03, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
    },
  },
];

export function getScenariosForHorizon(years: number): MarketScenario[] {
  return MARKET_SCENARIOS.filter(s => years >= s.minYears && years <= s.maxYears);
}

export function getRandomScenario(years: number): MarketScenario {
  const eligible = getScenariosForHorizon(years);
  if (eligible.length === 0) {
    return MARKET_SCENARIOS[Math.floor(Math.random() * MARKET_SCENARIOS.length)];
  }
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function getCompressedEvents(scenario: MarketScenario, targetYears: number): ScenarioEvent[] {
  const ratio = targetYears / scenario.maxYears;
  return scenario.events
    .filter(e => e.yearOffset * ratio <= targetYears)
    .map(e => ({ ...e, yearOffset: Math.floor(e.yearOffset * ratio) }))
    .filter((e, i, arr) =>
      i === arr.findIndex(x => x.yearOffset === e.yearOffset && x.quarterOffset === e.quarterOffset)
    );
}
