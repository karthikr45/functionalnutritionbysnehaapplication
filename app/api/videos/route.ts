import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { ALL_VIDEOS_QUERY } from '@/sanity/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const videos = await client.fetch(ALL_VIDEOS_QUERY);
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
