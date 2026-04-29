import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await client.fetch(`*[_type == "siteSettings"][0] {
      "logo": logo.asset->url,
      instagramUrl,
      youtubeUrl,
      linkedinUrl,
      facebookUrl,
      contactEmail,
      contactPhone,
      whatsappNumber,
      consultationHours,
      consultationMode
    }`);
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ settings: null, error: err.message });
  }
}
