import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { ALL_VIDEOS_QUERY } from '@/sanity/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const videos = await client.fetch(ALL_VIDEOS_QUERY, {}, { cache: 'no-store' });
    return NextResponse.json(
      { videos },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    );
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
