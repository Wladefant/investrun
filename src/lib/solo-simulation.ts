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
import { simulateMarketReturns, type MarketCondition } from './solo-calculations';

export const TURNS_PER_GAME = 5;

interface EventTemplate {
  type: EventType;
  title: string;
  description: string;
  options: EventOption[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ═══════════════════════════════════════════
// DECISION EVENT POOL — 29 unique events
// ═══════════════════════════════════════════

const DECISION_EVENT_POOL: EventTemplate[] = [
  // ── BULL ──
  {
    type: 'bull', title: 'Tech Rally',
    description: 'Technology stocks surge on AI optimism.',
    options: [
      { label: 'Double Down on Tech', description: '+15% Tech Stocks, −15% Cash', effect: { 'tech-stocks': 15, cash: -15 }, sentiment: 'neutral' },
      { label: 'Take Profits', description: 'Sell 10% Tech, buy Bonds', effect: { 'tech-stocks': -10, bonds: 10 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Crypto Bull Run',
    description: 'Institutional investors pour billions into digital assets. Bitcoin hits new highs.',
    options: [
      { label: 'FOMO In', description: '+20% Crypto, −20% Bonds', effect: { cryptocurrency: 20, bonds: -20 }, sentiment: 'neutral', requiresAsset: 'cryptocurrency' },
      { label: 'Small Position', description: '+10% Crypto, −10% Cash', effect: { cryptocurrency: 10, cash: -10 }, sentiment: 'good', requiresAsset: 'cryptocurrency' },
      { label: 'Stay Traditional', description: 'Ignore the hype', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Real Estate Boom',
    description: 'Low interest rates fuel a property market surge. REITs outperform.',
    options: [
      { label: 'Load Up on Property', description: '+15% Real Estate, −10% Bonds, −5% Cash', effect: { 'real-estate': 15, bonds: -10, cash: -5 }, sentiment: 'neutral', requiresAsset: 'real-estate' },
      { label: 'Modest Exposure', description: '+10% Real Estate, −10% Cash', effect: { 'real-estate': 10, cash: -10 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Stick with Stocks', description: '+5% Blue Chip, −5% Cash', effect: { 'blue-chip': 5, cash: -5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'New All-Time Highs',
    description: 'Markets reach record levels on strong earnings.',
    options: [
      { label: 'Go All In', description: '+10% Blue Chip, +5% Tech, −15% Bonds', effect: { 'blue-chip': 10, 'tech-stocks': 5, bonds: -15 }, sentiment: 'bad' },
      { label: 'Lock In Gains', description: '−10% Tech → +5% Gold, +5% Cash', effect: { 'tech-stocks': -10, gold: 5, cash: 5 }, sentiment: 'good' },
      { label: 'Stay the Course', description: 'Keep current allocation', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Innovation Boom',
    description: 'Breakthrough technologies drive global growth.',
    options: [
      { label: 'Bet on Innovation', description: '+15% Tech, −10% Bonds, −5% Gold', effect: { 'tech-stocks': 15, bonds: -10, gold: -5 }, sentiment: 'neutral' },
      { label: 'Balanced Growth', description: '+5% Blue Chip, +5% Emerging, −10% Cash', effect: { 'blue-chip': 5, 'emerging-markets': 5, cash: -10 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Do nothing', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'DeFi Revolution',
    description: 'Decentralised finance disrupts traditional banking. Crypto adoption explodes.',
    options: [
      { label: 'DeFi Maximalist', description: '+20% Crypto, −10% Bonds, −10% Cash', effect: { cryptocurrency: 20, bonds: -10, cash: -10 }, sentiment: 'neutral', requiresAsset: 'cryptocurrency' },
      { label: 'Diversified Bet', description: '+10% Crypto, +5% Tech, −15% Bonds', effect: { cryptocurrency: 10, 'tech-stocks': 5, bonds: -15 }, sentiment: 'good', requiresAsset: 'cryptocurrency' },
      { label: 'Tech Proxy', description: '+10% Tech, −10% Bonds', effect: { 'tech-stocks': 10, bonds: -10 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Roaring Twenties 2.0',
    description: 'Post-pandemic boom continues with global expansion.',
    options: [
      { label: 'Ride the Boom', description: '+10% Emerging Markets, −10% Bonds', effect: { 'emerging-markets': 10, bonds: -10 }, sentiment: 'neutral' },
      { label: 'Diversify Gains', description: '−5% Tech, −5% Blue Chip → +5% Gold, +5% Cash', effect: { 'tech-stocks': -5, 'blue-chip': -5, gold: 5, cash: 5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Keep riding the wave', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Generational Wealth Transfer',
    description: 'Millennials drive market growth to new heights.',
    options: [
      { label: 'Follow the Trend', description: '+10% Blue Chip, −10% Gold', effect: { 'blue-chip': 10, gold: -10 }, sentiment: 'neutral' },
      { label: 'Secure Your Wealth', description: '−10% Tech → +5% Bonds, +5% Cash', effect: { 'tech-stocks': -10, bonds: 5, cash: 5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Long-Term Triumph',
    description: 'Patient investors reap the rewards of compounding.',
    options: [
      { label: 'Final Push', description: '+10% Tech, −10% Bonds', effect: { 'tech-stocks': 10, bonds: -10 }, sentiment: 'neutral' },
      { label: 'Protect the Win', description: '−10% Emerging → +5% Bonds, +5% Gold', effect: { 'emerging-markets': -10, bonds: 5, gold: 5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Let compounding finish the job', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'bull', title: 'Green Energy Revolution',
    description: 'Climate policy drives massive investment in clean technology and emerging economies.',
    options: [
      { label: 'Go Green', description: '+10% Emerging, +5% Tech, −10% Gold, −5% Cash', effect: { 'emerging-markets': 10, 'tech-stocks': 5, gold: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Take Profits', description: '−5% Tech, −5% Emerging → +5% Bonds, +5% Cash', effect: { 'tech-stocks': -5, 'emerging-markets': -5, bonds: 5, cash: 5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Stay the course', effect: null, sentiment: 'neutral' },
    ],
  },

  // ── CRASH ──
  {
    type: 'crash', title: 'Global Recession Fears',
    description: 'Markets drop 25% on economic uncertainty. Panic is spreading.',
    options: [
      { label: 'Buy the Dip', description: '+15% Blue Chip, −15% Cash', effect: { 'blue-chip': 15, cash: -15 }, sentiment: 'good' },
      { label: 'Go Aggressive', description: '+25% Tech, +15% Emerging, −25% Bonds, −15% Cash', effect: { 'tech-stocks': 25, 'emerging-markets': 15, bonds: -25, cash: -15 }, sentiment: 'bad' },
      { label: 'Panic Sell', description: 'Dump equities → all Cash', effect: { 'tech-stocks': -30, 'blue-chip': -30, 'emerging-markets': -20, cash: 80 }, sentiment: 'bad' },
      { label: 'Hold and Wait', description: 'Trust the long-term plan', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Crypto Winter',
    description: 'Regulators crack down on crypto. Exchanges fail, prices collapse 70%.',
    options: [
      { label: 'Buy Crypto Cheap', description: '+15% Crypto, −15% Cash', effect: { cryptocurrency: 15, cash: -15 }, sentiment: 'good', requiresAsset: 'cryptocurrency' },
      { label: 'Dump Crypto', description: '−15% Crypto → +10% Bonds, +5% Gold', effect: { cryptocurrency: -15, bonds: 10, gold: 5 }, sentiment: 'bad', requiresAsset: 'cryptocurrency' },
      { label: 'Buy Blue Chips', description: '+10% Blue Chip, −10% Cash', effect: { 'blue-chip': 10, cash: -10 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Ride out the storm', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Credit Crisis',
    description: 'Banking concerns trigger a severe sell-off across sectors.',
    options: [
      { label: 'Bargain Hunt', description: '+10% Blue Chip, +5% Tech, −15% Cash', effect: { 'blue-chip': 10, 'tech-stocks': 5, cash: -15 }, sentiment: 'good' },
      { label: 'Double Down', description: '+20% Tech, −10% Bonds, −10% Gold', effect: { 'tech-stocks': 20, bonds: -10, gold: -10 }, sentiment: 'bad' },
      { label: 'Raise Cash', description: '−10% Blue Chip, −5% Emerging → +15% Cash', effect: { 'blue-chip': -10, 'emerging-markets': -5, cash: 15 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Ride out the storm', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Housing Bubble Bursts',
    description: 'Interest rates skyrocket, causing property values to plummet 30%.',
    options: [
      { label: 'Buy Cheap Property', description: '+15% Real Estate, −15% Cash', effect: { 'real-estate': 15, cash: -15 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Liquidate Properties', description: '−15% Real Estate → +10% Cash, +5% Gold', effect: { 'real-estate': -15, cash: 10, gold: 5 }, sentiment: 'bad', requiresAsset: 'real-estate' },
      { label: 'Buy Stocks Instead', description: '+10% Blue Chip, −10% Cash', effect: { 'blue-chip': 10, cash: -10 }, sentiment: 'good' },
      { label: 'Hold the Line', description: 'Accept the temporary loss', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Pandemic Shock',
    description: 'Global health crisis rocks markets. Historic single-day drops.',
    options: [
      { label: 'Buy Tech on Sale', description: '+15% Tech, −10% Cash, −5% Gold', effect: { 'tech-stocks': 15, cash: -10, gold: -5 }, sentiment: 'good' },
      { label: 'Go Defensive', description: '−10% Tech, −5% Emerging → +10% Gold, +5% Cash', effect: { 'tech-stocks': -10, 'emerging-markets': -5, gold: 10, cash: 5 }, sentiment: 'bad' },
      { label: 'Sell Everything', description: 'Move all risk assets to Cash', effect: { 'tech-stocks': -25, 'blue-chip': -25, 'emerging-markets': -15, cash: 65 }, sentiment: 'bad' },
      { label: 'Hold Steady', description: 'Don\'t make emotional decisions', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Geopolitical Crisis',
    description: 'International tensions cause a sharp market correction.',
    options: [
      { label: 'Opportunistic Buy', description: '+10% Emerging Markets, −10% Cash', effect: { 'emerging-markets': 10, cash: -10 }, sentiment: 'good' },
      { label: 'Shelter in Gold', description: '−10% Blue Chip → +10% Gold', effect: { 'blue-chip': -10, gold: 10 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Stay disciplined', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Oil Price Shock',
    description: 'OPEC slashes production. Energy costs spike, squeezing corporate profits.',
    options: [
      { label: 'Energy Hedge', description: '+10% Gold, +5% Emerging, −10% Tech, −5% Cash', effect: { gold: 10, 'emerging-markets': 5, 'tech-stocks': -10, cash: -5 }, sentiment: 'good' },
      { label: 'Buy the Dip', description: '+10% Blue Chip, −10% Cash', effect: { 'blue-chip': 10, cash: -10 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Wait for prices to normalize', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'crash', title: 'Tech Antitrust Crackdown',
    description: 'Governments move to break up big tech. Tech plunges while traditional sectors hold steady.',
    options: [
      { label: 'Rotate to Value', description: '−15% Tech → +10% Blue Chip, +5% Bonds', effect: { 'tech-stocks': -15, 'blue-chip': 10, bonds: 5 }, sentiment: 'good' },
      { label: 'Buy Cheap Tech', description: '+10% Tech, −10% Cash', effect: { 'tech-stocks': 10, cash: -10 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Tech will adapt', effect: null, sentiment: 'good' },
    ],
  },
  {
    type: 'crash', title: 'Emerging Markets Contagion',
    description: 'Currency crises spread across developing nations. Capital flees to safe havens.',
    options: [
      { label: 'Buy the Panic', description: '+10% Emerging, −10% Gold', effect: { 'emerging-markets': 10, gold: -10 }, sentiment: 'good' },
      { label: 'Flee to Safety', description: '−10% Emerging → +5% Gold, +5% Bonds', effect: { 'emerging-markets': -10, gold: 5, bonds: 5 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Diversification should protect you', effect: null, sentiment: 'good' },
    ],
  },

  // ── RECOVERY ──
  {
    type: 'recovery', title: 'Recovery Begins',
    description: 'Markets bounce back as fiscal stimulus takes effect.',
    options: [
      { label: 'Increase Equity', description: '+10% Blue Chip, +5% Emerging, −10% Bonds, −5% Cash', effect: { 'blue-chip': 10, 'emerging-markets': 5, bonds: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Stay Cautious', description: '+5% Bonds, −5% Blue Chip', effect: { bonds: 5, 'blue-chip': -5 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Wait for confirmation', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'recovery', title: 'Markets Stabilize',
    description: 'Government intervention calms fears. Confidence returns.',
    options: [
      { label: 'Re-enter Stocks', description: '+10% Blue Chip, −5% Bonds, −5% Cash', effect: { 'blue-chip': 10, bonds: -5, cash: -5 }, sentiment: 'good' },
      { label: 'Hedge with Gold', description: '+5% Gold, −5% Emerging Markets', effect: { gold: 5, 'emerging-markets': -5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Keep current allocation', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'recovery', title: 'V-Shaped Recovery',
    description: 'Fastest recovery in history. Tech leads the rebound.',
    options: [
      { label: 'Load Up on Tech', description: '+10% Tech, −5% Bonds, −5% Cash', effect: { 'tech-stocks': 10, bonds: -5, cash: -5 }, sentiment: 'good' },
      { label: 'Gradual Re-entry', description: '+5% Blue Chip, −5% Cash', effect: { 'blue-chip': 5, cash: -5 }, sentiment: 'good' },
      { label: 'Hold Position', description: 'Recovery will continue on its own', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'recovery', title: 'Property Market Recovery',
    description: 'Interest rates drop, reviving the housing market. REIT values surge.',
    options: [
      { label: 'Buy the Rebound', description: '+15% Real Estate, −10% Bonds, −5% Cash', effect: { 'real-estate': 15, bonds: -10, cash: -5 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Diversify into Property', description: '+10% Real Estate, −10% Cash', effect: { 'real-estate': 10, cash: -10 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Stick with Equities', description: '+10% Blue Chip, −10% Cash', effect: { 'blue-chip': 10, cash: -10 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Let things settle', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'recovery', title: 'Peace Dividend',
    description: 'Resolution of tensions brings market relief and optimism.',
    options: [
      { label: 'Global Exposure', description: '+10% Emerging Markets, −10% Gold', effect: { 'emerging-markets': 10, gold: -10 }, sentiment: 'good' },
      { label: 'Take It Slow', description: '+5% Blue Chip, −5% Cash', effect: { 'blue-chip': 5, cash: -5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Let markets find their level', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'recovery', title: 'Central Bank Cuts Rates',
    description: 'Surprise rate cuts flood markets with liquidity. Stocks and Real Estate surge.',
    options: [
      { label: 'Risk On', description: '+10% Tech, +5% Emerging, −10% Bonds, −5% Cash', effect: { 'tech-stocks': 10, 'emerging-markets': 5, bonds: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Property Play', description: '+15% Real Estate, −10% Bonds, −5% Cash', effect: { 'real-estate': 15, bonds: -10, cash: -5 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Stay in Bonds', description: '+5% Bonds, −5% Cash', effect: { bonds: 5, cash: -5 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Let the market react first', effect: null, sentiment: 'neutral' },
    ],
  },

  // ── INFLATION ──
  {
    type: 'inflation', title: 'Inflation Spike',
    description: 'Rising prices pressure central banks to act aggressively.',
    options: [
      { label: 'Hedge with Gold', description: '+10% Gold, −10% Bonds', effect: { gold: 10, bonds: -10 }, sentiment: 'good' },
      { label: 'Real Assets Play', description: '+10% Real Estate, −10% Bonds', effect: { 'real-estate': 10, bonds: -10 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Move to Cash', description: '+10% Cash, −10% Blue Chip', effect: { cash: 10, 'blue-chip': -10 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Inflation may be temporary', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'inflation', title: 'Stagflation Concerns',
    description: 'Growth slows as prices rise — a toxic combination for markets.',
    options: [
      { label: 'Real Assets', description: '+10% Gold, +5% Emerging, −10% Bonds, −5% Cash', effect: { gold: 10, 'emerging-markets': 5, bonds: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Crypto Hedge', description: '+10% Crypto, −5% Bonds, −5% Cash', effect: { cryptocurrency: 10, bonds: -5, cash: -5 }, sentiment: 'neutral', requiresAsset: 'cryptocurrency' },
      { label: 'Safety First', description: '+10% Cash, −5% Tech, −5% Emerging', effect: { cash: 10, 'tech-stocks': -5, 'emerging-markets': -5 }, sentiment: 'bad' },
      { label: 'Hold Position', description: 'Stay balanced through the cycle', effect: null, sentiment: 'neutral' },
    ],
  },
  {
    type: 'inflation', title: 'Hyperinflation Scare',
    description: 'Currency loses 20% purchasing power. Hard assets surge as paper wealth evaporates.',
    options: [
      { label: 'Hard Assets', description: '+10% Gold, +5% Real Estate, −15% Cash', effect: { gold: 10, 'real-estate': 5, cash: -15 }, sentiment: 'good', requiresAsset: 'real-estate' },
      { label: 'Gold Rush', description: '+15% Gold, −10% Bonds, −5% Cash', effect: { gold: 15, bonds: -10, cash: -5 }, sentiment: 'good' },
      { label: 'Crypto Store of Value', description: '+10% Crypto, −10% Cash', effect: { cryptocurrency: 10, cash: -10 }, sentiment: 'neutral', requiresAsset: 'cryptocurrency' },
      { label: 'Hold Position', description: 'Hope it passes quickly', effect: null, sentiment: 'bad' },
    ],
  },
  {
    type: 'inflation', title: 'Yield Curve Inversion',
    description: 'Bond markets signal recession ahead. Uncertainty grips every asset class.',
    options: [
      { label: 'Defensive Pivot', description: '+10% Gold, +5% Cash, −10% Tech, −5% Emerging', effect: { gold: 10, cash: 5, 'tech-stocks': -10, 'emerging-markets': -5 }, sentiment: 'good' },
      { label: 'Contrarian Bet', description: '+10% Blue Chip, −5% Bonds, −5% Cash', effect: { 'blue-chip': 10, bonds: -5, cash: -5 }, sentiment: 'neutral' },
      { label: 'Hold Position', description: 'Markets often rally after inversion', effect: null, sentiment: 'neutral' },
    ],
  },
];

const SIDEWAYS_POOL = [
  { title: 'Market Consolidation', description: 'Markets take a breather after strong gains' },
  { title: 'Election Uncertainty', description: 'Markets await policy clarity' },
  { title: 'Mature Markets', description: 'Steady growth, lower volatility' },
  { title: 'Demographic Shift', description: 'Aging population changes market dynamics' },
  { title: 'Trade Deal Signed', description: 'New international agreements stabilize markets' },
  { title: 'Regulatory Changes', description: 'New financial regulations reshape the landscape' },
];

function generateEventImpact(type: EventType): Record<AssetClass, number> {
  const impacts: Record<EventType, Record<AssetClass, number>> = {
    bull:      { 'tech-stocks': 0.35, 'blue-chip': 0.20, 'emerging-markets': 0.30, 'bonds': 0.02, 'gold': -0.05, 'cash': 0.01, 'cryptocurrency': 0.50, 'real-estate': 0.15 },
    crash:     { 'tech-stocks': -0.50, 'blue-chip': -0.30, 'emerging-markets': -0.45, 'bonds': 0.05, 'gold': 0.18, 'cash': 0.01, 'cryptocurrency': -0.65, 'real-estate': -0.25 },
    recovery:  { 'tech-stocks': 0.35, 'blue-chip': 0.22, 'emerging-markets': 0.28, 'bonds': 0.02, 'gold': -0.05, 'cash': 0.01, 'cryptocurrency': 0.40, 'real-estate': 0.18 },
    inflation: { 'tech-stocks': -0.08, 'blue-chip': 0.02, 'emerging-markets': 0.05, 'bonds': -0.15, 'gold': 0.25, 'cash': -0.04, 'cryptocurrency': 0.10, 'real-estate': 0.15 },
    sideways:  { 'tech-stocks': 0.02, 'blue-chip': 0.04, 'emerging-markets': 0.03, 'bonds': 0.03, 'gold': 0.02, 'cash': 0.01, 'cryptocurrency': 0.03, 'real-estate': 0.04 },
    news:      { 'tech-stocks': 0, 'blue-chip': 0, 'emerging-markets': 0, 'bonds': 0, 'gold': 0, 'cash': 0, 'cryptocurrency': 0, 'real-estate': 0 },
  };
  return impacts[type];
}

function generateMarketEvents(startYear: number, endYear: number): SimulationEvent[] {
  const duration = endYear - startYear;
  const totalQuarters = duration * 4;
  const events: SimulationEvent[] = [];

  const shuffled = shuffleArray(DECISION_EVENT_POOL);
  const selected = shuffled.slice(0, TURNS_PER_GAME);

  const usableQuarters = (duration - 1) * 4;
  const interval = usableQuarters / TURNS_PER_GAME;

  for (let i = 0; i < selected.length; i++) {
    const template = selected[i];
    const quarterIndex = 4 + Math.round(interval * (i + 0.5));
    const year = startYear + Math.floor(quarterIndex / 4);
    const quarter = (quarterIndex % 4) + 1;

    events.push({
      id: `decision-${i}`,
      year,
      quarter,
      type: template.type,
      title: template.title,
      description: template.description,
      impact: generateEventImpact(template.type),
      options: template.options,
    });
  }

  const sidewaysCount = Math.min(4, Math.floor(duration / 8));
  const shuffledSideways = shuffleArray(SIDEWAYS_POOL);
  for (let i = 0; i < sidewaysCount; i++) {
    const sw = shuffledSideways[i % shuffledSideways.length];
    const qIdx = Math.round((totalQuarters / (sidewaysCount + 1)) * (i + 1));
    const year = startYear + Math.floor(qIdx / 4);
    const quarter = (qIdx % 4) + 1;

    if (!events.some(e => e.year === year && e.quarter === quarter)) {
      events.push({
        id: `sideways-${i}`,
        year,
        quarter,
        type: 'sideways',
        title: sw.title,
        description: sw.description,
        impact: generateEventImpact('sideways'),
        options: [],
      });
    }
  }

  return events.sort((a, b) => a.year - b.year || a.quarter - b.quarter);
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
  const { portfolio, currentYear, events, startYear } = state;

  const event = events.find(e => e.year === currentYear && e.quarter === currentQuarter) || null;

  let effectiveType: MarketCondition = 'normal';
  let dampened = false;

  if (event) {
    effectiveType = event.type === 'news' ? 'normal' : event.type;
  } else {
    const currentQIdx = (currentYear - startYear) * 4 + (currentQuarter - 1);
    let closestDiff = Infinity;
    for (const e of events) {
      const eQIdx = (e.year - startYear) * 4 + (e.quarter - 1);
      const diff = currentQIdx - eQIdx;
      if (diff > 0 && diff <= 3 && diff < closestDiff) {
        closestDiff = diff;
        effectiveType = e.type === 'news' ? 'normal' : e.type;
        dampened = true;
      }
    }
  }

  const newAllocations: Allocation[] = portfolio.allocations.map(allocation => {
    const quarterlyReturn = simulateMarketReturns(allocation.assetClass, effectiveType, dampened);
    const newValue = Math.max(0, allocation.value * (1 + quarterlyReturn));
    return { ...allocation, value: newValue };
  });

  const quarterlyContribution = portfolio.monthlyContribution * 3;
  newAllocations.forEach(allocation => {
    allocation.value += quarterlyContribution * (allocation.percentage / 100);
  });

  const newTotalValue = newAllocations.reduce((sum, a) => sum + a.value, 0);
  newAllocations.forEach(allocation => {
    allocation.percentage = newTotalValue > 0 ? (allocation.value / newTotalValue) * 100 : 0;
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

    const rawTotal = newAllocations.reduce((s, a) => s + a.percentage, 0);
    if (rawTotal > 0 && rawTotal !== 100) {
      const scale = 100 / rawTotal;
      newAllocations.forEach(a => { a.percentage = Math.round(a.percentage * scale * 10) / 10; });
      const rounded = newAllocations.reduce((s, a) => s + a.percentage, 0);
      if (rounded !== 100 && newAllocations.length > 0) {
        newAllocations[0].percentage += Math.round((100 - rounded) * 10) / 10;
      }
    }

    newAllocations = newAllocations.filter(a => a.percentage > 0);

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

export function filterOptionsForUnlocked(
  options: EventOption[],
  unlockedAssets: Set<AssetClass>
): EventOption[] {
  return options.filter(opt =>
    !opt.requiresAsset || unlockedAssets.has(opt.requiresAsset)
  );
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
