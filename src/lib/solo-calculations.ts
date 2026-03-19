import type {
  AssetClass,
  Allocation,
  Portfolio,
  Decision,
  SimulationReport,
} from './solo-types';

function gaussianRandom(): number {
  const u1 = Math.max(Math.random(), 1e-10);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export type MarketCondition = 'bull' | 'crash' | 'recovery' | 'inflation' | 'sideways' | 'normal';

/**
 * Returns a QUARTERLY return for one asset under given market conditions.
 * Uses Gaussian noise so returns are realistically volatile — assets can
 * lose value even in "normal" quarters if they're high-risk.
 */
export function simulateMarketReturns(
  assetClass: AssetClass,
  eventType: MarketCondition,
  dampened = false
): number {
  const baseAnnualReturns: Record<AssetClass, number> = {
    'tech-stocks': 0.10,
    'blue-chip': 0.08,
    'emerging-markets': 0.09,
    'bonds': 0.03,
    'gold': 0.04,
    'cash': 0.01,
    'cryptocurrency': 0.15,
    'real-estate': 0.06,
  };

  const quarterlyVolatility: Record<AssetClass, number> = {
    'tech-stocks': 0.10,
    'blue-chip': 0.06,
    'emerging-markets': 0.09,
    'bonds': 0.025,
    'gold': 0.055,
    'cash': 0.003,
    'cryptocurrency': 0.22,
    'real-estate': 0.04,
  };

  const eventReturnMultipliers: Record<MarketCondition, Record<AssetClass, number>> = {
    normal:    { 'tech-stocks': 1,    'blue-chip': 1,    'emerging-markets': 1,    'bonds': 1,    'gold': 1,    'cash': 1,   'cryptocurrency': 1,    'real-estate': 1 },
    bull:      { 'tech-stocks': 3,    'blue-chip': 2,    'emerging-markets': 2.5,  'bonds': 0.8,  'gold': 0.5,  'cash': 1,   'cryptocurrency': 4,    'real-estate': 1.8 },
    crash:     { 'tech-stocks': -4,   'blue-chip': -2.5, 'emerging-markets': -3.5, 'bonds': 0.5,  'gold': 1.5,  'cash': 1,   'cryptocurrency': -6,   'real-estate': -2 },
    recovery:  { 'tech-stocks': 2.5,  'blue-chip': 1.8,  'emerging-markets': 2,    'bonds': 0.6,  'gold': 0.3,  'cash': 1,   'cryptocurrency': 3,    'real-estate': 1.5 },
    inflation: { 'tech-stocks': -0.5, 'blue-chip': 0.3,  'emerging-markets': 0.5,  'bonds': -1.5, 'gold': 2.5,  'cash': -0.5,'cryptocurrency': 1,    'real-estate': 1.8 },
    sideways:  { 'tech-stocks': 0.3,  'blue-chip': 0.5,  'emerging-markets': 0.3,  'bonds': 0.8,  'gold': 0.6,  'cash': 1,   'cryptocurrency': 0.3,  'real-estate': 0.7 },
  };

  const eventVolMultipliers: Record<MarketCondition, number> = {
    normal: 1.0,
    bull: 1.3,
    crash: 1.8,
    recovery: 1.4,
    inflation: 1.3,
    sideways: 0.7,
  };

  const dampenFactor = dampened ? 0.5 : 1.0;
  const multiplier = eventReturnMultipliers[eventType][assetClass];
  const quarterlyExpected = (baseAnnualReturns[assetClass] * multiplier * dampenFactor) / 4;

  const vol = quarterlyVolatility[assetClass];
  const volScale = eventVolMultipliers[eventType] * (dampened ? 0.7 : 1.0);

  return Math.max(-0.5, quarterlyExpected + vol * volScale * gaussianRandom());
}

export function calculateDiversificationScore(allocations: Allocation[]): number {
  const activeAllocations = allocations.filter(a => a.percentage > 0);
  const count = activeAllocations.length;

  if (count === 0) return 0;
  if (count === 1) return 20;

  const hhi = allocations.reduce((sum, a) => sum + Math.pow(a.percentage / 100, 2), 0);
  const minHHI = 1 / allocations.length;
  const normalizedScore = (1 - hhi) / (1 - minHHI);

  return Math.round(normalizedScore * 100);
}

export function calculateRiskScore(allocations: Allocation[]): number {
  const riskWeights: Record<AssetClass, number> = {
    'cash': 0,
    'bonds': 20,
    'gold': 40,
    'blue-chip': 55,
    'real-estate': 60,
    'emerging-markets': 75,
    'tech-stocks': 85,
    'cryptocurrency': 95,
  };

  const totalWeight = allocations.reduce((sum, a) => {
    return sum + (a.percentage / 100) * riskWeights[a.assetClass];
  }, 0);

  return Math.round(totalWeight);
}

export function generateSimulationReport(
  portfolio: Portfolio,
  decisions: Decision[],
  initialValue: number
): SimulationReport {
  const finalValue = portfolio.totalValue;
  const totalContributions = portfolio.history.length * portfolio.monthlyContribution * 3;
  const years = portfolio.history.length / 4;

  const annualizedReturn = years > 0
    ? Math.pow(finalValue / (initialValue + totalContributions), 1 / years) - 1
    : 0;

  let peak = initialValue;
  let maxDrawdown = 0;
  for (const snapshot of portfolio.history) {
    if (snapshot.totalValue > peak) peak = snapshot.totalValue;
    const drawdown = (peak - snapshot.totalValue) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  const diversificationScore = calculateDiversificationScore(portfolio.allocations);

  const mistakes: string[] = [];
  const goodDecisions: string[] = [];

  for (const decision of decisions) {
    if (decision.wasGood === false) {
      mistakes.push(`Year ${decision.year}: ${decision.description} — may have missed opportunity`);
    } else if (decision.wasGood === true) {
      goodDecisions.push(`Year ${decision.year}: ${decision.description}`);
    }
  }

  const coachingInsights = [
    annualizedReturn > 0.06 ? 'Your patience paid off with solid long-term returns.' : 'Consider a longer time horizon for better results.',
    diversificationScore > 60 ? 'Great diversification protected you from major losses.' : 'More diversification could reduce your risk.',
    maxDrawdown < 0.2 ? 'You managed risk well through market cycles.' : 'High drawdowns suggest reviewing your risk tolerance.',
  ];

  return {
    finalValue: Math.round(finalValue),
    initialValue: Math.round(initialValue),
    totalContributions: Math.round(totalContributions),
    annualizedReturn: Math.round(annualizedReturn * 1000) / 10,
    maxDrawdown: Math.round(maxDrawdown * 100),
    diversificationScore,
    decisions,
    mistakes: mistakes.slice(0, 3),
    goodDecisions: goodDecisions.slice(0, 2),
    coachingInsights,
  };
}

export function getAllocationFromStrategy(strategyValue: number): {
  allocations: { assetClass: string; percentage: number }[];
  riskScore: number;
  diversificationScore: number;
  label: string;
} {
  const blueChipBase = Math.min(15 + strategyValue * 0.35, 45);
  const techBase = strategyValue > 30 ? (strategyValue - 30) * 0.45 : 0;
  const emergingBase = strategyValue > 40 ? (strategyValue - 40) * 0.3 : 0;
  const bondBase = Math.max(45 - strategyValue * 0.45, 5);
  const goldBase = Math.max(15 - strategyValue * 0.1, 5);
  const cashBase = Math.max(25 - strategyValue * 0.25, 0);

  const total = blueChipBase + techBase + emergingBase + bondBase + goldBase + cashBase;

  const allocations = [
    { assetClass: 'blue-chip', percentage: Math.round((blueChipBase / total) * 100) },
    { assetClass: 'tech-stocks', percentage: Math.round((techBase / total) * 100) },
    { assetClass: 'emerging-markets', percentage: Math.round((emergingBase / total) * 100) },
    { assetClass: 'bonds', percentage: Math.round((bondBase / total) * 100) },
    { assetClass: 'gold', percentage: Math.round((goldBase / total) * 100) },
    { assetClass: 'cash', percentage: Math.round((cashBase / total) * 100) },
  ].filter(a => a.percentage > 0);

  const currentTotal = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (currentTotal !== 100 && allocations.length > 0) {
    allocations[0].percentage += (100 - currentTotal);
  }

  const riskScore = Math.round(strategyValue);
  const diversificationScore = allocations.length >= 5 ? 85 : allocations.length >= 4 ? 70 : allocations.length >= 3 ? 55 : 35;

  let label: string;
  if (strategyValue <= 25) label = 'Conservative';
  else if (strategyValue <= 50) label = 'Balanced';
  else if (strategyValue <= 75) label = 'Growth';
  else label = 'Aggressive';

  return { allocations, riskScore, diversificationScore, label };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('CHF', '€');
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
  return `€${Math.round(value)}`;
}
