import type {
  AssetClass,
  Allocation,
  Portfolio,
  Decision,
  SimulationReport,
} from './solo-types';

export function simulateMarketReturns(
  assetClass: AssetClass,
  eventType: 'bull' | 'crash' | 'recovery' | 'inflation' | 'sideways' | 'normal'
): number {
  const baseReturns: Record<AssetClass, number> = {
    'global-equity': 0.08,
    'swiss-equity': 0.07,
    'bonds': 0.03,
    'gold': 0.04,
    'cash': 0.01,
    'bitcoin': 0.15,
    'tech-growth': 0.12,
  };

  const eventMultipliers: Record<typeof eventType, Record<AssetClass, number>> = {
    normal: { 'global-equity': 1, 'swiss-equity': 1, 'bonds': 1, 'gold': 1, 'cash': 1, 'bitcoin': 1, 'tech-growth': 1 },
    bull: { 'global-equity': 2.5, 'swiss-equity': 2.2, 'bonds': 0.8, 'gold': 0.5, 'cash': 1, 'bitcoin': 4, 'tech-growth': 3.5 },
    crash: { 'global-equity': -3, 'swiss-equity': -2.5, 'bonds': 0.5, 'gold': 1.5, 'cash': 1, 'bitcoin': -5, 'tech-growth': -4 },
    recovery: { 'global-equity': 2, 'swiss-equity': 1.8, 'bonds': 0.6, 'gold': 0.3, 'cash': 1, 'bitcoin': 3, 'tech-growth': 2.5 },
    inflation: { 'global-equity': 0.3, 'swiss-equity': 0.4, 'bonds': -1, 'gold': 2, 'cash': 0.5, 'bitcoin': 1.5, 'tech-growth': 0 },
    sideways: { 'global-equity': 0.3, 'swiss-equity': 0.4, 'bonds': 0.8, 'gold': 0.6, 'cash': 1, 'bitcoin': 0.5, 'tech-growth': 0.2 },
  };

  const baseReturn = baseReturns[assetClass];
  const multiplier = eventMultipliers[eventType][assetClass];
  const randomFactor = 0.8 + Math.random() * 0.4;

  return baseReturn * multiplier * randomFactor;
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
    'swiss-equity': 60,
    'global-equity': 60,
    'tech-growth': 80,
    'bitcoin': 100,
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
      if (decision.type === 'sell') {
        mistakes.push(`Sold during volatility in year ${decision.year} — missing potential recovery`);
      }
    } else if (decision.wasGood === true) {
      if (decision.type === 'buy-dip') {
        goodDecisions.push(`Bought the dip in year ${decision.year} — captured recovery gains`);
      } else if (decision.type === 'hold') {
        goodDecisions.push(`Stayed calm during year ${decision.year} market stress`);
      }
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
  const equityBase = Math.min(20 + strategyValue * 0.6, 80);
  const bondBase = Math.max(50 - strategyValue * 0.5, 5);
  const goldBase = Math.max(15 - strategyValue * 0.1, 5);
  const cashBase = Math.max(15 - strategyValue * 0.15, 0);
  const techBase = strategyValue > 50 ? (strategyValue - 50) * 0.4 : 0;
  const bitcoinBase = strategyValue > 70 ? (strategyValue - 70) * 0.3 : 0;

  const total = equityBase + bondBase + goldBase + cashBase + techBase + bitcoinBase;

  const allocations = [
    { assetClass: 'global-equity', percentage: Math.round((equityBase / total) * 100) },
    { assetClass: 'bonds', percentage: Math.round((bondBase / total) * 100) },
    { assetClass: 'gold', percentage: Math.round((goldBase / total) * 100) },
    { assetClass: 'cash', percentage: Math.round((cashBase / total) * 100) },
    { assetClass: 'tech-growth', percentage: Math.round((techBase / total) * 100) },
    { assetClass: 'bitcoin', percentage: Math.round((bitcoinBase / total) * 100) },
  ].filter(a => a.percentage > 0);

  const currentTotal = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (currentTotal !== 100 && allocations.length > 0) {
    allocations[0].percentage += (100 - currentTotal);
  }

  const riskScore = Math.round(strategyValue);
  const diversificationScore = allocations.length >= 4 ? 80 : allocations.length >= 3 ? 60 : 40;

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
