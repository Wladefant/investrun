// Arena AI opponent personalities and decision logic

export type OpponentPersonalityId = 'turtle' | 'owl' | 'bull' | 'fox';

export interface OpponentPersonality {
  id: OpponentPersonalityId;
  name: string;
  emoji: string;
  description: string;
  baseRiskMin: number;
  baseRiskMax: number;
  elo: number; // AI opponent's ELO for ELO calculation
}

export const OPPONENTS: Record<OpponentPersonalityId, OpponentPersonality> = {
  turtle: {
    id: 'turtle',
    name: 'The Turtle',
    emoji: '🐢',
    description: 'Prefers safety over growth. Never risks above 50.',
    baseRiskMin: 20,
    baseRiskMax: 35,
    elo: 900,
  },
  owl: {
    id: 'owl',
    name: 'The Owl',
    emoji: '🦉',
    description: 'Reads markets rationally. Adjusts proportionally.',
    baseRiskMin: 40,
    baseRiskMax: 55,
    elo: 1100,
  },
  bull: {
    id: 'bull',
    name: 'The Bull',
    emoji: '🐂',
    description: 'Buys every dip. Chases maximum returns.',
    baseRiskMin: 65,
    baseRiskMax: 85,
    elo: 1000,
  },
  fox: {
    id: 'fox',
    name: 'The Fox',
    emoji: '🦊',
    description: 'Mirrors your moves. The mind-game player.',
    baseRiskMin: 45,
    baseRiskMax: 65,
    elo: 1200,
  },
};

/** Clamp a value to [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate the risk score (0-100) an AI opponent will choose for this round.
 *
 * @param personalityId   - Which personality is playing
 * @param eventType       - The scenario event type (e.g. 'crash', 'bull', ...)
 * @param severity        - Event severity 1-5
 * @param playerPreviousRisk - Player's risk from the previous round (null on round 1)
 * @param round           - Current round index (1-based)
 */
export function calculateOpponentRisk(
  personalityId: OpponentPersonalityId,
  eventType: string,
  severity: number,
  playerPreviousRisk: number | null,
  round: number
): number {
  const noise = Math.random() * 10 - 5; // ±5 random noise
  let risk: number;

  switch (personalityId) {
    case 'turtle': {
      // Base 25. Drops 20 on crash/crisis, slow recovery (+5 per non-negative round).
      // Never above 50.
      const isCrash = eventType === 'crash' || eventType === 'crisis';
      const crashDrop = isCrash ? 20 + severity * 4 : 0;
      const recoveryBonus = !isCrash && round > 1 ? 5 : 0;
      risk = clamp(25 - crashDrop + recoveryBonus + noise, 0, 50);
      break;
    }

    case 'owl': {
      // Base 48. Adjusts proportionally: crash → -(severity*5), bull → +(severity*4).
      const isCrashOrCrisis = eventType === 'crash' || eventType === 'crisis';
      const isBullOrBoom = eventType === 'bull' || eventType === 'boom';
      let adjustment = 0;
      if (isCrashOrCrisis) adjustment = -(severity * 5);
      else if (isBullOrBoom) adjustment = severity * 4;
      risk = clamp(48 + adjustment + noise, 0, 100);
      break;
    }

    case 'bull': {
      // Base 75. On crash: +10 ("buy the dip"). On bull: +15. Rarely below 50.
      const isCrashOrCrisis = eventType === 'crash' || eventType === 'crisis';
      const isBullOrBoom = eventType === 'bull' || eventType === 'boom';
      let adjustment = 0;
      if (isCrashOrCrisis) adjustment = 10;  // contrarian — buy the dip
      else if (isBullOrBoom) adjustment = 15;
      risk = clamp(75 + adjustment + noise, 50, 100);
      break;
    }

    case 'fox': {
      // Round 1 → base 55. Subsequent: blend player's previous risk (60%) + own base 55 (40%), ±10.
      if (round === 1 || playerPreviousRisk === null) {
        risk = clamp(55 + noise, 0, 100);
      } else {
        const foxOffset = Math.random() * 20 - 10; // ±10
        risk = clamp(playerPreviousRisk * 0.6 + 55 * 0.4 + foxOffset, 0, 100);
      }
      break;
    }

    default: {
      risk = clamp(50 + noise, 0, 100);
    }
  }

  return Math.round(risk);
}

/** Return a random opponent personality ID. */
export function getRandomOpponent(): OpponentPersonalityId {
  const ids = Object.keys(OPPONENTS) as OpponentPersonalityId[];
  return ids[Math.floor(Math.random() * ids.length)];
}
