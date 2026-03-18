/** Behavioral scoring engine — rewards discipline over returns */

import type { Allocation, PlayerAction, SimulationTick } from "./simulation-engine";

export interface ScoreDimension {
  label: string;
  score: number; // 0-100
  stars: number; // 1-5
  explanation: string;
}

export interface ScoreResult {
  total: number; // 0-100
  dimensions: {
    diversification: ScoreDimension;
    emotionalDiscipline: ScoreDimension;
    longTermThinking: ScoreDimension;
    riskAppropriateness: ScoreDimension;
  };
  costOfPanicSelling: number; // CHF lost due to panic selling
}

/**
 * Calculate the behavioral score from simulation data and player actions.
 */
export function calculateScore(
  ticks: SimulationTick[],
  actions: PlayerAction[],
  riskProfile: "cautious" | "balanced" | "growth"
): ScoreResult {
  const diversification = scoreDiversification(ticks);
  const emotionalDiscipline = scoreEmotionalDiscipline(ticks, actions);
  const longTermThinking = scoreLongTermThinking(ticks, actions);
  const riskAppropriateness = scoreRiskAppropriateness(ticks, riskProfile);
  const costOfPanicSelling = estimatePanicCost(ticks, actions);

  // Weighted total: discipline 30%, diversification 25%, long-term 25%, risk 20%
  const total = Math.round(
    diversification.score * 0.25 +
      emotionalDiscipline.score * 0.30 +
      longTermThinking.score * 0.25 +
      riskAppropriateness.score * 0.20
  );

  return {
    total,
    dimensions: {
      diversification,
      emotionalDiscipline,
      longTermThinking,
      riskAppropriateness,
    },
    costOfPanicSelling,
  };
}

function scoreDiversification(ticks: SimulationTick[]): ScoreDimension {
  // Sample allocations throughout the simulation
  const samplePoints = [0, Math.floor(ticks.length / 2), ticks.length - 1];
  let totalHHI = 0;

  for (const idx of samplePoints) {
    const alloc = ticks[idx].allocation;
    const total = Object.values(alloc).reduce((a, b) => a + b, 0);
    if (total === 0) continue;

    // Herfindahl-Hirschman Index (lower = more diversified)
    let hhi = 0;
    for (const val of Object.values(alloc)) {
      const share = val / total;
      hhi += share * share;
    }
    totalHHI += hhi;
  }

  const avgHHI = totalHHI / samplePoints.length;
  // HHI ranges: 1/6 = 0.167 (perfect spread) to 1.0 (all in one)
  // Map to 0-100 score
  const score = Math.round(Math.max(0, Math.min(100, (1 - avgHHI) * 120)));

  let explanation: string;
  if (score >= 80) {
    explanation = "Good spread across asset classes. Diversification reduces risk without sacrificing returns.";
  } else if (score >= 60) {
    explanation = "Decent diversification, but some concentration risk. Consider spreading across more asset classes.";
  } else {
    explanation = "Too concentrated. Putting most of your money in one place is gambling, not investing.";
  }

  return {
    label: "Diversification",
    score,
    stars: Math.ceil(score / 20),
    explanation,
  };
}

function scoreEmotionalDiscipline(
  ticks: SimulationTick[],
  actions: PlayerAction[]
): ScoreDimension {
  const panicSells = actions.filter((a) => a.type === "panic_sell").length;
  const totalActions = actions.length;
  const holds = actions.filter((a) => a.type === "hold").length;

  // Fewer trades = better (for beginners)
  // Holding through crashes = great
  // Panic selling = bad
  let score = 100;
  score -= panicSells * 25; // Heavy penalty for panic selling
  score -= Math.max(0, totalActions - 3) * 5; // Slight penalty for overtrading

  // Bonus for holding through decision points
  const decisionPoints = ticks.filter((t) => t.isDecisionPoint).length;
  if (decisionPoints > 0 && holds > 0) {
    score += Math.min(10, (holds / decisionPoints) * 15);
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  let explanation: string;
  if (panicSells > 0) {
    explanation = `You panic-sold ${panicSells} time${panicSells > 1 ? "s" : ""}. Every crash in this dataset recovered. Panic selling is the #1 wealth destroyer.`;
  } else if (holds >= decisionPoints && decisionPoints > 0) {
    explanation = "You held through every crash. That takes nerve. This single habit is worth more than any strategy.";
  } else {
    explanation = "Reasonable discipline. Remember: the best investors are often the ones who trade the least.";
  }

  return {
    label: "Emotional Discipline",
    score,
    stars: Math.ceil(score / 20),
    explanation,
  };
}

function scoreLongTermThinking(
  ticks: SimulationTick[],
  actions: PlayerAction[]
): ScoreDimension {
  // Check if the player stayed invested (not in 100% cash) for most of the simulation
  const totalTicks = ticks.length;
  let cashOnlyTicks = 0;

  for (const tick of ticks) {
    const alloc = tick.allocation;
    const total = Object.values(alloc).reduce((a, b) => a + b, 0);
    if (total > 0 && alloc.cash / total > 0.9) {
      cashOnlyTicks++;
    }
  }

  const timeInMarket = 1 - cashOnlyTicks / totalTicks;
  let score = Math.round(timeInMarket * 100);

  // Bonus for consistent strategy (few allocation changes)
  const rebalances = actions.filter((a) => a.type === "rebalance").length;
  if (rebalances <= 3) score = Math.min(100, score + 10);

  score = Math.max(0, Math.min(100, score));

  let explanation: string;
  if (timeInMarket >= 0.95) {
    explanation = "You stayed invested through the full period. Time in the market beats timing the market.";
  } else if (timeInMarket >= 0.7) {
    explanation = "You were invested most of the time, but moved to cash at some points. Each day out of the market is a day of missed growth.";
  } else {
    explanation = "You spent too much time in cash. Over 20 years, being out of the market even for the 10 best days cuts your returns in half.";
  }

  return {
    label: "Long-term Thinking",
    score,
    stars: Math.ceil(score / 20),
    explanation,
  };
}

function scoreRiskAppropriateness(
  ticks: SimulationTick[],
  riskProfile: "cautious" | "balanced" | "growth"
): ScoreDimension {
  // Check if equity allocation matches risk profile
  const idealEquity = {
    cautious: { min: 15, max: 35 },
    balanced: { min: 35, max: 60 },
    growth: { min: 55, max: 80 },
  }[riskProfile];

  let deviationSum = 0;
  const samplePoints = [0, Math.floor(ticks.length / 3), Math.floor((ticks.length * 2) / 3), ticks.length - 1];

  for (const idx of samplePoints) {
    const alloc = ticks[idx].allocation;
    const total = Object.values(alloc).reduce((a, b) => a + b, 0);
    if (total === 0) continue;

    const equityPct =
      ((alloc.swiss_stocks + alloc.us_stocks + alloc.eu_stocks) / total) * 100;

    if (equityPct < idealEquity.min) {
      deviationSum += idealEquity.min - equityPct;
    } else if (equityPct > idealEquity.max) {
      deviationSum += equityPct - idealEquity.max;
    }
  }

  const avgDeviation = deviationSum / samplePoints.length;
  const score = Math.round(Math.max(0, Math.min(100, 100 - avgDeviation * 3)));

  let explanation: string;
  if (score >= 80) {
    explanation = `Your allocation matched your ${riskProfile} risk profile well. Consistency between your comfort zone and your portfolio is key.`;
  } else if (score >= 50) {
    explanation = `Your allocation drifted from your ${riskProfile} profile. That's not necessarily wrong, but know yourself — mismatched risk keeps you up at night.`;
  } else {
    explanation = `Big mismatch between your ${riskProfile} risk profile and your actual allocation. This disconnect is where emotional mistakes happen.`;
  }

  return {
    label: "Risk Appropriateness",
    score,
    stars: Math.ceil(score / 20),
    explanation,
  };
}

/**
 * Estimate how much money was lost due to panic selling.
 * Compares actual end value with a "never sold" counterfactual.
 */
function estimatePanicCost(
  ticks: SimulationTick[],
  actions: PlayerAction[]
): number {
  const panicSells = actions.filter((a) => a.type === "panic_sell");
  if (panicSells.length === 0) return 0;

  // Simple estimate: the final value difference between the simulation
  // with panic sells vs the initial allocation held throughout
  const actualFinal = ticks[ticks.length - 1].portfolioValue;
  const startValue = ticks[0].portfolioValue;

  // Use benchmark return as proxy for "held" scenario with moderate allocation
  const benchmarkReturn = ticks[ticks.length - 1].benchmarkReturn / 100;
  const heldValue = startValue * (1 + benchmarkReturn * 0.6); // 60% market exposure

  return Math.max(0, Math.round(heldValue - actualFinal));
}
