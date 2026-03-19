/** AI Coach messages for the Future Engine */

import { formatCurrency } from "./future-engine";

interface AIResponse {
  message: string;
  category: string;
}

export function getProjectionExplanation(
  yearsToGoal: number,
  targetAmount: number,
  monthlyContribution: number
): AIResponse {
  return {
    message: `At CHF ${monthlyContribution}/month, you\u2019ll hit your ${formatCurrency(targetAmount)} goal in about ${yearsToGoal} years. That\u2019s the power of consistency \u2014 every month you invest is a brick in your future. The earlier you start, the less heavy lifting you need to do.`,
    category: "projection",
  };
}

export function getCostOfWaitingInsight(
  lostValue: number,
  delayYears: number
): AIResponse {
  return {
    message: `Waiting ${delayYears} years to start could cost you around ${formatCurrency(lostValue)} in potential growth. That\u2019s not to scare you \u2014 it\u2019s just math. The best time to start was yesterday. The second best time is today.`,
    category: "regret",
  };
}

export function getFutureSelfMessage(
  age: number,
  yearsToGoal: number,
  _targetAmount: number
): AIResponse {
  const futureAge = age + yearsToGoal;
  return {
    message: `Hey, it\u2019s ${futureAge}-year-old you. Thanks for not waiting. That goal you thought was impossible? It\u2019s sitting in my account right now. Every small contribution you made added up. I couldn\u2019t have done it without your consistency.`,
    category: "future-self",
  };
}
