import type { 
  Milestone, 
  YearlyBalance, 
  Scenario, 
  CostOfWaiting, 
  ScenarioChange,
  FutureProjection,
  Portfolio,
  Allocation,
  AssetClass,
  SimulationReport,
  Decision
} from '@/types';

// Compound interest with monthly contributions
export function calculateFutureValue(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  
  // Future value of principal
  const principalFV = principal * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions (annuity)
  const contributionsFV = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return principalFV + contributionsFV;
}

// Calculate years to reach target
export function calculateYearsToGoal(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  principal: number = 0
): number {
  const monthlyRate = annualRate / 12;
  
  // Binary search for years (more stable than logarithmic formula)
  let low = 0;
  let high = 100;
  
  while (high - low > 0.01) {
    const mid = (low + high) / 2;
    const fv = calculateFutureValue(principal, monthlyContribution, annualRate, mid);
    
    if (fv < targetAmount) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return Math.ceil(high * 10) / 10; // Round to 1 decimal
}

// Generate yearly balance projections
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
    const yearContributions = year === 0 ? principal : monthlyContribution * 12;
    const growth = year === 0 ? 0 : currentBalance * annualRate;
    
    balances.push({
      year,
      balance: Math.round(currentBalance),
      contributions: Math.round(totalContributions),
      growth: Math.round(currentBalance - totalContributions),
    });
    
    // Calculate next year
    if (year < years) {
      currentBalance = calculateFutureValue(currentBalance, monthlyContribution, annualRate, 1);
      totalContributions += monthlyContribution * 12;
    }
  }
  
  return balances;
}

// Generate milestones (25%, 50%, 75%, 100%)
export function generateMilestones(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  principal: number = 0
): Milestone[] {
  const percentages = [25, 50, 75, 100];
  const milestones: Milestone[] = [];
  
  for (const percent of percentages) {
    const targetValue = (targetAmount * percent) / 100;
    const years = calculateYearsToGoal(targetValue, monthlyContribution, annualRate, principal);
    const balance = calculateFutureValue(principal, monthlyContribution, annualRate, years);
    
    milestones.push({
      year: Math.round(years),
      balance: Math.round(balance),
      percentComplete: percent,
    });
  }
  
  return milestones;
}

// Calculate scenario with contribution changes
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
  
  // Sort changes by year
  const sortedChanges = [...changes].sort((a, b) => a.afterYears - b.afterYears);
  let changeIndex = 0;
  
  while (currentBalance < targetAmount && year < 100) {
    // Check if we need to change contribution
    if (changeIndex < sortedChanges.length && year >= sortedChanges[changeIndex].afterYears) {
      currentContribution = sortedChanges[changeIndex].newContribution;
      changeIndex++;
    }
    
    const yearContributions = year === 0 ? principal : currentContribution * 12;
    const growth = year === 0 ? 0 : currentBalance * annualRate;
    
    yearlyBalances.push({
      year,
      balance: Math.round(currentBalance),
      contributions: Math.round(totalContributions),
      growth: Math.round(currentBalance - totalContributions),
    });
    
    currentBalance = calculateFutureValue(currentBalance, currentContribution, annualRate, 1);
    totalContributions += currentContribution * 12;
    year++;
  }
  
  return {
    yearsToGoal: year,
    finalBalance: Math.round(currentBalance),
    yearlyBalances,
  };
}

// Calculate cost of waiting
export function calculateCostOfWaiting(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  delayYears: number
): CostOfWaiting {
  const originalYears = calculateYearsToGoal(targetAmount, monthlyContribution, annualRate);
  const originalFinalValue = calculateFutureValue(0, monthlyContribution, annualRate, originalYears + delayYears);
  
  const delayedYears = calculateYearsToGoal(targetAmount, monthlyContribution, annualRate);
  const delayedFinalValue = calculateFutureValue(0, monthlyContribution, annualRate, delayedYears);
  
  // The actual cost is the growth we missed during delay years
  const lostValue = originalFinalValue - delayedFinalValue;
  
  return {
    delayYears,
    lostValue: Math.round(Math.abs(lostValue)),
    newYearsToGoal: Math.round(originalYears + delayYears),
  };
}

// Generate full projection
export function generateFutureProjection(
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number,
  age: number
): FutureProjection {
  const yearsToGoal = calculateYearsToGoal(targetAmount, monthlyContribution, annualRate);
  const monthlyMilestones = generateMilestones(targetAmount, monthlyContribution, annualRate);
  const yearlyBalances = generateYearlyBalances(monthlyContribution, annualRate, Math.ceil(yearsToGoal) + 5);
  
  // Generate scenarios
  const baseScenario: Scenario = {
    id: 'base',
    name: 'Current Plan',
    description: `€${monthlyContribution}/month at ${(annualRate * 100).toFixed(0)}% return`,
    yearsToGoal: Math.round(yearsToGoal),
    finalBalance: calculateFutureValue(0, monthlyContribution, annualRate, yearsToGoal),
    changes: [],
  };
  
  // Improved scenario with contribution increase
  const improvedResult = calculateScenarioWithChanges(targetAmount, monthlyContribution, annualRate, [
    { afterYears: 5, newContribution: monthlyContribution * 2 },
  ]);
  
  const improvedScenario: Scenario = {
    id: 'improved',
    name: 'Boost After 5 Years',
    description: `Increase to €${monthlyContribution * 2}/month after 5 years`,
    yearsToGoal: improvedResult.yearsToGoal,
    finalBalance: improvedResult.finalBalance,
    changes: [{ afterYears: 5, newContribution: monthlyContribution * 2 }],
  };
  
  // Aggressive scenario
  const aggressiveResult = calculateScenarioWithChanges(targetAmount, monthlyContribution, annualRate, [
    { afterYears: 5, newContribution: monthlyContribution * 2 },
    { afterYears: 8, newContribution: monthlyContribution * 3.33 },
  ]);
  
  const aggressiveScenario: Scenario = {
    id: 'aggressive',
    name: 'Double Boost Strategy',
    description: `€${monthlyContribution * 2}/month at year 5, €${Math.round(monthlyContribution * 3.33)}/month at year 8`,
    yearsToGoal: aggressiveResult.yearsToGoal,
    finalBalance: aggressiveResult.finalBalance,
    changes: [
      { afterYears: 5, newContribution: monthlyContribution * 2 },
      { afterYears: 8, newContribution: monthlyContribution * 3.33 },
    ],
  };
  
  const costOfWaiting = calculateCostOfWaiting(targetAmount, monthlyContribution, annualRate, 3);
  
  return {
    yearsToGoal: Math.round(yearsToGoal),
    monthlyMilestones,
    yearlyBalances,
    scenarios: [baseScenario, improvedScenario, aggressiveScenario],
    costOfWaiting,
  };
}

// Portfolio calculations
export function calculatePortfolioValue(allocations: Allocation[]): number {
  return allocations.reduce((sum, a) => sum + a.value, 0);
}

export function calculateDiversificationScore(allocations: Allocation[]): number {
  const activeAllocations = allocations.filter(a => a.percentage > 0);
  const count = activeAllocations.length;
  
  if (count === 0) return 0;
  if (count === 1) return 20;
  
  // Calculate concentration (Herfindahl index)
  const hhi = allocations.reduce((sum, a) => sum + Math.pow(a.percentage / 100, 2), 0);
  
  // Convert to score (lower HHI = more diversified = higher score)
  // HHI ranges from 1/n to 1, where n is number of assets
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

// Simulation calculations
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
  
  // Add some randomness
  const randomFactor = 0.8 + Math.random() * 0.4;
  
  return baseReturn * multiplier * randomFactor;
}

export function generateSimulationReport(
  portfolio: Portfolio,
  decisions: Decision[],
  initialValue: number
): SimulationReport {
  const finalValue = portfolio.totalValue;
  const totalContributions = portfolio.history.length * portfolio.monthlyContribution * 3; // quarterly
  const years = portfolio.history.length / 4;
  
  const annualizedReturn = years > 0 
    ? Math.pow(finalValue / (initialValue + totalContributions), 1 / years) - 1
    : 0;
  
  // Calculate max drawdown
  let peak = initialValue;
  let maxDrawdown = 0;
  for (const snapshot of portfolio.history) {
    if (snapshot.totalValue > peak) peak = snapshot.totalValue;
    const drawdown = (peak - snapshot.totalValue) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  const diversificationScore = calculateDiversificationScore(portfolio.allocations);
  
  // Analyze decisions
  const mistakes: string[] = [];
  const goodDecisions: string[] = [];
  
  for (const decision of decisions) {
    if (decision.wasGood === false) {
      if (decision.type === 'sell') {
        mistakes.push(`Sold during volatility in year ${decision.year} - missing potential recovery`);
      }
    } else if (decision.wasGood === true) {
      if (decision.type === 'buy-dip') {
        goodDecisions.push(`Bought the dip in year ${decision.year} - captured recovery gains`);
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

// Format helpers
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
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return `€${value}`;
}

// Format years and months (e.g., "2 years 4 months" or "3 months")
export function formatYearsMonths(totalYears: number): { text: string; years: number; months: number } {
  const years = Math.floor(totalYears);
  const months = Math.round((totalYears - years) * 12);
  
  if (years === 0 && months === 0) {
    return { text: '0 months', years: 0, months: 0 };
  }
  
  if (years === 0) {
    return { text: `${months} month${months === 1 ? '' : 's'}`, years: 0, months };
  }
  
  if (months === 0) {
    return { text: `${years} year${years === 1 ? '' : 's'}`, years, months: 0 };
  }
  
  return { 
    text: `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`, 
    years, 
    months 
  };
}

// Get risk level label and color based on expected return rate
export function getRiskLevel(expectedReturn: number): { level: 'low' | 'medium' | 'high'; label: string; color: string } {
  if (expectedReturn <= 0.04) {
    return { level: 'low', label: 'Conservative', color: 'text-emerald-400' };
  }
  if (expectedReturn <= 0.07) {
    return { level: 'medium', label: 'Balanced', color: 'text-blue-400' };
  }
  return { level: 'high', label: 'Aggressive', color: 'text-orange-400' };
}

// Generate optimization suggestions based on current plan
export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  newYearsToGoal: number;
  changeType: 'contribution' | 'return' | 'delay' | 'target';
  recommendation: string;
}

export function generateOptimizations(
  targetAmount: number,
  monthlyContribution: number,
  expectedReturn: number,
  currentYearsToGoal: number
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  
  // 1. Increase contribution by 25%
  const increasedContribution = monthlyContribution * 1.25;
  const yearsWithMoreContrib = calculateYearsToGoal(targetAmount, increasedContribution, expectedReturn);
  const yearsSaved1 = currentYearsToGoal - yearsWithMoreContrib;
  if (yearsSaved1 > 0.5) {
    suggestions.push({
      id: 'increase-contribution',
      title: 'Boost Your Monthly Savings',
      description: `Increase from €${monthlyContribution} to €${Math.round(increasedContribution)}/month`,
      impact: `Reach your goal ${formatYearsMonths(yearsSaved1).text} faster`,
      newYearsToGoal: yearsWithMoreContrib,
      changeType: 'contribution',
      recommendation: 'This is the most effective way to reach your goal faster. Even a small increase compounds significantly over time.',
    });
  }
  
  // 2. Delayed gratification - save for 2 more years
  const delayedYears = calculateYearsToGoal(targetAmount * 1.2, monthlyContribution, expectedReturn);
  const extraValue = Math.round(calculateFutureValue(0, monthlyContribution, expectedReturn, currentYearsToGoal + 2) - targetAmount);
  suggestions.push({
    id: 'delay-purchase',
    title: 'Delay for Extra Wealth',
    description: `Wait 2 extra years after reaching your goal`,
    impact: `Build an additional €${formatCompactNumber(extraValue)} buffer`,
    newYearsToGoal: currentYearsToGoal + 2,
    changeType: 'delay',
    recommendation: 'Patience pays off. The extra years of compound growth can significantly boost your final wealth.',
  });
  
  // 3. Step-up contribution plan
  const stepUpYears = calculateScenarioWithChanges(
    targetAmount,
    monthlyContribution,
    expectedReturn,
    [{ afterYears: 3, newContribution: monthlyContribution * 1.5 }]
  ).yearsToGoal;
  const yearsSaved3 = currentYearsToGoal - stepUpYears;
  if (yearsSaved3 > 0.5) {
    suggestions.push({
      id: 'step-up-plan',
      title: 'Step-Up Contribution Plan',
      description: `Increase to €${Math.round(monthlyContribution * 1.5)}/month after 3 years`,
      impact: `Reach your goal ${formatYearsMonths(yearsSaved3).text} faster`,
      newYearsToGoal: stepUpYears,
      changeType: 'contribution',
      recommendation: 'Start at your current level, then increase as your income grows. A realistic path to faster goal achievement.',
    });
  }
  
  // 4. More realistic target
  const realisticTarget = Math.round(targetAmount * 0.8);
  const realisticYears = calculateYearsToGoal(realisticTarget, monthlyContribution, expectedReturn);
  const yearsSaved4 = currentYearsToGoal - realisticYears;
  if (yearsSaved4 > 1) {
    suggestions.push({
      id: 'realistic-target',
      title: 'Adjust Your Target',
      description: `Consider a €${formatCompactNumber(realisticTarget)} goal instead`,
      impact: `Reach it ${formatYearsMonths(yearsSaved4).text} sooner`,
      newYearsToGoal: realisticYears,
      changeType: 'target',
      recommendation: 'Sometimes a slightly smaller goal achieved sooner brings more satisfaction than waiting for a larger one.',
    });
  }
  
  return suggestions.slice(0, 4); // Return max 4 suggestions
}

// Calculate allocation from strategy slider (0-100)
export function getAllocationFromStrategy(strategyValue: number): { 
  allocations: { assetClass: string; percentage: number }[];
  riskScore: number;
  diversificationScore: number;
  label: string;
} {
  // 0 = very conservative, 100 = very aggressive
  const equityBase = Math.min(20 + strategyValue * 0.6, 80); // 20% to 80%
  const bondBase = Math.max(50 - strategyValue * 0.5, 5); // 50% to 5%
  const goldBase = Math.max(15 - strategyValue * 0.1, 5); // 15% to 5%
  const cashBase = Math.max(15 - strategyValue * 0.15, 0); // 15% to 0%
  const techBase = strategyValue > 50 ? (strategyValue - 50) * 0.4 : 0; // 0% to 20%
  const bitcoinBase = strategyValue > 70 ? (strategyValue - 70) * 0.3 : 0; // 0% to 9%
  
  const total = equityBase + bondBase + goldBase + cashBase + techBase + bitcoinBase;
  
  const allocations = [
    { assetClass: 'global-equity', percentage: Math.round((equityBase / total) * 100) },
    { assetClass: 'bonds', percentage: Math.round((bondBase / total) * 100) },
    { assetClass: 'gold', percentage: Math.round((goldBase / total) * 100) },
    { assetClass: 'cash', percentage: Math.round((cashBase / total) * 100) },
    { assetClass: 'tech-growth', percentage: Math.round((techBase / total) * 100) },
    { assetClass: 'bitcoin', percentage: Math.round((bitcoinBase / total) * 100) },
  ].filter(a => a.percentage > 0);
  
  // Ensure total is 100
  const currentTotal = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (currentTotal !== 100 && allocations.length > 0) {
    allocations[0].percentage += (100 - currentTotal);
  }
  
  const riskScore = Math.round(strategyValue);
  const diversificationScore = allocations.length >= 4 ? 80 : allocations.length >= 3 ? 60 : 40;
  
  let label: string;
  if (strategyValue <= 25) {
    label = 'Conservative';
  } else if (strategyValue <= 50) {
    label = 'Balanced';
  } else if (strategyValue <= 75) {
    label = 'Growth';
  } else {
    label = 'Aggressive';
  }
  
  return { allocations, riskScore, diversificationScore, label };
}
