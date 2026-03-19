// In-memory room store for multiplayer Arena
// Rooms are ephemeral — they live only as long as the server process runs.
// This is perfect for hackathon demos.

import type { ScenarioEvent } from '@/data/arena-scenarios';

export interface ArenaRoom {
  id: string;
  hostName: string;
  guestName: string | null;
  status: 'waiting' | 'ready' | 'setup' | 'playing' | 'reveal' | 'finished';
  scenarioId: string | null;
  timeHorizon: 20 | 30 | 40;
  currentRound: number;
  totalRounds: number;

  // Per-round decisions (index = round - 1)
  hostDecisions: number[];
  guestDecisions: number[];

  // Portfolio values (index 0 = starting capital, then one per round)
  hostPortfolio: number[];
  guestPortfolio: number[];

  // Current round: null means not yet decided
  hostCurrentDecision: number | null;
  guestCurrentDecision: number | null;

  // Round events (precomputed when setup completes)
  rounds: Array<{
    title: string;
    description: string;
    type: string;
    severity: number;
    assetImpacts: Record<string, number>;
  }>;

  createdAt: number;
}

// Global room store
const rooms = new Map<string, ArenaRoom>();

// Clean up rooms older than 30 minutes
function cleanupOldRooms() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > 30 * 60 * 1000) {
      rooms.delete(id);
    }
  }
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function createRoom(hostName: string): ArenaRoom {
  cleanupOldRooms();
  let id = generateRoomId();
  while (rooms.has(id)) id = generateRoomId();

  const room: ArenaRoom = {
    id,
    hostName,
    guestName: null,
    status: 'waiting',
    scenarioId: null,
    timeHorizon: 30,
    currentRound: 0,
    totalRounds: 8,
    hostDecisions: [],
    guestDecisions: [],
    hostPortfolio: [10000],
    guestPortfolio: [10000],
    hostCurrentDecision: null,
    guestCurrentDecision: null,
    rounds: [],
    createdAt: Date.now(),
  };

  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): ArenaRoom | undefined {
  return rooms.get(id.toUpperCase());
}

export function joinRoom(id: string, guestName: string): ArenaRoom | null {
  const room = rooms.get(id.toUpperCase());
  if (!room || room.status !== 'waiting') return null;
  room.guestName = guestName;
  room.status = 'ready';
  return room;
}

export function setupRoom(
  id: string,
  scenarioId: string,
  timeHorizon: 20 | 30 | 40,
  rounds: ArenaRoom['rounds'],
): ArenaRoom | null {
  const room = rooms.get(id.toUpperCase());
  if (!room || room.status !== 'ready') return null;
  room.scenarioId = scenarioId;
  room.timeHorizon = timeHorizon;
  room.rounds = rounds;
  room.currentRound = 1;
  room.status = 'playing';
  room.hostPortfolio = [10000];
  room.guestPortfolio = [10000];
  return room;
}

export function submitDecision(
  id: string,
  player: 'host' | 'guest',
  risk: number,
): { room: ArenaRoom; bothReady: boolean } | null {
  const room = rooms.get(id.toUpperCase());
  if (!room || room.status !== 'playing') return null;

  if (player === 'host') room.hostCurrentDecision = risk;
  else room.guestCurrentDecision = risk;

  const bothReady = room.hostCurrentDecision !== null && room.guestCurrentDecision !== null;
  return { room, bothReady };
}

export function advanceRound(id: string, hostValue: number, guestValue: number): ArenaRoom | null {
  const room = rooms.get(id.toUpperCase());
  if (!room) return null;

  // Store decisions
  room.hostDecisions.push(room.hostCurrentDecision!);
  room.guestDecisions.push(room.guestCurrentDecision!);
  room.hostPortfolio.push(hostValue);
  room.guestPortfolio.push(guestValue);

  // Reset current decisions
  room.hostCurrentDecision = null;
  room.guestCurrentDecision = null;

  // Move to reveal
  room.status = 'reveal';
  return room;
}

export function nextRound(id: string): ArenaRoom | null {
  const room = rooms.get(id.toUpperCase());
  if (!room) return null;

  if (room.currentRound >= room.totalRounds) {
    room.status = 'finished';
  } else {
    room.currentRound++;
    room.status = 'playing';
  }
  return room;
}

export function deleteRoom(id: string): void {
  rooms.delete(id.toUpperCase());
}
