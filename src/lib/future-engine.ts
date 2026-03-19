/**
 * Future Engine — projection calculations, scenarios, and optimizations.
 * Adapted for the main app (CHF currency, main app Goal type).
 */

import type { Goal } from "./estimation";

export interface Milestone {
  year: number;
  balance: number;
  percentComplete: number;
}

export interface YearlyBalance {
  year: number;
  balance: number;
  contributions: number;
  growth: number;
}

export interface ScenarioChange {
  afterYears: number;
  newContribution: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  yearsToGoal: number;
  finalBalance: number;
  changes: ScenarioChange[];
}

export interface CostOfWaiting {
  delayYears: number;
  lostValue: number;
  newYearsToGoal: number;
}

export interface FutureProjection {
  yearsToGoal: number;
  monthlyMilestones: Milestone[];
  yearlyBalances: YearlyBalance[];
  scenarios: Scenario[];
  costOfWaiting: CostOfWaiting;
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  newYearsToGoal: number;
  changeType: "contribution" | "return" | "delay" | "target";
  recommendation: string;
}

/* ─── Core Math ─── */

export function calculateFutureValue(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const principalFV = principal * Math.pow(1 + monthlyRate, months);
  const contributionsFV =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return principalFV + contributionsFV;
}

export function calculateYearsToGoal(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  principal: number = 0
): number {
  let low = 0;
  let high = 100;
  while (high - low > 0.01) {
    const mid = (low + high) / 2;
    const fv = calculateFutureValue(
      principal,
      monthlyContribution,
      annualRate,
      mid
    );
    if (fv < targetAmount) low = mid;
    else high = mid;
  }
  return Math.ceil(high * 10) / 10;
}

export function generateYearlyBalances(
  monthlyContribution: number,
  annualRate: number,
  years: number,
  principal: number = 0
): YearlyBalance[] {
  const balances: YearlyBalance[] = [];
  let currentBalance = principal;
  let totalContributions = principal;

  for (let year = 0; year <= years; year++) {
    balances.push({
      year,
      balance: Math.round(currentBalance),
      contributions: Math.round(totalContributions),
      growth: Math.round(currentBalance - totalContributions),
    });
    if (year < years) {
      currentBalance = calculateFutureValue(
        currentBalance,
        monthlyContribution,
        annualRate,
        1
      );
      totalContributions += monthlyContribution * 12;
    }
  }
  return balances;
}

export function generateMilestones(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  principal: number = 0
): Milestone[] {
  return [25, 50, 75, 100].map((percent) => {
    const target = (targetAmount * percent) / 100;
    const years = calculateYearsToGoal(
      target,
      monthlyContribution,
      annualRate,
      principal
    );
    return {
      year: Math.round(years),
      balance: Math.round(
        calculateFutureValue(principal, monthlyContribution, annualRate, years)
      ),
      percentComplete: percent,
    };
  });
}

export function calculateScenarioWithChanges(
  targetAmount: number,
  initialContribution: number,
  annualRate: number,
  changes: ScenarioChange[],
  principal: number = 0
): { yearsToGoal: number; finalBalance: number; yearlyBalances: YearlyBalance[] } {
  let currentBalance = principal;
  let currentContribution = initialContribution;
  let year = 0;
  let totalContributions = principal;
  const yearlyBalances: YearlyBalance[] = [];
  const sorted = [...changes].sort((a, b) => a.afterYears - b.afterYears);
  let ci = 0;

  while (currentBalance < targetAmount && year < 100) {
    if (ci < sorted.length && year >= sorted[ci].afterYears) {
      currentContribution = sorted[ci].newContribution;
      ci++;
    }
    yearlyBalances.push({
      year,
      balance: Math.round(currentBalance),
      contributions: Math.round(totalContributions),
      growth: Math.round(currentBalance - totalContributions),
    });
    currentBalance = calculateFutureValue(
      currentBalance,
      currentContribution,
      annualRate,
      1
    );
    totalContributions += currentContribution * 12;
    year++;
  }

  return { yearsToGoal: year, finalBalance: Math.round(currentBalance), yearlyBalances };
}

export function calculateCostOfWaiting(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  delayYears: number
): CostOfWaiting {
  const originalYears = calculateYearsToGoal(
    targetAmount,
    monthlyContribution,
    annualRate
  );
  const originalFinalValue = calculateFutureValue(
    0,
    monthlyContribution,
    annualRate,
    originalYears + delayYears
  );
  const delayedFinalValue = calculateFutureValue(
    0,
    monthlyContribution,
    annualRate,
    originalYears
  );

  return {
    delayYears,
    lostValue: Math.round(Math.abs(originalFinalValue - delayedFinalValue)),
    newYearsToGoal: Math.round(originalYears + delayYears),
  };
}

/* ─── Projection Generator ─── */

export function generateFutureProjection(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  _age: number
): FutureProjection {
  const yearsToGoal = calculateYearsToGoal(
    targetAmount,
    monthlyContribution,
    annualRate
  );
  const monthlyMilestones = generateMilestones(
    targetAmount,
    monthlyContribution,
    annualRate
  );
  const yearlyBalances = generateYearlyBalances(
    monthlyContribution,
    annualRate,
    Math.ceil(yearsToGoal) + 5
  );

  const base: Scenario = {
    id: "base",
    name: "Current Plan",
    description: `CHF ${monthlyContribution}/month at ${(annualRate * 100).toFixed(0)}% return`,
    yearsToGoal: Math.round(yearsToGoal),
    finalBalance: calculateFutureValue(0, monthlyContribution, annualRate, yearsToGoal),
    changes: [],
  };

  const improvedResult = calculateScenarioWithChanges(
    targetAmount,
    monthlyContribution,
    annualRate,
    [{ afterYears: 5, newContribution: monthlyContribution * 2 }]
  );
  const improved: Scenario = {
    id: "improved",
    name: "Boost After 5 Years",
    description: `Increase to CHF ${monthlyContribution * 2}/month after 5 years`,
    yearsToGoal: improvedResult.yearsToGoal,
    finalBalance: improvedResult.finalBalance,
    changes: [{ afterYears: 5, newContribution: monthlyContribution * 2 }],
  };

  const aggressiveResult = calculateScenarioWithChanges(
    targetAmount,
    monthlyContribution,
    annualRate,
    [
      { afterYears: 5, newContribution: monthlyContribution * 2 },
      { afterYears: 8, newContribution: monthlyContribution * 3.33 },
    ]
  );
  const aggressive: Scenario = {
    id: "aggressive",
    name: "Double Boost Strategy",
    description: `CHF ${monthlyContribution * 2}/month at yr 5, CHF ${Math.round(monthlyContribution * 3.33)}/month at yr 8`,
    yearsToGoal: aggressiveResult.yearsToGoal,
    finalBalance: aggressiveResult.finalBalance,
    changes: [
      { afterYears: 5, newContribution: monthlyContribution * 2 },
      { afterYears: 8, newContribution: monthlyContribution * 3.33 },
    ],
  };

  return {
    yearsToGoal: Math.round(yearsToGoal),
    monthlyMilestones,
    yearlyBalances,
    scenarios: [base, improved, aggressive],
    costOfWaiting: calculateCostOfWaiting(
      targetAmount,
      monthlyContribution,
      annualRate,
      3
    ),
  };
}

/* ─── Optimizations ─── */

export function generateOptimizations(
  targetAmount: number,
  monthlyContribution: number,
  expectedReturn: number,
  currentYearsToGoal: number
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  const increased = monthlyContribution * 1.25;
  const yearsMore = calculateYearsToGoal(targetAmount, increased, expectedReturn);
  const saved1 = currentYearsToGoal - yearsMore;
  if (saved1 > 0.5) {
    suggestions.push({
      id: "increase-contribution",
      title: "Boost Your Monthly Savings",
      description: `Increase from CHF ${monthlyContribution} to CHF ${Math.round(increased)}/month`,
      impact: `Reach your goal ${formatYearsMonths(saved1).text} faster`,
      newYearsToGoal: yearsMore,
      changeType: "contribution",
      recommendation:
        "This is the most effective way to reach your goal faster. Even a small increase compounds significantly over time.",
    });
  }

  const extraValue = Math.round(
    calculateFutureValue(0, monthlyContribution, expectedReturn, currentYearsToGoal + 2) -
      targetAmount
  );
  suggestions.push({
    id: "delay-purchase",
    title: "Delay for Extra Wealth",
    description: "Wait 2 extra years after reaching your goal",
    impact: `Build an additional ${formatCompactNumber(extraValue)} buffer`,
    newYearsToGoal: currentYearsToGoal + 2,
    changeType: "delay",
    recommendation:
      "Patience pays off. The extra years of compound growth can significantly boost your final wealth.",
  });

  const stepUp = calculateScenarioWithChanges(targetAmount, monthlyContribution, expectedReturn, [
    { afterYears: 3, newContribution: monthlyContribution * 1.5 },
  ]);
  const saved3 = currentYearsToGoal - stepUp.yearsToGoal;
  if (saved3 > 0.5) {
    suggestions.push({
      id: "step-up-plan",
      title: "Step-Up Contribution Plan",
      description: `Increase to CHF ${Math.round(monthlyContribution * 1.5)}/month after 3 years`,
      impact: `Reach your goal ${formatYearsMonths(saved3).text} faster`,
      newYearsToGoal: stepUp.yearsToGoal,
      changeType: "contribution",
      recommendation:
        "Start at your current level, then increase as your income grows. A realistic path to faster goal achievement.",
    });
  }

  const realisticTarget = Math.round(targetAmount * 0.8);
  const realisticYears = calculateYearsToGoal(
    realisticTarget,
    monthlyContribution,
    expectedReturn
  );
  const saved4 = currentYearsToGoal - realisticYears;
  if (saved4 > 1) {
    suggestions.push({
      id: "realistic-target",
      title: "Adjust Your Target",
      description: `Consider a ${formatCompactNumber(realisticTarget)} goal instead`,
      impact: `Reach it ${formatYearsMonths(saved4).text} sooner`,
      newYearsToGoal: realisticYears,
      changeType: "target",
      recommendation:
        "Sometimes a slightly smaller goal achieved sooner brings more satisfaction than waiting for a larger one.",
    });
  }

  return suggestions.slice(0, 4);
}

/* ─── Format Helpers ─── */

export function formatCurrency(amount: number): string {
  return `CHF ${Math.round(amount).toLocaleString("de-CH")}`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `CHF ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `CHF ${(value / 1_000).toFixed(0)}K`;
  return `CHF ${value}`;
}

export function formatYearsMonths(totalYears: number): {
  text: string;
  years: number;
  months: number;
} {
  const years = Math.floor(totalYears);
  const months = Math.round((totalYears - years) * 12);
  if (years === 0 && months === 0) return { text: "0 months", years: 0, months: 0 };
  if (years === 0)
    return { text: `${months} month${months === 1 ? "" : "s"}`, years: 0, months };
  if (months === 0)
    return { text: `${years} year${years === 1 ? "" : "s"}`, years, months: 0 };
  return {
    text: `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`,
    years,
    months,
  };
}

export function getRiskLevel(expectedReturn: number): {
  level: "low" | "medium" | "high";
  label: string;
} {
  if (expectedReturn <= 0.04) return { level: "low", label: "Conservative" };
  if (expectedReturn <= 0.07) return { level: "medium", label: "Balanced" };
  return { level: "high", label: "Aggressive" };
}
