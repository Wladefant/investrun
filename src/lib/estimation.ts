/** Future value estimation engine */

export interface Goal {
  id: string;
  label: string;
  icon: string;
  amount: number;
}

export const GOALS: Goal[] = [
  { id: "car", label: "New Car", icon: "🚗", amount: 45_000 },
  { id: "house", label: "Down Payment", icon: "🏠", amount: 100_000 },
  { id: "laptop", label: "MacBook Pro", icon: "💻", amount: 3_500 },
  { id: "vacation", label: "Dream Vacation", icon: "🌴", amount: 8_000 },
  { id: "education", label: "Education Fund", icon: "🎓", amount: 50_000 },
];

export interface RiskProfile {
  id: "cautious" | "balanced" | "growth";
  label: string;
  icon: string;
  annualReturn: number;
  description: string;
}

export const RISK_PROFILES: RiskProfile[] = [
  {
    id: "cautious",
    label: "Cautious",
    icon: "🛡️",
    annualReturn: 0.03,
    description: "Heavy bonds & gold. Steady but slow.",
  },
  {
    id: "balanced",
    label: "Balanced",
    icon: "⚖️",
    annualReturn: 0.05,
    description: "60/40 stocks & bonds. The sweet spot.",
  },
  {
    id: "growth",
    label: "Growth",
    icon: "🚀",
    annualReturn: 0.07,
    description: "Heavy equities. Faster but bumpier.",
  },
];

/**
 * Calculate months needed to reach a target amount
 * given monthly contributions at a fixed annual return rate.
 *
 * FV = PMT × [((1 + r)^n - 1) / r]
 * Solve for n: n = ln(1 + FV × r / PMT) / ln(1 + r)
 */
export function monthsToGoal(
  targetAmount: number,
  monthlyContribution: number,
  annualReturn: number
): number {
  if (monthlyContribution <= 0) return Infinity;
  if (annualReturn === 0) return Math.ceil(targetAmount / monthlyContribution);

  const r = annualReturn / 12;
  const n = Math.log(1 + (targetAmount * r) / monthlyContribution) / Math.log(1 + r);
  return Math.ceil(n);
}

/**
 * Calculate future value after n months of investing.
 */
export function futureValue(
  monthlyContribution: number,
  annualReturn: number,
  months: number
): number {
  if (annualReturn === 0) return monthlyContribution * months;

  const r = annualReturn / 12;
  return monthlyContribution * ((Math.pow(1 + r, months) - 1) / r);
}

export interface EstimationResult {
  profile: RiskProfile;
  months: number;
  years: number;
  finalValue: number;
}

/**
 * Calculate estimations for all risk profiles + saving (0% return)
 */
export function calculateEstimations(
  targetAmount: number,
  monthlyContribution: number
): { saving: EstimationResult; profiles: EstimationResult[] } {
  const savingMonths = monthsToGoal(targetAmount, monthlyContribution, 0);

  const saving: EstimationResult = {
    profile: {
      id: "cautious",
      label: "Just Saving",
      icon: "💵",
      annualReturn: 0,
      description: "No investment, no growth.",
    },
    months: savingMonths,
    years: savingMonths / 12,
    finalValue: targetAmount,
  };

  const profiles = RISK_PROFILES.map((profile) => {
    const months = monthsToGoal(
      targetAmount,
      monthlyContribution,
      profile.annualReturn
    );
    return {
      profile,
      months,
      years: months / 12,
      finalValue: futureValue(
        monthlyContribution,
        profile.annualReturn,
        months
      ),
    };
  });

  return { saving, profiles };
}

/**
 * Get the "years saved" by investing vs saving.
 */
export function yearsSaved(
  targetAmount: number,
  monthlyContribution: number,
  annualReturn: number
): number {
  const savingMonths = monthsToGoal(targetAmount, monthlyContribution, 0);
  const investingMonths = monthsToGoal(
    targetAmount,
    monthlyContribution,
    annualReturn
  );
  return (savingMonths - investingMonths) / 12;
}
