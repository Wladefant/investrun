/** Core simulation engine — time acceleration, portfolio calculation, event triggers */

import type { DailyPrice } from "./market-data";

export interface Allocation {
  swiss_stocks: number;
  us_stocks: number;
  eu_stocks: number;
  bonds: number;
  gold: number;
  cash: number;
}

export interface MarketEvent {
  date: string;
  title: string;
  description: string;
  severity: "info" | "major" | "critical";
  lesson: string;
  mentorLine?: string;
  storyBeat: boolean;
  beatLine?: string;
}

export interface SimulationTick {
  index: number;
  date: string;
  year: number;
  portfolioValue: number;
  portfolioReturn: number; // % from start
  benchmarkValue: number; // SMI
  benchmarkReturn: number;
  allocation: Allocation;
  event?: MarketEvent;
  storyBeat?: { line: string };
  isDecisionPoint: boolean; // pause for player input
}

export interface PlayerAction {
  tickIndex: number;
  type: "hold" | "rebalance" | "panic_sell" | "buy_more";
  newAllocation?: Allocation;
}

export const DEFAULT_ALLOCATIONS: Record<string, Allocation> = {
  cautious: {
    swiss_stocks: 10,
    us_stocks: 10,
    eu_stocks: 5,
    bonds: 40,
    gold: 20,
    cash: 15,
  },
  balanced: {
    swiss_stocks: 20,
    us_stocks: 20,
    eu_stocks: 10,
    bonds: 25,
    gold: 15,
    cash: 10,
  },
  growth: {
    swiss_stocks: 25,
    us_stocks: 30,
    eu_stocks: 15,
    bonds: 15,
    gold: 10,
    cash: 5,
  },
};

/**
 * Pre-compute all simulation ticks from market data.
 * Returns an array of ticks ready to be played through.
 */
export function buildSimulation(
  weeklyData: DailyPrice[],
  events: MarketEvent[],
  initialAllocation: Allocation,
  startingCapital: number = 100_000
): SimulationTick[] {
  const ticks: SimulationTick[] = [];
  const startPrices = weeklyData[0].values;
  const benchmarkStart = startPrices.swiss_stocks;
  let currentAllocation = { ...initialAllocation };

  // Normalize allocation to fractions
  const totalAlloc = Object.values(currentAllocation).reduce((a, b) => a + b, 0);
  const allocFractions: Record<string, number> = {};
  for (const [key, val] of Object.entries(currentAllocation)) {
    allocFractions[key] = val / totalAlloc;
  }

  // Track units of each asset held
  const units: Record<string, number> = {};
  for (const [assetId, fraction] of Object.entries(allocFractions)) {
    const investedAmount = startingCapital * fraction;
    const price = startPrices[assetId] ?? 100;
    units[assetId] = investedAmount / price;
  }

  // Build event lookup by date (approximate matching: find nearest date)
  const eventMap = new Map<string, MarketEvent>();
  for (const event of events) {
    eventMap.set(event.date, event);
  }

  for (let i = 0; i < weeklyData.length; i++) {
    const dataPoint = weeklyData[i];
    const year = parseInt(dataPoint.date.substring(0, 4));

    // Calculate portfolio value
    let portfolioValue = 0;
    for (const [assetId, unitCount] of Object.entries(units)) {
      const price = dataPoint.values[assetId] ?? 100;
      portfolioValue += unitCount * price;
    }

    const portfolioReturn =
      ((portfolioValue - startingCapital) / startingCapital) * 100;
    const benchmarkValue = dataPoint.values.swiss_stocks ?? benchmarkStart;
    const benchmarkReturn =
      ((benchmarkValue - benchmarkStart) / benchmarkStart) * 100;

    // Check for events (match by finding events within ±14 days)
    const matchedEvent = findNearestEvent(dataPoint.date, eventMap);

    const isDecisionPoint = matchedEvent
      ? !matchedEvent.storyBeat && matchedEvent.severity !== "info"
      : false;

    const tick: SimulationTick = {
      index: i,
      date: dataPoint.date,
      year,
      portfolioValue: Math.round(portfolioValue),
      portfolioReturn: Math.round(portfolioReturn * 10) / 10,
      benchmarkValue: Math.round(benchmarkValue),
      benchmarkReturn: Math.round(benchmarkReturn * 10) / 10,
      allocation: { ...currentAllocation },
      event: matchedEvent && !matchedEvent.storyBeat ? matchedEvent : undefined,
      storyBeat:
        matchedEvent?.storyBeat && matchedEvent.beatLine
          ? { line: matchedEvent.beatLine }
          : undefined,
      isDecisionPoint,
    };

    ticks.push(tick);

    // Remove matched event so it doesn't trigger again
    if (matchedEvent) {
      eventMap.delete(matchedEvent.date);
    }
  }

  return ticks;
}

/**
 * Apply a player action to the simulation: rebalance the portfolio.
 */
export function applyRebalance(
  ticks: SimulationTick[],
  fromTickIndex: number,
  newAllocation: Allocation,
  weeklyData: DailyPrice[]
): SimulationTick[] {
  const result = [...ticks];
  const currentTick = ticks[fromTickIndex];
  const currentValue = currentTick.portfolioValue;

  // Normalize allocation
  const totalAlloc = Object.values(newAllocation).reduce((a, b) => a + b, 0);

  // Calculate new units based on current value
  const units: Record<string, number> = {};
  for (const [assetId, alloc] of Object.entries(newAllocation)) {
    const fraction = alloc / totalAlloc;
    const investedAmount = currentValue * fraction;
    const price = weeklyData[fromTickIndex].values[assetId] ?? 100;
    units[assetId] = investedAmount / price;
  }

  const startingCapital = ticks[0].portfolioValue;
  const benchmarkStart = weeklyData[0].values.swiss_stocks;

  // Recalculate all subsequent ticks
  for (let i = fromTickIndex; i < result.length; i++) {
    const dataPoint = weeklyData[i];
    let portfolioValue = 0;
    for (const [assetId, unitCount] of Object.entries(units)) {
      const price = dataPoint.values[assetId] ?? 100;
      portfolioValue += unitCount * price;
    }

    const portfolioReturn =
      ((portfolioValue - startingCapital) / startingCapital) * 100;
    const benchmarkValue = dataPoint.values.swiss_stocks ?? benchmarkStart;
    const benchmarkReturn =
      ((benchmarkValue - benchmarkStart) / benchmarkStart) * 100;

    result[i] = {
      ...result[i],
      portfolioValue: Math.round(portfolioValue),
      portfolioReturn: Math.round(portfolioReturn * 10) / 10,
      benchmarkValue: Math.round(benchmarkValue),
      benchmarkReturn: Math.round(benchmarkReturn * 10) / 10,
      allocation: { ...newAllocation },
    };
  }

  return result;
}

function findNearestEvent(
  date: string,
  eventMap: Map<string, MarketEvent>
): MarketEvent | undefined {
  // Exact match first
  if (eventMap.has(date)) return eventMap.get(date);

  // Check within ±14 days
  const dateMs = new Date(date).getTime();
  for (const [eventDate, event] of eventMap.entries()) {
    const eventMs = new Date(eventDate).getTime();
    if (Math.abs(dateMs - eventMs) < 14 * 24 * 60 * 60 * 1000) {
      return event;
    }
  }

  return undefined;
}
