import type { SimulationReport } from './solo-types';

export function getPostGameAnalysis(report: SimulationReport): { message: string } {
  const { annualizedReturn, diversificationScore } = report;

  let message = '';

  if (annualizedReturn > 7) {
    message = `Solid run! ${annualizedReturn}% annualized return beats most active traders. `;
  } else if (annualizedReturn > 4) {
    message = `Not bad — ${annualizedReturn}% return shows steady growth. `;
  } else {
    message = `${annualizedReturn}% return shows room for improvement. `;
  }

  if (diversificationScore > 70) {
    message += `Your diversification game was strong, which kept you stable during volatility.`;
  } else if (diversificationScore > 40) {
    message += `Consider spreading across more asset classes next time for better protection.`;
  } else {
    message += `Concentration risk hurt you — diversification is your friend in turbulent markets.`;
  }

  return { message };
}
