import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    // First check if any siteSettings documents exist at all
    const allDocs = await client.fetch(`*[_type == "siteSettings"]{ _id, _type, "logo": logo.asset->url }`);

    const settings = await client.fetch(`*[_type == "siteSettings"][0] { "logo": logo.asset->url }`);

    return NextResponse.json({
      settings,
      debug: {
        totalDocs: allDocs?.length || 0,
        allDocs,
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ settings: null, error: err.message });
  }
}
