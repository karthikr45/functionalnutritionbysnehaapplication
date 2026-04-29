import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { ALL_SERVICES_QUERY } from '@/sanity/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await client.fetch(ALL_SERVICES_QUERY);
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ services: [] });
  }
}
