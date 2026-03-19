import type { CoachCategory, SimulationReport, RiskProfile } from '@/types';
import { formatCurrency } from './calculations';

// AI Coach personality: friendly, confident, concise, slightly energetic
// Like a smart mentor, not a professor. 2-4 sentences, relatable examples.

interface AIResponse {
  message: string;
  category: CoachCategory;
}

export function getProjectionExplanation(yearsToGoal: number, targetAmount: number, monthlyContribution: number): AIResponse {
  return {
    message: `At €${monthlyContribution}/month, you'll hit your €${formatCurrency(targetAmount).replace('€', '')} goal in about ${yearsToGoal} years. That's the power of consistency - every month you invest is a brick in your future. The earlier you start, the less heavy lifting you need to do.`,
    category: 'projection',
  };
}

export function getScenarioOptimization(originalYears: number, improvedYears: number, contribution: number): AIResponse {
  const yearsSaved = originalYears - improvedYears;
  return {
    message: `By bumping your contribution after a few years, you could shave off ${yearsSaved} years. That's not magic - it's compound interest working harder. Think of it like this: your money starts making money, and that money makes more money.`,
    category: 'scenario',
  };
}

export function getCostOfWaitingInsight(lostValue: number, delayYears: number): AIResponse {
  return {
    message: `Waiting ${delayYears} years to start could cost you around €${formatCurrency(lostValue).replace('€', '')} in potential growth. That's not to scare you - it's just math. The best time to start was yesterday. The second best time is today.`,
    category: 'regret',
  };
}

export function getFutureSelfMessage(age: number, yearsToGoal: number, targetAmount: number): AIResponse {
  const futureAge = age + yearsToGoal;
  return {
    message: `Hey, it's ${futureAge}-year-old you. Thanks for not waiting. That goal you thought was impossible? It's sitting in my account right now. Every small contribution you made added up. I couldn't have done it without your consistency.`,
    category: 'future-self',
  };
}

export function getPostGameAnalysis(report: SimulationReport): AIResponse {
  const { annualizedReturn, diversificationScore, maxDrawdown } = report;
  
  let message = '';
  
  if (annualizedReturn > 7) {
    message = `Solid run! ${annualizedReturn}% annualized return beats most active traders. `;
  } else if (annualizedReturn > 4) {
    message = `Not bad - ${annualizedReturn}% return shows steady growth. `;
  } else {
    message = `${annualizedReturn}% return shows room for improvement. `;
  }
  
  if (diversificationScore > 70) {
    message += `Your diversification game was strong, which kept you stable during volatility.`;
  } else if (diversificationScore > 40) {
    message += `Consider spreading across more asset classes next time for better protection.`;
  } else {
    message += `Concentration risk hurt you - diversification is your friend in turbulent markets.`;
  }
  
  return {
    message,
    category: 'analysis',
  };
}

export function getMistakeExplanation(mistakeType: string): AIResponse {
  const explanations: Record<string, string> = {
    'panic-sell': "Selling during a crash feels safe, but it locks in your losses. History shows markets recover - and those who stay in capture that rebound. Next time, try zooming out to the 10-year view.",
    'missed-recovery': "You sat out the recovery waiting for the 'right moment'. Here's the thing - time in the market beats timing the market. Even buying at the worst possible moment usually works out over decades.",
    'over-concentration': "Having all eggs in one basket worked this time... but it's risky. One bad sector hit could wipe out years of gains. Spread the love across asset classes.",
    'ignored-rebalance': "Your allocation drifted way off target. Regular rebalancing keeps your risk in check and often improves returns. Set a reminder to check in quarterly.",
  };
  
  return {
    message: explanations[mistakeType] || "That decision didn't pan out as hoped. Remember: investing is a long game, and every experience teaches you something valuable.",
    category: 'mistake',
  };
}

export function getSimulatedMarketNews(eventType: string): AIResponse {
  const newsItems: Record<string, string> = {
    'bull': "Markets are surging! Don't let FOMO push you into overexposure. Stick to your plan - what goes up will correct eventually.",
    'crash': "Markets are down sharply. Take a breath. This is when long-term investors are made. Panic selling is the most expensive mistake you can make.",
    'recovery': "Signs of recovery emerging. Those who held through the storm are being rewarded. This is why we diversify and stay patient.",
    'inflation': "Inflation is heating up. Your cash is losing purchasing power, but hard assets like gold and equities typically adjust over time.",
    'sideways': "Markets are moving sideways. Boring? Maybe. But boring can be good - it's a chance to accumulate while prices are stable.",
  };
  
  return {
    message: newsItems[eventType] || "Market conditions are shifting. Stay informed, but don't let short-term noise derail your long-term strategy.",
    category: 'news',
  };
}

export function getCompetitiveAnalysis(won: boolean, returnDiff: number, riskDiff: number): AIResponse {
  if (won) {
    if (riskDiff < 0) {
      return {
        message: `Victory! You beat your opponent by ${Math.abs(returnDiff).toFixed(1)}% while taking LESS risk. That's the dream - smart investing isn't about being aggressive, it's about being strategic.`,
        category: 'competitive',
      };
    }
    return {
      message: `You won with ${Math.abs(returnDiff).toFixed(1)}% better returns. Nice work! Just watch the risk level next time - sustainable wins come from balanced strategies.`,
      category: 'competitive',
    };
  } else {
    if (riskDiff > 0) {
      return {
        message: `You lost, but your opponent took way more risk. In real life, their strategy could've blown up. Playing it smart is sometimes worth more than short-term wins.`,
        category: 'competitive',
      };
    }
    return {
      message: `Your opponent edged you out by ${Math.abs(returnDiff).toFixed(1)}%. Study their moves - what did they do differently? Every loss is a lesson in disguise.`,
      category: 'competitive',
    };
  }
}

export function getLearningNextStep(riskProfile: RiskProfile, completedSimulations: number): AIResponse {
  if (completedSimulations < 3) {
    return {
      message: "Run a few more simulations to see how different strategies play out. Try a 30-year horizon next - that's when compound interest really shows its magic.",
      category: 'learning',
    };
  }
  
  const suggestions: Record<RiskProfile, string> = {
    conservative: "Your cautious approach is valid. Try one simulation with slightly more equity exposure - see how much extra growth you'd get for a bit more volatility.",
    balanced: "You've got a good foundation. Experiment with rebalancing strategies during crashes - buying the dip can supercharge long-term returns.",
    aggressive: "You're comfortable with risk. Make sure you can stomach a 40% drawdown in real life. Try a simulation where you DON'T buy the dip to see the other side.",
  };
  
  return {
    message: suggestions[riskProfile],
    category: 'learning',
  };
}

export function getRiskProfileDetection(allocations: { assetClass: string; percentage: number }[]): AIResponse {
  const riskyAssets = ['bitcoin', 'tech-growth', 'global-equity', 'swiss-equity'];
  const riskyAllocation = allocations
    .filter(a => riskyAssets.includes(a.assetClass))
    .reduce((sum, a) => sum + a.percentage, 0);
  
  let profile: RiskProfile;
  let message: string;
  
  if (riskyAllocation > 70) {
    profile = 'aggressive';
    message = `You're leaning aggressive with ${riskyAllocation}% in growth assets. That's fine if you can sleep through a -30% year. Make sure your real-life risk tolerance matches your simulation confidence.`;
  } else if (riskyAllocation > 40) {
    profile = 'balanced';
    message = `Balanced approach with ${riskyAllocation}% in growth assets. You're playing the long game without betting the farm. This is how most successful investors operate.`;
  } else {
    profile = 'conservative';
    message = `Conservative with only ${riskyAllocation}% in growth assets. Safe? Yes. But you might be leaving returns on the table over decades. Consider if you can handle a bit more volatility for better growth.`;
  }
  
  return {
    message,
    category: 'risk',
  };
}

// Chat responses for common questions
export function getChatResponse(question: string): AIResponse {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('lose money') || questionLower.includes('lost')) {
    return {
      message: "Market dips are normal - even expected. The key is whether you sold at the bottom (locking in losses) or held through. Long-term, diversified portfolios have always recovered from crashes. The loss only becomes real when you sell.",
      category: 'analysis',
    };
  }
  
  if (questionLower.includes('selling') || questionLower.includes('mistake')) {
    return {
      message: "If you sold during a dip, you might've missed the recovery. But don't beat yourself up - it's a common instinct. The lesson: zoom out. In a 30-year journey, one bad decision rarely defines the outcome if you learn from it.",
      category: 'mistake',
    };
  }
  
  if (questionLower.includes('faster') || questionLower.includes('goal')) {
    return {
      message: "Three ways to reach your goal faster: 1) Increase monthly contributions (even small bumps help), 2) Start earlier (time is your biggest asset), 3) Slightly higher risk allocation (more equities = more growth potential, but more volatility).",
      category: 'scenario',
    };
  }
  
  if (questionLower.includes('diversification') || questionLower.includes('diversify')) {
    return {
      message: "Diversification means spreading your money across different asset types. Why? Because they don't all crash at the same time. When stocks dip, bonds might hold steady. When local markets struggle, global ones might thrive. It's not about maximizing returns - it's about smoothing the ride.",
      category: 'learning',
    };
  }
  
  if (questionLower.includes('investor') || questionLower.includes('type') || questionLower.includes('profile')) {
    return {
      message: "Your risk profile shows how much volatility you can handle. Aggressive investors load up on stocks and crypto - big swings, potentially big rewards. Conservative investors prefer bonds and cash - stable but slower growth. Most successful long-term investors are somewhere in the balanced middle.",
      category: 'risk',
    };
  }
  
  // Default response
  return {
    message: "That's a great question! The key to smart investing is staying curious while keeping emotions in check. Would you like me to explain any specific concept - diversification, risk management, or compound interest?",
    category: 'learning',
  };
}

// Daily insights
export const DAILY_INSIGHTS = [
  "The stock market has returned an average of 10% per year over the past century. Time is your superpower.",
  "Warren Buffett made 99% of his wealth after age 50. Patience is the ultimate investment strategy.",
  "A 1% fee difference can cost you 25% of your retirement savings over 40 years. Watch those fees.",
  "Missing the 10 best market days over 20 years can cut your returns in half. Stay invested.",
  "Diversification is the only free lunch in investing. Spread your bets wisely.",
  "The best performing portfolios often belong to people who forgot they had them. Simplicity wins.",
  "Dollar-cost averaging means you buy more shares when prices are low. Downturns are discounts.",
  "Your biggest investment risk isn't market crashes - it's not investing at all.",
];

export function getDailyInsight(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_INSIGHTS[dayOfYear % DAILY_INSIGHTS.length];
}
