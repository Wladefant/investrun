import type {
  SimulationState,
  Portfolio,
  Allocation,
  SimulationEvent,
  AssetClass,
  EventType,
  PortfolioSnapshot,
  Decision,
} from './solo-types';
import { simulateMarketReturns } from './solo-calculations';

interface MarketScenarioTemplate {
  year: number;
  quarter: number;
  type: EventType;
  title: string;
  description: string;
}

const SCENARIO_TEMPLATES: MarketScenarioTemplate[] = [
  { year: 2, quarter: 1, type: 'bull', title: 'Tech Rally', description: 'Technology stocks surge on AI optimism' },
  { year: 3, quarter: 3, type: 'sideways', title: 'Market Consolidation', description: 'Markets take a breather after strong gains' },
  { year: 5, quarter: 2, type: 'crash', title: 'Global Recession Fears', description: 'Markets drop 25% on economic uncertainty' },
  { year: 6, quarter: 1, type: 'recovery', title: 'Recovery Begins', description: 'Markets bounce back as stimulus takes effect' },
  { year: 8, quarter: 4, type: 'bull', title: 'New All-Time Highs', description: 'Markets reach record levels on strong earnings' },
  { year: 10, quarter: 2, type: 'inflation', title: 'Inflation Spike', description: 'Rising prices pressure central banks' },
  { year: 12, quarter: 3, type: 'crash', title: 'Credit Crisis', description: 'Banking concerns trigger sell-off' },
  { year: 13, quarter: 2, type: 'recovery', title: 'Markets Stabilize', description: 'Government intervention calms fears' },
  { year: 15, quarter: 1, type: 'bull', title: 'Innovation Boom', description: 'Breakthrough technologies drive growth' },
  { year: 18, quarter: 3, type: 'sideways', title: 'Election Uncertainty', description: 'Markets await policy clarity' },
  { year: 20, quarter: 1, type: 'crash', title: 'Pandemic Shock', description: 'Global health crisis rocks markets' },
  { year: 21, quarter: 1, type: 'recovery', title: 'V-Shaped Recovery', description: 'Fastest recovery in history' },
  { year: 25, quarter: 2, type: 'bull', title: 'Roaring Twenties 2.0', description: 'Post-pandemic boom continues' },
  { year: 28, quarter: 4, type: 'inflation', title: 'Stagflation Concerns', description: 'Growth slows as prices rise' },
  { year: 30, quarter: 2, type: 'sideways', title: 'Mature Markets', description: 'Steady growth, lower volatility' },
  { year: 35, quarter: 1, type: 'crash', title: 'Geopolitical Crisis', description: 'International tensions impact markets' },
  { year: 36, quarter: 3, type: 'recovery', title: 'Peace Dividend', description: 'Resolution brings market relief' },
  { year: 40, quarter: 1, type: 'bull', title: 'Generational Wealth Transfer', description: 'Millennials drive market growth' },
  { year: 45, quarter: 2, type: 'sideways', title: 'Demographic Shift', description: 'Aging population changes market dynamics' },
  { year: 50, quarter: 1, type: 'bull', title: 'Long-Term Triumph', description: 'Patient investors reap rewards' },
];

function generateEventImpact(type: EventType): Record<AssetClass, number> {
  const impacts: Record<EventType, Record<AssetClass, number>> = {
    bull: { 'global-equity': 0.20, 'swiss-equity': 0.18, 'bonds': 0.02, 'gold': -0.05, 'cash': 0.01, 'bitcoin': 0.40, 'tech-growth': 0.30 },
    crash: { 'global-equity': -0.30, 'swiss-equity': -0.25, 'bonds': 0.05, 'gold': 0.15, 'cash': 0.01, 'bitcoin': -0.50, 'tech-growth': -0.40 },
    recovery: { 'global-equity': 0.25, 'swiss-equity': 0.20, 'bonds': 0.02, 'gold': -0.05, 'cash': 0.01, 'bitcoin': 0.35, 'tech-growth': 0.30 },
    inflation: { 'global-equity': 0.02, 'swiss-equity': 0.03, 'bonds': -0.10, 'gold': 0.20, 'cash': -0.02, 'bitcoin': 0.10, 'tech-growth': -0.05 },
    sideways: { 'global-equity': 0.03, 'swiss-equity': 0.04, 'bonds': 0.03, 'gold': 0.02, 'cash': 0.01, 'bitcoin': 0.05, 'tech-growth': 0.02 },
    news: { 'global-equity': 0, 'swiss-equity': 0, 'bonds': 0, 'gold': 0, 'cash': 0, 'bitcoin': 0, 'tech-growth': 0 },
  };
  return impacts[type];
}

function generateMarketEvents(startYear: number, endYear: number): SimulationEvent[] {
  const duration = endYear - startYear;
  const events: SimulationEvent[] = [];

  for (const template of SCENARIO_TEMPLATES) {
    if (template.year <= duration) {
      events.push({
        id: `event-${template.year}-${template.quarter}`,
        year: startYear + template.year,
        quarter: template.quarter,
        type: template.type,
        title: template.title,
        description: template.description,
        impact: generateEventImpact(template.type),
      });
    }
  }

  return events;
}

export function initializeSimulation(
  initialBalance: number,
  monthlyContribution: number,
  duration: number,
  allocations: Allocation[]
): SimulationState {
  const startYear = new Date().getFullYear();
  const endYear = startYear + duration;

  const portfolio: Portfolio = {
    totalValue: initialBalance,
    monthlyContribution,
    allocations: allocations.map(a => ({
      ...a,
      value: initialBalance * (a.percentage / 100),
    })),
    history: [{
      year: startYear,
      quarter: 1,
      totalValue: initialBalance,
      allocations: allocations.map(a => ({
        ...a,
        value: initialBalance * (a.percentage / 100),
      })),
    }],
  };

  return {
    id: `sim-${Date.now()}`,
    currentYear: startYear,
    startYear,
    endYear,
    portfolio,
    events: generateMarketEvents(startYear, endYear),
    decisions: [],
    isRunning: false,
    speed: 'normal',
  };
}

export function processQuarter(
  state: SimulationState,
  currentQuarter: number
): { newState: SimulationState; event: SimulationEvent | null } {
  const { portfolio, currentYear, events } = state;

  const event = events.find(e => e.year === currentYear && e.quarter === currentQuarter) || null;
  const rawType = event?.type || 'normal';
  const eventType = rawType === 'news' ? 'normal' as const : rawType;

  const newAllocations: Allocation[] = portfolio.allocations.map(allocation => {
    const quarterlyReturn = simulateMarketReturns(allocation.assetClass, eventType) / 4;
    return { ...allocation, value: allocation.value * (1 + quarterlyReturn) };
  });

  const quarterlyContribution = portfolio.monthlyContribution * 3;
  newAllocations.forEach(allocation => {
    allocation.value += quarterlyContribution * (allocation.percentage / 100);
  });

  const newTotalValue = newAllocations.reduce((sum, a) => sum + a.value, 0);
  newAllocations.forEach(allocation => {
    allocation.percentage = (allocation.value / newTotalValue) * 100;
  });

  const snapshot: PortfolioSnapshot = {
    year: currentYear,
    quarter: currentQuarter,
    totalValue: newTotalValue,
    allocations: [...newAllocations],
  };

  const newPortfolio: Portfolio = {
    ...portfolio,
    totalValue: newTotalValue,
    allocations: newAllocations,
    history: [...portfolio.history, snapshot],
  };

  let newYear = currentYear;
  if (currentQuarter + 1 > 4) {
    newYear = currentYear + 1;
  }

  return {
    newState: { ...state, currentYear: newYear, portfolio: newPortfolio },
    event,
  };
}

export function applyDecision(
  state: SimulationState,
  decisionType: Decision['type']
): SimulationState {
  const { portfolio, currentYear, decisions } = state;
  const currentQuarter = portfolio.history[portfolio.history.length - 1]?.quarter || 1;

  let newAllocations = [...portfolio.allocations];
  let description = '';
  let wasGood: boolean | null = null;

  const recentEvent = state.events.find(e => e.year === currentYear || e.year === currentYear - 1);
  const isInCrash = recentEvent?.type === 'crash';
  const isInRecovery = recentEvent?.type === 'recovery';

  switch (decisionType) {
    case 'rebalance': {
      const total = portfolio.totalValue;
      const originalPercentages = state.portfolio.allocations.map(a => a.percentage);
      newAllocations = newAllocations.map((a, i) => ({
        ...a,
        percentage: originalPercentages[i],
        value: total * (originalPercentages[i] / 100),
      }));
      description = 'Rebalanced portfolio to target allocation';
      wasGood = true;
      break;
    }

    case 'increase-contribution': {
      const newContribution = portfolio.monthlyContribution * 1.25;
      description = `Increased monthly contribution to €${Math.round(newContribution)}`;
      wasGood = true;
      return {
        ...state,
        portfolio: { ...portfolio, monthlyContribution: newContribution },
        decisions: [...decisions, { year: currentYear, quarter: currentQuarter, type: decisionType, description, wasGood }],
      };
    }

    case 'sell': {
      const riskyAssets: AssetClass[] = ['global-equity', 'swiss-equity', 'bitcoin', 'tech-growth'];
      let soldAmount = 0;
      newAllocations = newAllocations.map(a => {
        if (riskyAssets.includes(a.assetClass)) {
          const sellValue = a.value * 0.2;
          soldAmount += sellValue;
          return { ...a, value: a.value - sellValue };
        }
        return a;
      });
      const cashIndex = newAllocations.findIndex(a => a.assetClass === 'cash');
      if (cashIndex >= 0) newAllocations[cashIndex].value += soldAmount;
      description = 'Sold 20% of equity positions';
      wasGood = isInCrash ? false : null;
      break;
    }

    case 'buy-dip': {
      const safeAssets: AssetClass[] = ['cash', 'bonds'];
      let movedAmount = 0;
      newAllocations = newAllocations.map(a => {
        if (safeAssets.includes(a.assetClass)) {
          const moveValue = a.value * 0.3;
          movedAmount += moveValue;
          return { ...a, value: a.value - moveValue };
        }
        return a;
      });
      const equityIndex = newAllocations.findIndex(a => a.assetClass === 'global-equity');
      if (equityIndex >= 0) newAllocations[equityIndex].value += movedAmount;
      description = 'Bought the dip — moved cash to equities';
      wasGood = isInCrash || isInRecovery ? true : null;
      break;
    }

    case 'hold':
      description = 'Held current positions';
      wasGood = isInCrash ? true : null;
      break;
  }

  const newTotal = newAllocations.reduce((sum, a) => sum + a.value, 0);
  newAllocations = newAllocations.map(a => ({
    ...a,
    percentage: (a.value / newTotal) * 100,
  }));

  return {
    ...state,
    portfolio: { ...portfolio, allocations: newAllocations, totalValue: newTotal },
    decisions: [...decisions, { year: currentYear, quarter: currentQuarter, type: decisionType, description, wasGood }],
  };
}

export const ALLOCATION_PRESETS: Record<string, Allocation[]> = {
  conservative: [
    { assetClass: 'global-equity', percentage: 20, value: 0 },
    { assetClass: 'swiss-equity', percentage: 10, value: 0 },
    { assetClass: 'bonds', percentage: 40, value: 0 },
    { assetClass: 'gold', percentage: 15, value: 0 },
    { assetClass: 'cash', percentage: 15, value: 0 },
  ],
  balanced: [
    { assetClass: 'global-equity', percentage: 40, value: 0 },
    { assetClass: 'swiss-equity', percentage: 15, value: 0 },
    { assetClass: 'bonds', percentage: 25, value: 0 },
    { assetClass: 'gold', percentage: 10, value: 0 },
    { assetClass: 'cash', percentage: 10, value: 0 },
  ],
  aggressive: [
    { assetClass: 'global-equity', percentage: 45, value: 0 },
    { assetClass: 'swiss-equity', percentage: 15, value: 0 },
    { assetClass: 'bonds', percentage: 10, value: 0 },
    { assetClass: 'gold', percentage: 5, value: 0 },
    { assetClass: 'tech-growth', percentage: 20, value: 0 },
    { assetClass: 'bitcoin', percentage: 5, value: 0 },
  ],
};
