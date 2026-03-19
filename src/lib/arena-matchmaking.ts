// Simple matchmaking queue for pitch mode
// Players enter the queue; the server pairs them into rooms automatically.

import { createRoom, joinRoom, setupRoom, getRoom, type ArenaRoom } from './arena-rooms';
import { MARKET_SCENARIOS } from '@/data/arena-scenarios';

interface QueueEntry {
  playerName: string;
  joinedAt: number;
  roomId: string;
  role: 'host' | 'guest';
}

// The queue — only contains UNMATCHED waiting hosts.
// Once paired, both entries are removed immediately.
const globalForQueue = globalThis as typeof globalThis & {
  __arenaMatchQueue?: Map<string, QueueEntry>;
};
if (!globalForQueue.__arenaMatchQueue) {
  globalForQueue.__arenaMatchQueue = new Map<string, QueueEntry>();
}
const queue = globalForQueue.__arenaMatchQueue;

// Clean up entries older than 2 minutes (stale hosts who left)
function cleanup() {
  const now = Date.now();
  for (const [token, entry] of queue) {
    if (now - entry.joinedAt > 2 * 60 * 1000) {
      queue.delete(token);
    }
  }
}

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Enter the matchmaking queue.
 * If an unmatched host is waiting, pair with them immediately.
 * Otherwise, become a host and wait.
 */
export function enterQueue(playerName: string): {
  token: string;
  roomId: string;
  role: 'host' | 'guest';
  matched: boolean;
} {
  cleanup();

  // Find the first unmatched waiting host
  let waitingHostToken: string | null = null;
  let waitingHostEntry: QueueEntry | null = null;
  for (const [token, entry] of queue) {
    if (entry.role === 'host') {
      // Verify the room still exists and is waiting
      const room = getRoom(entry.roomId);
      if (room && room.status === 'waiting') {
        waitingHostToken = token;
        waitingHostEntry = entry;
        break;
      } else {
        // Stale entry — room gone or already used. Remove it.
        queue.delete(token);
      }
    }
  }

  if (waitingHostToken && waitingHostEntry) {
    // Pair with the waiting host
    const room = joinRoom(waitingHostEntry.roomId, playerName);
    if (room) {
      // Remove the host from the queue — they're matched now
      queue.delete(waitingHostToken);

      // Auto-setup the room with a random scenario
      const scenario = MARKET_SCENARIOS[Math.floor(Math.random() * MARKET_SCENARIOS.length)];
      const rounds = scenario.events.slice(0, 8).map(e => ({
        title: e.title,
        description: e.description,
        type: e.type,
        severity: e.severity,
        assetImpacts: e.assetImpacts as Record<string, number>,
      }));
      while (rounds.length < 8) {
        rounds.push({
          title: 'Sideways Market',
          description: 'Markets move sideways with little change.',
          type: 'sideways',
          severity: 1,
          assetImpacts: { 'global-equity': 0.01, bonds: 0.005, gold: 0, cash: 0.001, bitcoin: -0.02, 'tech-growth': 0.015 },
        });
      }
      setupRoom(waitingHostEntry.roomId, scenario.id, 20, rounds);

      // Guest doesn't need to be in the queue — they're matched
      const guestToken = generateToken();
      return {
        token: guestToken,
        roomId: waitingHostEntry.roomId,
        role: 'guest',
        matched: true,
      };
    }
  }

  // No one waiting — create a room and wait as host
  const room = createRoom(playerName);
  const token = generateToken();
  queue.set(token, {
    playerName,
    joinedAt: Date.now(),
    roomId: room.id,
    role: 'host',
  });

  return {
    token,
    roomId: room.id,
    role: 'host',
    matched: false,
  };
}

/**
 * Check matchmaking status by token.
 */
export function checkQueue(token: string): {
  roomId: string;
  role: 'host' | 'guest';
  matched: boolean;
} | null {
  const entry = queue.get(token);
  if (!entry) return null;

  // Check if someone joined our room (host waiting → room no longer 'waiting')
  const room = getRoom(entry.roomId);
  if (!room) {
    queue.delete(token);
    return null;
  }

  const matched = room.status !== 'waiting';
  if (matched) {
    // We're matched — remove from queue
    queue.delete(token);
  }

  return {
    roomId: entry.roomId,
    role: entry.role,
    matched,
  };
}
