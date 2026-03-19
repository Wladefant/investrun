import { NextResponse } from 'next/server';
import {
  getRoom,
  joinRoom,
  setupRoom,
  submitDecision,
  advanceRound,
  nextRound,
} from '@/lib/arena-rooms';

export const dynamic = 'force-dynamic';

// GET /api/arena/rooms/[roomId] — poll room state
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const room = getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  return NextResponse.json({ room });
}

// POST /api/arena/rooms/[roomId] — perform actions on the room
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'join': {
      const { guestName } = body;
      if (!guestName) return NextResponse.json({ error: 'guestName required' }, { status: 400 });
      const room = joinRoom(roomId, guestName);
      if (!room) return NextResponse.json({ error: 'Cannot join room' }, { status: 400 });
      return NextResponse.json({ room });
    }

    case 'setup': {
      const { scenarioId, timeHorizon, rounds } = body;
      const room = setupRoom(roomId, scenarioId, timeHorizon, rounds);
      if (!room) return NextResponse.json({ error: 'Cannot setup room' }, { status: 400 });
      return NextResponse.json({ room });
    }

    case 'decide': {
      const { player, risk } = body;
      const result = submitDecision(roomId, player, risk);
      if (!result) return NextResponse.json({ error: 'Cannot submit decision' }, { status: 400 });
      return NextResponse.json({ room: result.room, bothReady: result.bothReady });
    }

    case 'advance': {
      const { hostValue, guestValue } = body;
      const room = advanceRound(roomId, hostValue, guestValue);
      if (!room) return NextResponse.json({ error: 'Cannot advance' }, { status: 400 });
      return NextResponse.json({ room });
    }

    case 'next_round': {
      const room = nextRound(roomId);
      if (!room) return NextResponse.json({ error: 'Cannot advance round' }, { status: 400 });
      return NextResponse.json({ room });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
