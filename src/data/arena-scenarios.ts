// Arena market scenarios — ported from vercel-future-you/data/scenarios.ts
// Do NOT import from the vercel project; all data is copied here.

export type ArenaAssetClass =
  | 'global-equity'
  | 'swiss-equity'
  | 'bonds'
  | 'gold'
  | 'cash'
  | 'bitcoin'
  | 'tech-growth';

export interface MarketScenario {
  id: string;
  title: string;
  description: string;
  minYears: number;
  maxYears: number;
  volatilityPattern: 'low' | 'medium' | 'high' | 'extreme';
  recoveryBehavior: 'fast' | 'gradual' | 'slow' | 'prolonged';
  events: ScenarioEvent[];
  assetPerformance: Record<ArenaAssetClass, AssetPerformanceProfile>;
}

export interface ScenarioEvent {
  yearOffset: number; // relative to start (0 = first year)
  quarterOffset: number; // 0-3
  type: 'bull' | 'crash' | 'recovery' | 'inflation' | 'sideways' | 'crisis' | 'boom';
  title: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = severe
  assetImpacts: Partial<Record<ArenaAssetClass, number>>;
}

export interface AssetPerformanceProfile {
  baseReturn: number; // annual
  volatility: number; // standard deviation
  crashSensitivity: number; // -1 to 1, how much it drops in crashes
  inflationSensitivity: number; // -1 to 1
}

// The 15 unique market scenarios
export const MARKET_SCENARIOS: MarketScenario[] = [
  // 1. Tech Boom then Sharp Crash
  {
    id: 'tech-boom-crash',
    title: 'Tech Boom & Bust',
    description: 'A period of rapid tech growth followed by a sharp correction reminiscent of the dot-com era.',
    minYears: 10,
    maxYears: 25,
    volatilityPattern: 'extreme',
    recoveryBehavior: 'slow',
    events: [
      { yearOffset: 0, quarterOffset: 1, type: 'bull', title: 'Tech Innovation Wave', description: 'New technologies drive unprecedented market optimism', severity: 3, assetImpacts: { 'tech-growth': 0.35, 'global-equity': 0.20, 'bitcoin': 0.45 } },
      { yearOffset: 2, quarterOffset: 0, type: 'boom', title: 'IPO Frenzy', description: 'Tech companies go public at record valuations', severity: 4, assetImpacts: { 'tech-growth': 0.50, 'global-equity': 0.25, 'bonds': -0.05 } },
      { yearOffset: 4, quarterOffset: 2, type: 'crash', title: 'Tech Bubble Bursts', description: 'Overvalued tech stocks collapse as reality sets in', severity: 5, assetImpacts: { 'tech-growth': -0.55, 'global-equity': -0.30, 'bitcoin': -0.60, 'bonds': 0.08, 'gold': 0.12 } },
      { yearOffset: 6, quarterOffset: 0, type: 'sideways', title: 'Market Digestion', description: 'Markets consolidate as investors reassess', severity: 2, assetImpacts: { 'tech-growth': 0.02, 'global-equity': 0.03 } },
      { yearOffset: 8, quarterOffset: 2, type: 'recovery', title: 'Tech Rebirth', description: 'Surviving companies emerge stronger', severity: 3, assetImpacts: { 'tech-growth': 0.25, 'global-equity': 0.15 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.08, volatility: 0.20, crashSensitivity: 0.8, inflationSensitivity: -0.3 },
      'swiss-equity': { baseReturn: 0.07, volatility: 0.18, crashSensitivity: 0.7, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.06, crashSensitivity: -0.3, inflationSensitivity: -0.5 },
      'gold': { baseReturn: 0.04, volatility: 0.15, crashSensitivity: -0.4, inflationSensitivity: 0.6 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.8 },
      'bitcoin': { baseReturn: 0.15, volatility: 0.60, crashSensitivity: 1.2, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.12, volatility: 0.35, crashSensitivity: 1.0, inflationSensitivity: -0.2 },
    },
  },

  // 2. Inflation Decade
  {
    id: 'inflation-decade',
    title: 'The Inflation Decade',
    description: 'A prolonged period of high inflation eroding purchasing power and reshaping investment strategies.',
    minYears: 10,
    maxYears: 30,
    volatilityPattern: 'medium',
    recoveryBehavior: 'gradual',
    events: [
      { yearOffset: 1, quarterOffset: 0, type: 'inflation', title: 'Inflation Heats Up', description: 'CPI rises above 5% as supply chains struggle', severity: 3, assetImpacts: { 'gold': 0.20, 'bonds': -0.12, 'cash': -0.05, 'global-equity': 0.02 } },
      { yearOffset: 3, quarterOffset: 1, type: 'crisis', title: 'Wage-Price Spiral', description: 'Inflation becomes entrenched in the economy', severity: 4, assetImpacts: { 'gold': 0.25, 'bonds': -0.15, 'global-equity': -0.08, 'bitcoin': 0.15 } },
      { yearOffset: 5, quarterOffset: 2, type: 'sideways', title: 'Central Bank Pivot', description: 'Aggressive rate hikes slow growth', severity: 3, assetImpacts: { 'bonds': -0.08, 'global-equity': -0.10, 'gold': 0.05 } },
      { yearOffset: 7, quarterOffset: 0, type: 'recovery', title: 'Inflation Peaks', description: 'Price pressures begin to ease', severity: 2, assetImpacts: { 'global-equity': 0.12, 'bonds': 0.05, 'gold': -0.05 } },
      { yearOffset: 9, quarterOffset: 2, type: 'bull', title: 'New Equilibrium', description: 'Markets adapt to higher rate environment', severity: 2, assetImpacts: { 'global-equity': 0.15, 'swiss-equity': 0.12 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.05, volatility: 0.18, crashSensitivity: 0.6, inflationSensitivity: -0.4 },
      'swiss-equity': { baseReturn: 0.05, volatility: 0.16, crashSensitivity: 0.5, inflationSensitivity: -0.3 },
      'bonds': { baseReturn: 0.01, volatility: 0.10, crashSensitivity: -0.2, inflationSensitivity: -0.7 },
      'gold': { baseReturn: 0.08, volatility: 0.18, crashSensitivity: -0.5, inflationSensitivity: 0.8 },
      'cash': { baseReturn: 0.02, volatility: 0.02, crashSensitivity: 0, inflationSensitivity: -0.9 },
      'bitcoin': { baseReturn: 0.10, volatility: 0.55, crashSensitivity: 0.8, inflationSensitivity: 0.4 },
      'tech-growth': { baseReturn: 0.06, volatility: 0.30, crashSensitivity: 0.9, inflationSensitivity: -0.3 },
    },
  },

  // 3. Global Steady Growth
  {
    id: 'global-steady-growth',
    title: 'Golden Age of Growth',
    description: 'A rare period of sustained global economic expansion with low volatility.',
    minYears: 15,
    maxYears: 50,
    volatilityPattern: 'low',
    recoveryBehavior: 'fast',
    events: [
      { yearOffset: 2, quarterOffset: 1, type: 'bull', title: 'Synchronized Growth', description: 'All major economies expand together', severity: 3, assetImpacts: { 'global-equity': 0.18, 'swiss-equity': 0.15, 'tech-growth': 0.22 } },
      { yearOffset: 5, quarterOffset: 0, type: 'sideways', title: 'Healthy Pause', description: 'Markets consolidate gains', severity: 1, assetImpacts: { 'global-equity': 0.04, 'bonds': 0.03 } },
      { yearOffset: 8, quarterOffset: 2, type: 'bull', title: 'Productivity Boom', description: 'Technology drives efficiency gains', severity: 3, assetImpacts: { 'global-equity': 0.20, 'tech-growth': 0.28, 'bonds': 0.02 } },
      { yearOffset: 12, quarterOffset: 1, type: 'sideways', title: 'Minor Correction', description: 'Brief pullback in equity markets', severity: 2, assetImpacts: { 'global-equity': -0.08, 'gold': 0.05 } },
      { yearOffset: 15, quarterOffset: 0, type: 'bull', title: 'New Highs', description: 'Markets reach record levels on strong fundamentals', severity: 2, assetImpacts: { 'global-equity': 0.15, 'swiss-equity': 0.12 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.10, volatility: 0.12, crashSensitivity: 0.5, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.09, volatility: 0.10, crashSensitivity: 0.4, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.04, volatility: 0.05, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.03, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
      'bitcoin': { baseReturn: 0.18, volatility: 0.45, crashSensitivity: 0.7, inflationSensitivity: 0.2 },
      'tech-growth': { baseReturn: 0.14, volatility: 0.22, crashSensitivity: 0.7, inflationSensitivity: -0.1 },
    },
  },

  // 4. Commodity Shock
  {
    id: 'commodity-shock',
    title: 'Commodity Supercycle',
    description: 'Resource scarcity drives a major commodities boom with ripple effects across all markets.',
    minYears: 10,
    maxYears: 25,
    volatilityPattern: 'high',
    recoveryBehavior: 'gradual',
    events: [
      { yearOffset: 1, quarterOffset: 2, type: 'crisis', title: 'Oil Supply Crunch', description: 'Energy prices surge on supply disruptions', severity: 4, assetImpacts: { 'gold': 0.25, 'global-equity': -0.12, 'tech-growth': -0.18 } },
      { yearOffset: 3, quarterOffset: 0, type: 'inflation', title: 'Resource Nationalism', description: 'Countries restrict commodity exports', severity: 4, assetImpacts: { 'gold': 0.30, 'bonds': -0.10, 'global-equity': -0.05 } },
      { yearOffset: 4, quarterOffset: 3, type: 'crash', title: 'Demand Destruction', description: 'High prices trigger economic slowdown', severity: 4, assetImpacts: { 'global-equity': -0.25, 'tech-growth': -0.30, 'bitcoin': -0.35, 'gold': 0.08 } },
      { yearOffset: 6, quarterOffset: 1, type: 'recovery', title: 'Supply Response', description: 'New production comes online', severity: 3, assetImpacts: { 'global-equity': 0.15, 'tech-growth': 0.18 } },
      { yearOffset: 8, quarterOffset: 0, type: 'bull', title: 'New Energy Era', description: 'Transition investments drive growth', severity: 3, assetImpacts: { 'global-equity': 0.18, 'tech-growth': 0.25 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.06, volatility: 0.22, crashSensitivity: 0.7, inflationSensitivity: -0.3 },
      'swiss-equity': { baseReturn: 0.06, volatility: 0.20, crashSensitivity: 0.6, inflationSensitivity: -0.3 },
      'bonds': { baseReturn: 0.02, volatility: 0.08, crashSensitivity: -0.2, inflationSensitivity: -0.6 },
      'gold': { baseReturn: 0.10, volatility: 0.20, crashSensitivity: -0.5, inflationSensitivity: 0.7 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.8 },
      'bitcoin': { baseReturn: 0.08, volatility: 0.55, crashSensitivity: 0.9, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.08, volatility: 0.32, crashSensitivity: 0.9, inflationSensitivity: -0.2 },
    },
  },

  // 5. Multi-Dip Recovery Cycle
  {
    id: 'multi-dip-recovery',
    title: 'The Rollercoaster Recovery',
    description: 'Markets experience multiple false starts and pullbacks before sustained recovery.',
    minYears: 12,
    maxYears: 30,
    volatilityPattern: 'high',
    recoveryBehavior: 'prolonged',
    events: [
      { yearOffset: 0, quarterOffset: 2, type: 'crash', title: 'Initial Shock', description: 'Major market correction begins the cycle', severity: 4, assetImpacts: { 'global-equity': -0.28, 'tech-growth': -0.35, 'bitcoin': -0.45, 'gold': 0.15, 'bonds': 0.06 } },
      { yearOffset: 1, quarterOffset: 1, type: 'recovery', title: 'False Dawn', description: 'Markets bounce but on shaky ground', severity: 2, assetImpacts: { 'global-equity': 0.18, 'tech-growth': 0.22 } },
      { yearOffset: 2, quarterOffset: 3, type: 'crash', title: 'Second Dip', description: 'Recovery falters, markets sell off again', severity: 3, assetImpacts: { 'global-equity': -0.20, 'tech-growth': -0.25, 'gold': 0.10 } },
      { yearOffset: 4, quarterOffset: 0, type: 'recovery', title: 'Tentative Recovery', description: 'Cautious optimism returns', severity: 2, assetImpacts: { 'global-equity': 0.15, 'bonds': 0.04 } },
      { yearOffset: 5, quarterOffset: 2, type: 'sideways', title: 'Third Test', description: 'Markets test support levels again', severity: 2, assetImpacts: { 'global-equity': -0.08, 'gold': 0.05 } },
      { yearOffset: 7, quarterOffset: 0, type: 'bull', title: 'Sustained Recovery', description: 'Finally, a durable uptrend emerges', severity: 3, assetImpacts: { 'global-equity': 0.22, 'tech-growth': 0.28 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.07, volatility: 0.25, crashSensitivity: 0.9, inflationSensitivity: -0.3 },
      'swiss-equity': { baseReturn: 0.06, volatility: 0.22, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.07, crashSensitivity: -0.3, inflationSensitivity: -0.5 },
      'gold': { baseReturn: 0.05, volatility: 0.16, crashSensitivity: -0.5, inflationSensitivity: 0.6 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.7 },
      'bitcoin': { baseReturn: 0.12, volatility: 0.60, crashSensitivity: 1.1, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.10, volatility: 0.35, crashSensitivity: 1.0, inflationSensitivity: -0.2 },
    },
  },

  // 6. Bond-Friendly Recession
  {
    id: 'bond-friendly-recession',
    title: 'The Safe Haven Era',
    description: 'A deflationary recession where bonds and safe assets dramatically outperform.',
    minYears: 10,
    maxYears: 25,
    volatilityPattern: 'medium',
    recoveryBehavior: 'slow',
    events: [
      { yearOffset: 1, quarterOffset: 0, type: 'crash', title: 'Deflationary Spiral', description: 'Economic contraction triggers flight to safety', severity: 4, assetImpacts: { 'global-equity': -0.25, 'tech-growth': -0.30, 'bonds': 0.15, 'gold': 0.10, 'cash': 0.02 } },
      { yearOffset: 2, quarterOffset: 2, type: 'sideways', title: 'Negative Rates', description: 'Central banks push rates below zero', severity: 3, assetImpacts: { 'bonds': 0.12, 'global-equity': -0.05, 'gold': 0.08 } },
      { yearOffset: 4, quarterOffset: 1, type: 'sideways', title: 'Japanification', description: 'Prolonged low growth becomes the norm', severity: 2, assetImpacts: { 'bonds': 0.05, 'global-equity': 0.02, 'swiss-equity': 0.03 } },
      { yearOffset: 6, quarterOffset: 0, type: 'recovery', title: 'Green Shoots', description: 'First signs of economic revival', severity: 2, assetImpacts: { 'global-equity': 0.12, 'bonds': -0.03 } },
      { yearOffset: 8, quarterOffset: 2, type: 'bull', title: 'Reflation Trade', description: 'Growth finally returns to markets', severity: 3, assetImpacts: { 'global-equity': 0.20, 'tech-growth': 0.25, 'bonds': -0.08 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.04, volatility: 0.18, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.04, volatility: 0.16, crashSensitivity: 0.7, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.06, volatility: 0.08, crashSensitivity: -0.5, inflationSensitivity: -0.3 },
      'gold': { baseReturn: 0.05, volatility: 0.14, crashSensitivity: -0.4, inflationSensitivity: 0.4 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.5 },
      'bitcoin': { baseReturn: 0.08, volatility: 0.50, crashSensitivity: 0.9, inflationSensitivity: 0.2 },
      'tech-growth': { baseReturn: 0.06, volatility: 0.28, crashSensitivity: 0.9, inflationSensitivity: -0.1 },
    },
  },

  // 7. Equity Supercycle
  {
    id: 'equity-supercycle',
    title: 'The Great Bull Run',
    description: 'An extended period of equity dominance with only minor corrections.',
    minYears: 15,
    maxYears: 50,
    volatilityPattern: 'low',
    recoveryBehavior: 'fast',
    events: [
      { yearOffset: 1, quarterOffset: 2, type: 'bull', title: 'Bull Market Begins', description: 'Strong corporate earnings drive gains', severity: 3, assetImpacts: { 'global-equity': 0.22, 'tech-growth': 0.28, 'swiss-equity': 0.18 } },
      { yearOffset: 4, quarterOffset: 0, type: 'sideways', title: 'Healthy Correction', description: 'Brief 10% pullback refreshes the rally', severity: 2, assetImpacts: { 'global-equity': -0.10, 'tech-growth': -0.12 } },
      { yearOffset: 5, quarterOffset: 1, type: 'bull', title: 'FOMO Rally', description: 'Retail investors pile into markets', severity: 3, assetImpacts: { 'global-equity': 0.25, 'tech-growth': 0.32, 'bitcoin': 0.40 } },
      { yearOffset: 8, quarterOffset: 3, type: 'bull', title: 'Global Expansion', description: 'Emerging markets join the party', severity: 3, assetImpacts: { 'global-equity': 0.20, 'swiss-equity': 0.15 } },
      { yearOffset: 12, quarterOffset: 0, type: 'sideways', title: 'Consolidation Phase', description: 'Markets pause to catch their breath', severity: 1, assetImpacts: { 'global-equity': 0.05, 'bonds': 0.03 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.12, volatility: 0.14, crashSensitivity: 0.5, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.10, volatility: 0.12, crashSensitivity: 0.4, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.05, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.02, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
      'bitcoin': { baseReturn: 0.20, volatility: 0.50, crashSensitivity: 0.7, inflationSensitivity: 0.2 },
      'tech-growth': { baseReturn: 0.15, volatility: 0.25, crashSensitivity: 0.6, inflationSensitivity: -0.1 },
    },
  },

  // 8. Stagflation Environment
  {
    id: 'stagflation',
    title: 'Stagflation Trap',
    description: 'The worst of both worlds: high inflation combined with stagnant growth.',
    minYears: 10,
    maxYears: 25,
    volatilityPattern: 'high',
    recoveryBehavior: 'prolonged',
    events: [
      { yearOffset: 1, quarterOffset: 1, type: 'inflation', title: 'Inflation Surge', description: 'Prices rise while growth stalls', severity: 4, assetImpacts: { 'gold': 0.22, 'bonds': -0.15, 'global-equity': -0.08, 'cash': -0.04 } },
      { yearOffset: 3, quarterOffset: 0, type: 'crisis', title: 'Policy Dilemma', description: 'Central banks caught between inflation and recession', severity: 4, assetImpacts: { 'gold': 0.18, 'global-equity': -0.12, 'bonds': -0.10 } },
      { yearOffset: 4, quarterOffset: 2, type: 'crash', title: 'Stagflation Peak', description: 'Markets capitulate as no easy solutions exist', severity: 4, assetImpacts: { 'global-equity': -0.22, 'tech-growth': -0.28, 'gold': 0.10, 'bitcoin': -0.30 } },
      { yearOffset: 6, quarterOffset: 1, type: 'sideways', title: 'Muddling Through', description: 'Economy adapts to difficult conditions', severity: 2, assetImpacts: { 'global-equity': 0.03, 'gold': 0.05 } },
      { yearOffset: 8, quarterOffset: 0, type: 'recovery', title: 'Breaking Free', description: 'Finally, inflation falls and growth returns', severity: 3, assetImpacts: { 'global-equity': 0.18, 'bonds': 0.08, 'gold': -0.05 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.03, volatility: 0.22, crashSensitivity: 0.8, inflationSensitivity: -0.5 },
      'swiss-equity': { baseReturn: 0.03, volatility: 0.20, crashSensitivity: 0.7, inflationSensitivity: -0.4 },
      'bonds': { baseReturn: -0.01, volatility: 0.10, crashSensitivity: -0.2, inflationSensitivity: -0.8 },
      'gold': { baseReturn: 0.10, volatility: 0.20, crashSensitivity: -0.5, inflationSensitivity: 0.9 },
      'cash': { baseReturn: 0.00, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.9 },
      'bitcoin': { baseReturn: 0.05, volatility: 0.55, crashSensitivity: 0.9, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.04, volatility: 0.32, crashSensitivity: 0.9, inflationSensitivity: -0.4 },
    },
  },

  // 9. Gold Defensive Era
  {
    id: 'gold-defensive-era',
    title: 'Flight to Gold',
    description: 'Geopolitical uncertainty and currency concerns make gold the star performer.',
    minYears: 10,
    maxYears: 30,
    volatilityPattern: 'medium',
    recoveryBehavior: 'gradual',
    events: [
      { yearOffset: 1, quarterOffset: 0, type: 'crisis', title: 'Currency Crisis', description: 'Major currencies face confidence issues', severity: 4, assetImpacts: { 'gold': 0.30, 'bitcoin': 0.25, 'global-equity': -0.10, 'bonds': -0.05 } },
      { yearOffset: 2, quarterOffset: 2, type: 'crash', title: 'Market Panic', description: 'Risk assets sell off amid uncertainty', severity: 4, assetImpacts: { 'gold': 0.20, 'global-equity': -0.20, 'tech-growth': -0.25, 'bonds': 0.05 } },
      { yearOffset: 4, quarterOffset: 1, type: 'sideways', title: 'Safe Haven Premium', description: 'Gold maintains elevated prices', severity: 2, assetImpacts: { 'gold': 0.08, 'global-equity': 0.02 } },
      { yearOffset: 6, quarterOffset: 0, type: 'recovery', title: 'Stability Returns', description: 'Confidence slowly rebuilds', severity: 2, assetImpacts: { 'global-equity': 0.12, 'gold': -0.05 } },
      { yearOffset: 8, quarterOffset: 2, type: 'bull', title: 'Risk On Again', description: 'Investors return to growth assets', severity: 3, assetImpacts: { 'global-equity': 0.18, 'tech-growth': 0.22, 'gold': -0.08 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.05, volatility: 0.20, crashSensitivity: 0.8, inflationSensitivity: -0.3 },
      'swiss-equity': { baseReturn: 0.05, volatility: 0.18, crashSensitivity: 0.7, inflationSensitivity: -0.3 },
      'bonds': { baseReturn: 0.03, volatility: 0.07, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.12, volatility: 0.18, crashSensitivity: -0.6, inflationSensitivity: 0.7 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.7 },
      'bitcoin': { baseReturn: 0.10, volatility: 0.50, crashSensitivity: 0.6, inflationSensitivity: 0.4 },
      'tech-growth': { baseReturn: 0.07, volatility: 0.28, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
    },
  },

  // 10. Crypto Mania with Collapse
  {
    id: 'crypto-mania',
    title: 'Crypto Winter & Summer',
    description: 'Wild swings in digital assets create both massive gains and devastating losses.',
    minYears: 10,
    maxYears: 25,
    volatilityPattern: 'extreme',
    recoveryBehavior: 'fast',
    events: [
      { yearOffset: 1, quarterOffset: 1, type: 'boom', title: 'Crypto Summer', description: 'Digital assets explode in value', severity: 5, assetImpacts: { 'bitcoin': 0.80, 'tech-growth': 0.35, 'global-equity': 0.15 } },
      { yearOffset: 2, quarterOffset: 3, type: 'crash', title: 'Crypto Winter', description: 'Bubble bursts, 80% decline in crypto', severity: 5, assetImpacts: { 'bitcoin': -0.75, 'tech-growth': -0.25, 'global-equity': -0.08 } },
      { yearOffset: 4, quarterOffset: 0, type: 'sideways', title: 'Building Phase', description: 'Survivors focus on development', severity: 2, assetImpacts: { 'bitcoin': 0.15, 'tech-growth': 0.08 } },
      { yearOffset: 5, quarterOffset: 2, type: 'bull', title: 'Institutional Adoption', description: 'Big money enters the space', severity: 4, assetImpacts: { 'bitcoin': 0.60, 'tech-growth': 0.25, 'global-equity': 0.12 } },
      { yearOffset: 7, quarterOffset: 1, type: 'crash', title: 'Regulatory Crackdown', description: 'Government actions trigger sell-off', severity: 4, assetImpacts: { 'bitcoin': -0.50, 'tech-growth': -0.15 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.08, volatility: 0.18, crashSensitivity: 0.6, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.07, volatility: 0.16, crashSensitivity: 0.5, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.06, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.04, volatility: 0.14, crashSensitivity: -0.4, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
      'bitcoin': { baseReturn: 0.25, volatility: 0.80, crashSensitivity: 1.3, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.12, volatility: 0.30, crashSensitivity: 0.8, inflationSensitivity: -0.1 },
    },
  },

  // 11. Sideways Lost Decade
  {
    id: 'lost-decade',
    title: 'The Lost Decade',
    description: 'Markets go nowhere for years, testing investor patience and strategy.',
    minYears: 10,
    maxYears: 20,
    volatilityPattern: 'medium',
    recoveryBehavior: 'prolonged',
    events: [
      { yearOffset: 1, quarterOffset: 2, type: 'sideways', title: 'Range Bound', description: 'Markets trade in a tight range', severity: 2, assetImpacts: { 'global-equity': 0.02, 'bonds': 0.03, 'gold': 0.03 } },
      { yearOffset: 3, quarterOffset: 0, type: 'crash', title: 'False Breakdown', description: 'Brief scare but markets recover', severity: 3, assetImpacts: { 'global-equity': -0.15, 'tech-growth': -0.18, 'gold': 0.08 } },
      { yearOffset: 4, quarterOffset: 2, type: 'recovery', title: 'Back to Range', description: 'Markets return to sideways pattern', severity: 2, assetImpacts: { 'global-equity': 0.12, 'bonds': 0.02 } },
      { yearOffset: 6, quarterOffset: 1, type: 'bull', title: 'False Breakout', description: 'Rally fades, hope turns to disappointment', severity: 2, assetImpacts: { 'global-equity': 0.10, 'tech-growth': 0.12 } },
      { yearOffset: 7, quarterOffset: 3, type: 'sideways', title: 'More of the Same', description: 'Volatility without direction', severity: 2, assetImpacts: { 'global-equity': -0.08, 'gold': 0.04 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.03, volatility: 0.16, crashSensitivity: 0.7, inflationSensitivity: -0.3 },
      'swiss-equity': { baseReturn: 0.03, volatility: 0.14, crashSensitivity: 0.6, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.04, volatility: 0.06, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.05, volatility: 0.14, crashSensitivity: -0.4, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
      'bitcoin': { baseReturn: 0.08, volatility: 0.50, crashSensitivity: 0.8, inflationSensitivity: 0.2 },
      'tech-growth': { baseReturn: 0.05, volatility: 0.25, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
    },
  },

  // 12. Post-Crisis Rebound
  {
    id: 'post-crisis-rebound',
    title: 'The Great Rebound',
    description: 'A dramatic V-shaped recovery from a severe crisis creates generational buying opportunity.',
    minYears: 10,
    maxYears: 30,
    volatilityPattern: 'high',
    recoveryBehavior: 'fast',
    events: [
      { yearOffset: 0, quarterOffset: 1, type: 'crash', title: 'The Crisis', description: 'Severe market crash, -40% drawdown', severity: 5, assetImpacts: { 'global-equity': -0.40, 'tech-growth': -0.45, 'bitcoin': -0.60, 'gold': 0.15, 'bonds': 0.08 } },
      { yearOffset: 1, quarterOffset: 0, type: 'recovery', title: 'Massive Stimulus', description: 'Unprecedented policy response', severity: 4, assetImpacts: { 'global-equity': 0.35, 'tech-growth': 0.45, 'bitcoin': 0.50 } },
      { yearOffset: 2, quarterOffset: 2, type: 'bull', title: 'V-Shaped Recovery', description: 'Markets fully recover and then some', severity: 4, assetImpacts: { 'global-equity': 0.25, 'tech-growth': 0.30 } },
      { yearOffset: 4, quarterOffset: 0, type: 'bull', title: 'New All-Time Highs', description: 'Markets reach unprecedented levels', severity: 3, assetImpacts: { 'global-equity': 0.18, 'tech-growth': 0.22 } },
      { yearOffset: 6, quarterOffset: 2, type: 'sideways', title: 'Normalization', description: 'Growth slows to sustainable pace', severity: 2, assetImpacts: { 'global-equity': 0.05, 'bonds': 0.03 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.11, volatility: 0.22, crashSensitivity: 0.9, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.09, volatility: 0.20, crashSensitivity: 0.8, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.07, crashSensitivity: -0.3, inflationSensitivity: -0.5 },
      'gold': { baseReturn: 0.04, volatility: 0.15, crashSensitivity: -0.4, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.7 },
      'bitcoin': { baseReturn: 0.18, volatility: 0.55, crashSensitivity: 1.0, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.14, volatility: 0.30, crashSensitivity: 0.9, inflationSensitivity: -0.1 },
    },
  },

  // 13. Strong Dividend Era
  {
    id: 'dividend-era',
    title: 'The Income Age',
    description: 'Low growth but high dividends make income strategies shine.',
    minYears: 15,
    maxYears: 40,
    volatilityPattern: 'low',
    recoveryBehavior: 'gradual',
    events: [
      { yearOffset: 2, quarterOffset: 1, type: 'sideways', title: 'Low Growth Reality', description: 'Markets adjust to slower growth era', severity: 2, assetImpacts: { 'global-equity': 0.04, 'bonds': 0.05, 'swiss-equity': 0.05 } },
      { yearOffset: 4, quarterOffset: 0, type: 'bull', title: 'Dividend Champions', description: 'Quality dividend stocks outperform', severity: 2, assetImpacts: { 'global-equity': 0.12, 'swiss-equity': 0.14, 'bonds': 0.04 } },
      { yearOffset: 7, quarterOffset: 2, type: 'sideways', title: 'Yield Hunting', description: 'Investors chase income everywhere', severity: 2, assetImpacts: { 'bonds': 0.06, 'global-equity': 0.05 } },
      { yearOffset: 10, quarterOffset: 0, type: 'crash', title: 'Rate Shock', description: 'Sudden rate rise hits income assets', severity: 3, assetImpacts: { 'bonds': -0.12, 'global-equity': -0.10, 'gold': 0.05 } },
      { yearOffset: 12, quarterOffset: 1, type: 'recovery', title: 'New Equilibrium', description: 'Markets adapt to higher rates', severity: 2, assetImpacts: { 'global-equity': 0.10, 'bonds': 0.05 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.07, volatility: 0.12, crashSensitivity: 0.5, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.07, volatility: 0.10, crashSensitivity: 0.4, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.05, volatility: 0.06, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.03, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
      'bitcoin': { baseReturn: 0.10, volatility: 0.45, crashSensitivity: 0.7, inflationSensitivity: 0.2 },
      'tech-growth': { baseReturn: 0.08, volatility: 0.22, crashSensitivity: 0.7, inflationSensitivity: -0.1 },
    },
  },

  // 14. Geopolitical Turbulence
  {
    id: 'geopolitical-turbulence',
    title: 'World in Flux',
    description: 'International tensions and regional conflicts create persistent market uncertainty.',
    minYears: 10,
    maxYears: 30,
    volatilityPattern: 'high',
    recoveryBehavior: 'gradual',
    events: [
      { yearOffset: 1, quarterOffset: 1, type: 'crisis', title: 'Regional Conflict', description: 'Military tensions rattle markets', severity: 4, assetImpacts: { 'gold': 0.22, 'global-equity': -0.15, 'bitcoin': -0.10, 'bonds': 0.05 } },
      { yearOffset: 2, quarterOffset: 3, type: 'crash', title: 'Trade War Escalation', description: 'Economic nationalism triggers sell-off', severity: 4, assetImpacts: { 'global-equity': -0.22, 'tech-growth': -0.28, 'swiss-equity': -0.15 } },
      { yearOffset: 4, quarterOffset: 0, type: 'sideways', title: 'New Cold War', description: 'Markets adjust to fragmented world', severity: 3, assetImpacts: { 'gold': 0.10, 'global-equity': -0.05 } },
      { yearOffset: 6, quarterOffset: 2, type: 'recovery', title: 'Diplomatic Progress', description: 'Tensions ease, markets rally', severity: 3, assetImpacts: { 'global-equity': 0.18, 'tech-growth': 0.22 } },
      { yearOffset: 8, quarterOffset: 1, type: 'crisis', title: 'New Flashpoint', description: 'Another crisis emerges', severity: 3, assetImpacts: { 'gold': 0.15, 'global-equity': -0.12 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.05, volatility: 0.22, crashSensitivity: 0.8, inflationSensitivity: -0.3 },
      'swiss-equity': { baseReturn: 0.06, volatility: 0.18, crashSensitivity: 0.6, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.07, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.08, volatility: 0.18, crashSensitivity: -0.5, inflationSensitivity: 0.6 },
      'cash': { baseReturn: 0.01, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.7 },
      'bitcoin': { baseReturn: 0.08, volatility: 0.55, crashSensitivity: 0.8, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.07, volatility: 0.30, crashSensitivity: 0.9, inflationSensitivity: -0.2 },
    },
  },

  // 15. AI Productivity Boom
  {
    id: 'ai-productivity-boom',
    title: 'The AI Revolution',
    description: 'Artificial intelligence transforms the economy, creating massive wealth for early adopters.',
    minYears: 15,
    maxYears: 50,
    volatilityPattern: 'medium',
    recoveryBehavior: 'fast',
    events: [
      { yearOffset: 1, quarterOffset: 0, type: 'bull', title: 'AI Breakthrough', description: 'AGI advances capture market imagination', severity: 4, assetImpacts: { 'tech-growth': 0.45, 'global-equity': 0.20, 'bitcoin': 0.30 } },
      { yearOffset: 3, quarterOffset: 2, type: 'crash', title: 'AI Bubble Concerns', description: 'Valuations questioned, correction ensues', severity: 3, assetImpacts: { 'tech-growth': -0.30, 'global-equity': -0.12 } },
      { yearOffset: 5, quarterOffset: 0, type: 'bull', title: 'Productivity Evidence', description: 'Real economic gains validate the hype', severity: 4, assetImpacts: { 'tech-growth': 0.35, 'global-equity': 0.22 } },
      { yearOffset: 8, quarterOffset: 1, type: 'sideways', title: 'Job Disruption', description: 'Labor market concerns slow momentum', severity: 2, assetImpacts: { 'tech-growth': 0.05, 'global-equity': 0.02 } },
      { yearOffset: 10, quarterOffset: 0, type: 'bull', title: 'New Economy', description: 'AI integration becomes universal', severity: 3, assetImpacts: { 'tech-growth': 0.28, 'global-equity': 0.18 } },
    ],
    assetPerformance: {
      'global-equity': { baseReturn: 0.10, volatility: 0.16, crashSensitivity: 0.6, inflationSensitivity: -0.2 },
      'swiss-equity': { baseReturn: 0.08, volatility: 0.14, crashSensitivity: 0.5, inflationSensitivity: -0.2 },
      'bonds': { baseReturn: 0.03, volatility: 0.06, crashSensitivity: -0.2, inflationSensitivity: -0.4 },
      'gold': { baseReturn: 0.03, volatility: 0.12, crashSensitivity: -0.3, inflationSensitivity: 0.5 },
      'cash': { baseReturn: 0.02, volatility: 0.01, crashSensitivity: 0, inflationSensitivity: -0.6 },
      'bitcoin': { baseReturn: 0.15, volatility: 0.50, crashSensitivity: 0.7, inflationSensitivity: 0.3 },
      'tech-growth': { baseReturn: 0.18, volatility: 0.32, crashSensitivity: 0.8, inflationSensitivity: -0.1 },
    },
  },
];

// Filler event titles used when padding to reach count rounds
const FILLER_TITLES = ['Market Consolidation', 'Quiet Quarter', 'Steady Growth', 'Range Trading', 'Calm Before'];
const FILLER_DESCRIPTIONS = [
  'Markets move sideways as participants await the next catalyst.',
  'Low-volatility period with minimal directional movement.',
  'Gradual appreciation with no major macro drivers.',
  'Markets consolidate recent gains in orderly fashion.',
  'Uncertainty keeps markets range-bound.',
];

/**
 * Returns exactly `count` ScenarioEvents for use as arena rounds.
 * - If the scenario has fewer events, filler "sideways" rounds are inserted.
 * - If more, only the first `count` are used.
 */
export function getArenaRounds(scenario: MarketScenario, count: number = 8): ScenarioEvent[] {
  const base = scenario.events.slice(); // shallow copy

  if (base.length >= count) {
    return base.slice(0, count);
  }

  // Build filler events interleaved between existing events
  const result: ScenarioEvent[] = [...base];
  let fillerIndex = 0;

  while (result.length < count) {
    const titleIdx = fillerIndex % FILLER_TITLES.length;
    const filler: ScenarioEvent = {
      yearOffset: fillerIndex, // yearOffset is placeholder; arena uses index, not exact year
      quarterOffset: (fillerIndex * 2) % 4,
      type: 'sideways',
      title: FILLER_TITLES[titleIdx],
      description: FILLER_DESCRIPTIONS[titleIdx],
      severity: 1,
      assetImpacts: {
        'global-equity': parseFloat(((Math.random() * 0.04) - 0.02).toFixed(3)),
        'swiss-equity':  parseFloat(((Math.random() * 0.04) - 0.02).toFixed(3)),
        'bonds':         parseFloat(((Math.random() * 0.02) - 0.01).toFixed(3)),
        'gold':          parseFloat(((Math.random() * 0.02) - 0.01).toFixed(3)),
        'tech-growth':   parseFloat(((Math.random() * 0.04) - 0.02).toFixed(3)),
      },
    };

    // Insert after the middle existing event to maintain narrative flow
    const insertAt = Math.min(
      Math.floor(result.length / 2) + fillerIndex,
      result.length
    );
    result.splice(insertAt, 0, filler);
    fillerIndex++;
  }

  return result.slice(0, count);
}

// Helper: get scenarios suitable for a given time horizon
export function getScenariosForHorizon(years: number): MarketScenario[] {
  return MARKET_SCENARIOS.filter(s => years >= s.minYears && years <= s.maxYears);
}

// Helper: get a random scenario for a given horizon
export function getRandomScenario(years: number): MarketScenario {
  const eligible = getScenariosForHorizon(years);
  if (eligible.length === 0) {
    return MARKET_SCENARIOS[Math.floor(Math.random() * MARKET_SCENARIOS.length)];
  }
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// Helper: get a specific scenario by ID
export function getScenarioById(id: string): MarketScenario | undefined {
  return MARKET_SCENARIOS.find(s => s.id === id);
}
