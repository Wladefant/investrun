import { NextResponse } from 'next/server';
import { enterQueue, checkQueue } from '@/lib/arena-matchmaking';

export const dynamic = 'force-dynamic';

// POST /api/arena/matchmake — enter the matchmaking queue
// GET /api/arena/matchmake?token=xxx — check matchmaking status
export async function POST(request: Request) {
  try {
    const { playerName } = await request.json();
    if (!playerName) {
      return NextResponse.json({ error: 'playerName is required' }, { status: 400 });
    }
    const result = enterQueue(playerName);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Matchmake error:', error);
    return NextResponse.json({ error: 'Failed to matchmake' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }
    const result = checkQueue(token);
    if (!result) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Matchmake check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
