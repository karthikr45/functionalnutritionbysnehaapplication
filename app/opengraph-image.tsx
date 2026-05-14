import { ImageResponse } from 'next/og';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

export const alt = 'Gut Shell — Heal from the Root Cause';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  let logoUrl: string | null = null;
  try {
    const settings = await client.fetch(SITE_SETTINGS_QUERY);
    logoUrl = settings?.logo || null;
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #76754F 0%, #5C5B3A 100%)',
          color: '#FAF6EE',
          fontFamily: 'serif',
        }}
      >
        {/* Left: text */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.85, marginBottom: 28 }}>
            Gut Shell · by Sneha
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 500,
              lineHeight: 1.05,
              color: '#FFFFFF',
              display: 'flex',
            }}
          >
            Heal from the root cause.
          </div>
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              marginTop: 28,
              maxWidth: 700,
              fontFamily: 'sans-serif',
              display: 'flex',
              lineHeight: 1.35,
            }}
          >
            Personalized functional nutrition for gut health, PCOS, thyroid, diabetes &amp; weight.
          </div>
        </div>

        {/* Right: logo on a soft circle */}
        {logoUrl && (
          <div
            style={{
              width: 360,
              height: 360,
              borderRadius: 360,
              background: '#FAF6EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Gut Shell"
              style={{ width: '88%', height: '88%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
