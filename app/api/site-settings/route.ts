import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    const settings = await client.fetch(`*[_type == "siteSettings"][0] { "logo": logo.asset->url }`);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: null });
  }
}
