import type { ArenaAssetClass } from '@/data/arena-scenarios';

// Allocation anchor points for linear interpolation
// Risk 0 (conservative) → Risk 50 (balanced) → Risk 100 (aggressive)
const ALLOCATION_ANCHORS: Record<ArenaAssetClass, [number, number, number]> = {
  'global-equity': [10, 40, 50],
  'swiss-equity':  [0, 0, 0],
  'bonds':         [50, 25, 0],
  'cash':          [30, 5, 0],
  'gold':          [10, 15, 5],
  'bitcoin':       [0, 5, 20],
  'tech-growth':   [0, 10, 25],
};

/**
 * Convert risk level (0-100) to allocation percentages for all 7 asset classes.
 * Uses linear interpolation between anchor points at risk 0, 50, and 100.
 */
export function getAllocationFromRisk(risk: number): Record<ArenaAssetClass, number> {
  const clamped = Math.max(0, Math.min(100, risk));
  const result = {} as Record<ArenaAssetClass, number>;

  for (const [asset, [low, mid, high]] of Object.entries(ALLOCATION_ANCHORS)) {
    if (clamped <= 50) {
      // Interpolate between low (0) and mid (50)
      const t = clamped / 50;
      result[asset as ArenaAssetClass] = low + (mid - low) * t;
    } else {
      // Interpolate between mid (50) and high (100)
      const t = (clamped - 50) / 50;
      result[asset as ArenaAssetClass] = mid + (high - mid) * t;
    }
  }

  return result;
}

/**
 * Get volatility scaling factor for time horizon.
 * Longer horizons smooth out volatility.
 */
export function getVolatilityScale(timeHorizon: 20 | 30 | 40): number {
  if (timeHorizon === 20) return 1.0;
  if (timeHorizon === 30) return 0.85;
  return 0.7;
}

/**
 * Calculate round return given allocation and event impacts.
 * Returns a decimal (e.g., 0.05 for 5% return).
 */
export function calculateRoundReturn(
  allocation: Record<ArenaAssetClass, number>,
  eventImpacts: Partial<Record<ArenaAssetClass, number>>,
  volatilityScale: number
): number {
  let totalReturn = 0;
  for (const [asset, pct] of Object.entries(allocation)) {
    const impact = eventImpacts[asset as ArenaAssetClass] || 0;
    totalReturn += (pct / 100) * impact * volatilityScale;
  }
  return totalReturn;
}

/**
 * Apply round return to portfolio value.
 */
export function applyRoundReturn(currentValue: number, roundReturn: number): number {
  return currentValue * (1 + roundReturn);
}

/**
 * Calculate XP reward for a match result.
 * Win: 50, Draw: 25, Loss: 10
 * Bonus: +10 if return > 20%, +20 if return > 50%
 */
export function calculateMatchXP(result: 'win' | 'loss' | 'draw', returnPct: number): number {
  let xp = result === 'win' ? 50 : result === 'draw' ? 25 : 10;
  if (returnPct > 50) xp += 20;
  else if (returnPct > 20) xp += 10;
  return xp;
}

/**
 * Calculate new ELO rating using standard formula.
 * result: 1 for win, 0.5 for draw, 0 for loss
 */
export function calculateNewElo(playerElo: number, opponentElo: number, result: 0 | 0.5 | 1): number {
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  return Math.round(playerElo + K * (result - expectedScore));
}

/**
 * Get risk label for display.
 */
export function getRiskLabel(risk: number): string {
  if (risk <= 30) return 'Conservative';
  if (risk <= 70) return 'Balanced';
  return 'Aggressive';
}

/**
 * Format a number as CHF currency.
 */
export function formatCHF(value: number): string {
  return `CHF ${Math.round(value).toLocaleString('de-CH')}`;
}

/**
 * Calculate return percentage from starting and ending value.
 */
export function getReturnPercentage(startValue: number, endValue: number): number {
  return ((endValue - startValue) / startValue) * 100;
}
