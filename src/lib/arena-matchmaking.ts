// Simple matchmaking queue for pitch mode
// Players enter the queue; the server pairs them into rooms automatically.

import { createRoom, joinRoom, setupRoom, getRoom, type ArenaRoom } from './arena-rooms';
import { MARKET_SCENARIOS } from '@/data/arena-scenarios';

interface QueueEntry {
  playerName: string;
  joinedAt: number;
  roomId?: string;
  role?: 'host' | 'guest';
  matched: boolean;
}

// The queue: key = a unique token, value = queue entry
const queue = new Map<string, QueueEntry>();

// Clean up old entries (>2 min)
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
 * If someone is already waiting, pair them immediately.
 * Otherwise, create a room and wait.
 */
export function enterQueue(playerName: string): {
  token: string;
  roomId: string;
  role: 'host' | 'guest';
  matched: boolean;
} {
  cleanup();

  // Look for an unmatched host waiting in the queue
  let waitingHost: { token: string; entry: QueueEntry } | null = null;
  for (const [token, entry] of queue) {
    if (!entry.matched && entry.role === 'host' && entry.roomId) {
      waitingHost = { token, entry };
      break;
    }
  }

  if (waitingHost) {
    // Join the waiting host's room
    const room = joinRoom(waitingHost.entry.roomId!, playerName);
    if (room) {
      // Mark host as matched
      waitingHost.entry.matched = true;

      // Auto-setup the room with a random scenario
      const scenario = MARKET_SCENARIOS[Math.floor(Math.random() * MARKET_SCENARIOS.length)];
      const rounds = scenario.events.slice(0, 8).map(e => ({
        title: e.title,
        description: e.description,
        type: e.type,
        severity: e.severity,
        assetImpacts: e.assetImpacts as Record<string, number>,
      }));
      // Pad to 8 rounds if needed
      while (rounds.length < 8) {
        rounds.push({
          title: 'Sideways Market',
          description: 'Markets move sideways with little change.',
          type: 'sideways',
          severity: 1,
          assetImpacts: { 'global-equity': 0.01, bonds: 0.005, gold: 0, cash: 0.001, bitcoin: -0.02, 'tech-growth': 0.015 },
        });
      }
      setupRoom(waitingHost.entry.roomId!, scenario.id, 20, rounds);

      const guestToken = generateToken();
      const guestEntry: QueueEntry = {
        playerName,
        joinedAt: Date.now(),
        roomId: waitingHost.entry.roomId!,
        role: 'guest',
        matched: true,
      };
      queue.set(guestToken, guestEntry);

      return {
        token: guestToken,
        roomId: waitingHost.entry.roomId!,
        role: 'guest',
        matched: true,
      };
    }
  }

  // No one waiting — create a room and wait
  const room = createRoom(playerName);
  const token = generateToken();
  const entry: QueueEntry = {
    playerName,
    joinedAt: Date.now(),
    roomId: room.id,
    role: 'host',
    matched: false,
  };
  queue.set(token, entry);

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
  if (!entry || !entry.roomId) return null;

  // Check if someone joined the room
  if (!entry.matched && entry.role === 'host') {
    const room = getRoom(entry.roomId);
    if (room && room.status !== 'waiting') {
      entry.matched = true;
    }
  }

  return {
    roomId: entry.roomId,
    role: entry.role!,
    matched: entry.matched,
  };
}
