import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!DAILY_API_KEY) {
    return NextResponse.json({ error: 'Daily.co API key not configured' }, { status: 500 });
  }

  const { appointmentId, userName } = await req.json();
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });

  const roomName = `fns-${appointmentId}`;
  const isDoctor = session.user.role === 'DOCTOR';

  try {
    // Try to get existing room first
    let roomUrl: string;
    const getRes = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
    });

    if (getRes.ok) {
      const room = await getRes.json();
      roomUrl = room.url;
    } else {
      // Create new room
      const exp = Math.round(Date.now() / 1000) + 2 * 60 * 60; // 2 hours
      const createRes = await fetch(`${DAILY_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'public',
          properties: {
            exp,
            max_participants: 4,
            enable_chat: true,
            enable_screenshare: true,
            enable_knocking: false,
            start_video_off: false,
            start_audio_off: false,
          },
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        return NextResponse.json({ error: err.info || 'Failed to create room' }, { status: 500 });
      }

      const room = await createRes.json();
      roomUrl = room.url;
    }

    // Create a meeting token for the user
    const tokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName || session.user.name || 'User',
          is_owner: isDoctor,
          exp: Math.round(Date.now() / 1000) + 2 * 60 * 60,
        },
      }),
    });

    const tokenData = await tokenRes.json();

    return NextResponse.json({
      roomUrl,
      token: tokenData.token,
      roomName,
    });
  } catch (err: any) {
    console.error('[daily] Error:', err);
    return NextResponse.json({ error: 'Failed to setup video call' }, { status: 500 });
  }
}
