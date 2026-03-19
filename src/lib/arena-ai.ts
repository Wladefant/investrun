import type { ScenarioEvent, ArenaAssetClass } from '@/data/arena-scenarios';
import type { OpponentPersonalityId } from './arena-opponents';
import { OPPONENTS } from './arena-opponents';
import { getAllocationFromRisk } from './arena-engine';

const AI_TIMEOUT_MS = 8_000;

// --- Context types ---

export interface RoundCommentaryContext {
  roundNumber: number;
  totalRounds: number;
  timeHorizon: number;
  event: {
    title: string;
    description: string;
    type: string;
    severity: number;
  };
  player: {
    risk: number;
    allocation: Record<string, number>;
    portfolioBefore: number;
    portfolioAfter: number;
    returnPct: number;
  };
  opponent: {
    name: string;
    personality: string;
    risk: number;
    allocation: Record<string, number>;
    portfolioBefore: number;
    portfolioAfter: number;
    returnPct: number;
  };
}

export interface MatchAnalysisContext {
  timeHorizon: number;
  outcome: 'win' | 'loss' | 'draw';
  opponent: {
    name: string;
    personality: string;
  };
  finalPortfolios: {
    player: number;
    opponent: number;
  };
  rounds: Array<{
    roundNumber: number;
    event: { title: string; type: string; severity: number };
    playerRisk: number;
    opponentRisk: number;
    playerReturn: number;
    opponentReturn: number;
    playerPortfolio: number;
    opponentPortfolio: number;
  }>;
}

// --- Context builders ---

export function buildRoundContext(
  roundNumber: number,
  totalRounds: number,
  timeHorizon: number,
  event: ScenarioEvent,
  playerRisk: number,
  opponentId: OpponentPersonalityId,
  opponentRisk: number,
  playerPortfolio: number[], // index 0 = starting capital
  opponentPortfolio: number[],
): RoundCommentaryContext {
  const playerBefore = playerPortfolio[roundNumber - 1];
  const playerAfter = playerPortfolio[roundNumber];
  const opponentBefore = opponentPortfolio[roundNumber - 1];
  const opponentAfter = opponentPortfolio[roundNumber];

  return {
    roundNumber,
    totalRounds,
    timeHorizon,
    event: {
      title: event.title,
      description: event.description,
      type: event.type,
      severity: event.severity,
    },
    player: {
      risk: playerRisk,
      allocation: getAllocationFromRisk(playerRisk) as Record<string, number>,
      portfolioBefore: playerBefore,
      portfolioAfter: playerAfter,
      returnPct: ((playerAfter - playerBefore) / playerBefore) * 100,
    },
    opponent: {
      name: OPPONENTS[opponentId].name,
      personality: opponentId,
      risk: opponentRisk,
      allocation: getAllocationFromRisk(opponentRisk) as Record<string, number>,
      portfolioBefore: opponentBefore,
      portfolioAfter: opponentAfter,
      returnPct: ((opponentAfter - opponentBefore) / opponentBefore) * 100,
    },
  };
}

export function buildMatchContext(
  timeHorizon: number,
  outcome: 'win' | 'loss' | 'draw',
  opponentId: OpponentPersonalityId,
  playerPortfolio: number[],
  opponentPortfolio: number[],
  playerDecisions: number[],
  opponentDecisions: number[],
  events: ScenarioEvent[],
): MatchAnalysisContext {
  const rounds = playerDecisions.map((playerRisk, i) => {
    const pBefore = playerPortfolio[i];
    const pAfter = playerPortfolio[i + 1];
    const oBefore = opponentPortfolio[i];
    const oAfter = opponentPortfolio[i + 1];

    return {
      roundNumber: i + 1,
      event: {
        title: events[i]?.title ?? `Round ${i + 1}`,
        type: events[i]?.type ?? 'sideways',
        severity: events[i]?.severity ?? 1,
      },
      playerRisk,
      opponentRisk: opponentDecisions[i],
      playerReturn: ((pAfter - pBefore) / pBefore) * 100,
      opponentReturn: ((oAfter - oBefore) / oBefore) * 100,
      playerPortfolio: pAfter,
      opponentPortfolio: oAfter,
    };
  });

  return {
    timeHorizon,
    outcome,
    opponent: {
      name: OPPONENTS[opponentId].name,
      personality: opponentId,
    },
    finalPortfolios: {
      player: playerPortfolio[playerPortfolio.length - 1],
      opponent: opponentPortfolio[opponentPortfolio.length - 1],
    },
    rounds,
  };
}

// --- Fetch helper ---

export async function fetchArenaAI(
  type: 'round' | 'match',
  context: RoundCommentaryContext | MatchAnalysisContext,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch('/api/ai/arena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, context }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    return data.response || 'The markets moved too fast for analysis.';
  } catch {
    return 'The markets moved too fast for analysis.';
  } finally {
    clearTimeout(timeoutId);
  }
}
