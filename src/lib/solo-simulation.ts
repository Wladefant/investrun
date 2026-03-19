import type {
  SimulationState,
  Portfolio,
  Allocation,
  SimulationEvent,
  AssetClass,
  EventType,
  EventOption,
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
  options?: EventOption[];
}

const SCENARIO_TEMPLATES: MarketScenarioTemplate[] = [
  // ── BULL EVENTS ──
  {
    year: 2, quarter: 1, type: 'bull',
    title: 'Tech Rally',
    description: 'Technology stocks surge on AI optimism.',
    options: [
      { label: 'Double Down on Tech', description: '+15% Tech Stocks, −15% Cash', effect: { 'tech-stocks': 15, cash: -15 }, sentiment: 'neutral' },
      { label: 'Take Profits', description: 'Sell 10% Tech, buy Bonds', effect: { 'tech-stocks': -10, bonds: 10 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 8, quarter: 4, type: 'bull',
    title: 'New All-Time Highs',
    description: 'Markets reach record levels on strong earnings.',
    options: [
      { label: 'Go All In', description: '+10% Blue Chip, +5% Tech, −15% Bonds', effect: { 'blue-chip': 10, 'tech-stocks': 5, bonds: -15 }, sentiment: 'bad' },
      { label: 'Lock In Gains', description: '−10% Tech → +5% Gold, +5% Cash', effect: { 'tech-stocks': -10, gold: 5, cash: 5 }, sentiment: 'good' },
      { label: 'Stay the Course', description: 'Keep current allocation', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 15, quarter: 1, type: 'bull',
    title: 'Innovation Boom',
    description: 'Breakthrough technologies drive global growth.',
    options: [
      { label: 'Bet on Innovation', description: '+15% Tech, −10% Bonds, −5% Gold', effect: { 'tech-stocks': 15, bonds: -10, gold: -5 }, sentiment: 'neutral' },
      { label: 'Balanced Growth', description: '+5% Blue Chip, +5% Emerging, −10% Cash', effect: { 'blue-chip': 5, 'emerging-markets': 5, cash: -10 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Do nothing', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 25, quarter: 2, type: 'bull',
    title: 'Roaring Twenties 2.0',
    description: 'Post-pandemic boom continues with global expansion.',
    options: [
      { label: 'Ride the Boom', description: '+10% Emerging Markets, −10% Bonds', effect: { 'emerging-markets': 10, bonds: -10 }, sentiment: 'neutral' },
      { label: 'Diversify Gains', description: '−5% Tech, −5% Blue Chip → +5% Gold, +5% Cash', effect: { 'tech-stocks': -5, 'blue-chip': -5, gold: 5, cash: 5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Keep riding the wave', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 40, quarter: 1, type: 'bull',
    title: 'Generational Wealth Transfer',
    description: 'Millennials drive market growth to new heights.',
    options: [
      { label: 'Follow the Trend', description: '+10% Blue Chip, −10% Gold', effect: { 'blue-chip': 10, gold: -10 }, sentiment: 'neutral' },
      { label: 'Secure Your Wealth', description: '−10% Tech → +5% Bonds, +5% Cash', effect: { 'tech-stocks': -10, bonds: 5, cash: 5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 50, quarter: 1, type: 'bull',
    title: 'Long-Term Triumph',
    description: 'Patient investors reap the rewards of compounding.',
    options: [
      { label: 'Final Push', description: '+10% Tech, −10% Bonds', effect: { 'tech-stocks': 10, bonds: -10 }, sentiment: 'neutral' },
      { label: 'Protect the Win', description: '−10% Emerging → +5% Bonds, +5% Gold', effect: { 'emerging-markets': -10, bonds: 5, gold: 5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Let compounding finish the job', effect: null, sentiment: 'neutral' },
    ],
  },

  // ── CRASH EVENTS ──
  {
    year: 5, quarter: 2, type: 'crash',
    title: 'Global Recession Fears',
    description: 'Markets drop 25% on economic uncertainty. Panic is spreading.',
    options: [
      { label: 'Buy the Dip', description: '+15% Blue Chip, −15% Cash', effect: { 'blue-chip': 15, cash: -15 }, sentiment: 'good' },
      { label: 'Flee to Safety', description: '−10% Tech, −5% Emerging → +10% Bonds, +5% Gold', effect: { 'tech-stocks': -10, 'emerging-markets': -5, bonds: 10, gold: 5 }, sentiment: 'bad' },
      { label: 'Hold and Wait', description: 'Trust the long-term plan', effect: null, sentiment: 'good' },
    ],
  },
  {
    year: 12, quarter: 3, type: 'crash',
    title: 'Credit Crisis',
    description: 'Banking concerns trigger a severe sell-off across sectors.',
    options: [
      { label: 'Bargain Hunt', description: '+10% Blue Chip, +5% Tech, −15% Cash', effect: { 'blue-chip': 10, 'tech-stocks': 5, cash: -15 }, sentiment: 'good' },
      { label: 'Raise Cash', description: '−10% Blue Chip, −5% Emerging → +15% Cash', effect: { 'blue-chip': -10, 'emerging-markets': -5, cash: 15 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Ride out the storm', effect: null, sentiment: 'good' },
    ],
  },
  {
    year: 20, quarter: 1, type: 'crash',
    title: 'Pandemic Shock',
    description: 'Global health crisis rocks markets. Historic single-day drops.',
    options: [
      { label: 'Buy Tech on Sale', description: '+15% Tech, −10% Cash, −5% Gold', effect: { 'tech-stocks': 15, cash: -10, gold: -5 }, sentiment: 'good' },
      { label: 'Go Defensive', description: '−10% Tech, −5% Emerging → +10% Gold, +5% Cash', effect: { 'tech-stocks': -10, 'emerging-markets': -5, gold: 10, cash: 5 }, sentiment: 'bad' },
      { label: 'Hold Steady', description: 'Don\'t make emotional decisions', effect: null, sentiment: 'good' },
    ],
  },
  {
    year: 35, quarter: 1, type: 'crash',
    title: 'Geopolitical Crisis',
    description: 'International tensions cause a sharp market correction.',
    options: [
      { label: 'Opportunistic Buy', description: '+10% Emerging Markets, −10% Cash', effect: { 'emerging-markets': 10, cash: -10 }, sentiment: 'good' },
      { label: 'Shelter in Gold', description: '−10% Blue Chip → +10% Gold', effect: { 'blue-chip': -10, gold: 10 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Stay disciplined', effect: null, sentiment: 'good' },
    ],
  },

  // ── RECOVERY EVENTS ──
  {
    year: 6, quarter: 1, type: 'recovery',
    title: 'Recovery Begins',
    description: 'Markets bounce back as fiscal stimulus takes effect.',
    options: [
      { label: 'Increase Equity', description: '+10% Blue Chip, +5% Emerging, −10% Bonds, −5% Cash', effect: { 'blue-chip': 10, 'emerging-markets': 5, bonds: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Stay Cautious', description: '+5% Bonds, −5% Blue Chip', effect: { bonds: 5, 'blue-chip': -5 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Wait for confirmation', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 13, quarter: 2, type: 'recovery',
    title: 'Markets Stabilize',
    description: 'Government intervention calms fears. Confidence returns.',
    options: [
      { label: 'Re-enter Stocks', description: '+10% Blue Chip, −5% Bonds, −5% Cash', effect: { 'blue-chip': 10, bonds: -5, cash: -5 }, sentiment: 'good' },
      { label: 'Hedge with Gold', description: '+5% Gold, −5% Emerging Markets', effect: { gold: 5, 'emerging-markets': -5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Keep current allocation', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 21, quarter: 1, type: 'recovery',
    title: 'V-Shaped Recovery',
    description: 'Fastest recovery in history. Tech leads the rebound.',
    options: [
      { label: 'Load Up on Tech', description: '+10% Tech, −5% Bonds, −5% Cash', effect: { 'tech-stocks': 10, bonds: -5, cash: -5 }, sentiment: 'good' },
      { label: 'Gradual Re-entry', description: '+5% Blue Chip, −5% Cash', effect: { 'blue-chip': 5, cash: -5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Recovery will continue on its own', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 36, quarter: 3, type: 'recovery',
    title: 'Peace Dividend',
    description: 'Resolution of tensions brings market relief and optimism.',
    options: [
      { label: 'Global Exposure', description: '+10% Emerging Markets, −10% Gold', effect: { 'emerging-markets': 10, gold: -10 }, sentiment: 'good' },
      { label: 'Take It Slow', description: '+5% Blue Chip, −5% Cash', effect: { 'blue-chip': 5, cash: -5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Let markets find their level', effect: null, sentiment: 'neutral' },
    ],
  },

  // ── INFLATION EVENTS ──
  {
    year: 10, quarter: 2, type: 'inflation',
    title: 'Inflation Spike',
    description: 'Rising prices pressure central banks to act aggressively.',
    options: [
      { label: 'Hedge with Gold', description: '+10% Gold, −10% Bonds', effect: { gold: 10, bonds: -10 }, sentiment: 'good' },
      { label: 'Move to Cash', description: '+10% Cash, −10% Blue Chip', effect: { cash: 10, 'blue-chip': -10 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Inflation may be temporary', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    year: 28, quarter: 4, type: 'inflation',
    title: 'Stagflation Concerns',
    description: 'Growth slows as prices rise — a toxic combination for markets.',
    options: [
      { label: 'Real Assets', description: '+10% Gold, +5% Emerging, −10% Bonds, −5% Cash', effect: { gold: 10, 'emerging-markets': 5, bonds: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Safety First', description: '+10% Cash, −5% Tech, −5% Emerging', effect: { cash: 10, 'tech-stocks': -5, 'emerging-markets': -5 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Stay balanced through the cycle', effect: null, sentiment: 'neutral' },
    ],
  },

  // ── SIDEWAYS EVENTS (no options — auto-play through) ──
  { year: 3, quarter: 3, type: 'sideways', title: 'Market Consolidation', description: 'Markets take a breather after strong gains' },
  { year: 18, quarter: 3, type: 'sideways', title: 'Election Uncertainty', description: 'Markets await policy clarity' },
  { year: 30, quarter: 2, type: 'sideways', title: 'Mature Markets', description: 'Steady growth, lower volatility' },
  { year: 45, quarter: 2, type: 'sideways', title: 'Demographic Shift', description: 'Aging population changes market dynamics' },
];

function generateEventImpact(type: EventType): Record<AssetClass, number> {
  const impacts: Record<EventType, Record<AssetClass, number>> = {
    bull:      { 'tech-stocks': 0.30, 'blue-chip': 0.18, 'emerging-markets': 0.25, 'bonds': 0.02, 'gold': -0.05, 'cash': 0.01 },
    crash:     { 'tech-stocks': -0.40, 'blue-chip': -0.25, 'emerging-markets': -0.35, 'bonds': 0.05, 'gold': 0.15, 'cash': 0.01 },
    recovery:  { 'tech-stocks': 0.30, 'blue-chip': 0.20, 'emerging-markets': 0.25, 'bonds': 0.02, 'gold': -0.05, 'cash': 0.01 },
    inflation: { 'tech-stocks': -0.05, 'blue-chip': 0.02, 'emerging-markets': 0.05, 'bonds': -0.10, 'gold': 0.20, 'cash': -0.02 },
    sideways:  { 'tech-stocks': 0.02, 'blue-chip': 0.04, 'emerging-markets': 0.03, 'bonds': 0.03, 'gold': 0.02, 'cash': 0.01 },
    news:      { 'tech-stocks': 0, 'blue-chip': 0, 'emerging-markets': 0, 'bonds': 0, 'gold': 0, 'cash': 0 },
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
        options: template.options || [],
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

/**
 * Apply a player's contextual event choice to the portfolio.
 * Shifts allocation percentages by the option's effect deltas,
 * then redistributes actual values to match.
 */
export function applyEventChoice(
  state: SimulationState,
  option: EventOption,
  event: SimulationEvent
): SimulationState {
  const { portfolio, currentYear, decisions } = state;
  const currentQuarter = portfolio.history[portfolio.history.length - 1]?.quarter || 1;

  let newAllocations = [...portfolio.allocations.map(a => ({ ...a }))];

  if (option.effect) {
    for (const [asset, delta] of Object.entries(option.effect)) {
      const idx = newAllocations.findIndex(a => a.assetClass === asset);
      if (idx >= 0) {
        newAllocations[idx].percentage = Math.max(0, newAllocations[idx].percentage + delta);
      } else if (delta > 0) {
        newAllocations.push({ assetClass: asset as AssetClass, percentage: delta, value: 0 });
      }
    }

    // Normalize percentages to sum to 100
    const rawTotal = newAllocations.reduce((s, a) => s + a.percentage, 0);
    if (rawTotal > 0 && rawTotal !== 100) {
      const scale = 100 / rawTotal;
      newAllocations.forEach(a => { a.percentage = Math.round(a.percentage * scale * 10) / 10; });
      // Fix rounding to exactly 100
      const rounded = newAllocations.reduce((s, a) => s + a.percentage, 0);
      if (rounded !== 100 && newAllocations.length > 0) {
        newAllocations[0].percentage += Math.round((100 - rounded) * 10) / 10;
      }
    }

    newAllocations = newAllocations.filter(a => a.percentage > 0);

    // Redistribute values to match new percentages
    const totalValue = portfolio.totalValue;
    newAllocations.forEach(a => { a.value = totalValue * (a.percentage / 100); });
  }

  const newTotal = newAllocations.reduce((sum, a) => sum + a.value, 0);

  const decision: Decision = {
    year: currentYear,
    quarter: currentQuarter,
    type: option.label,
    description: `${option.label} — ${option.description} (${event.title})`,
    wasGood: option.sentiment === 'good' ? true : option.sentiment === 'bad' ? false : null,
  };

  return {
    ...state,
    portfolio: { ...portfolio, allocations: newAllocations, totalValue: newTotal },
    decisions: [...decisions, decision],
  };
}

export const ALLOCATION_PRESETS: Record<string, Allocation[]> = {
  conservative: [
    { assetClass: 'blue-chip', percentage: 20, value: 0 },
    { assetClass: 'bonds', percentage: 40, value: 0 },
    { assetClass: 'gold', percentage: 20, value: 0 },
    { assetClass: 'cash', percentage: 20, value: 0 },
  ],
  balanced: [
    { assetClass: 'blue-chip', percentage: 30, value: 0 },
    { assetClass: 'tech-stocks', percentage: 10, value: 0 },
    { assetClass: 'emerging-markets', percentage: 10, value: 0 },
    { assetClass: 'bonds', percentage: 25, value: 0 },
    { assetClass: 'gold', percentage: 15, value: 0 },
    { assetClass: 'cash', percentage: 10, value: 0 },
  ],
  aggressive: [
    { assetClass: 'blue-chip', percentage: 25, value: 0 },
    { assetClass: 'tech-stocks', percentage: 25, value: 0 },
    { assetClass: 'emerging-markets', percentage: 20, value: 0 },
    { assetClass: 'bonds', percentage: 15, value: 0 },
    { assetClass: 'gold', percentage: 10, value: 0 },
    { assetClass: 'cash', percentage: 5, value: 0 },
  ],
};
