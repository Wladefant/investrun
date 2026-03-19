import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/arena-rooms';

export const dynamic = 'force-dynamic';

// POST /api/arena/rooms — create a new multiplayer room
export async function POST(request: Request) {
  try {
    const { hostName } = await request.json();
    if (!hostName) {
      return NextResponse.json({ error: 'hostName is required' }, { status: 400 });
    }
    const room = createRoom(hostName);
    return NextResponse.json({ roomId: room.id, room });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
