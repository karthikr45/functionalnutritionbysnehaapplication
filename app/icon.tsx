import { ImageResponse } from 'next/og';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

// Note: removed 'edge' runtime — we need full Node runtime to fetch
// from Sanity reliably. Slight startup cost; cached after first hit.
export const size = { width: 256, height: 256 };
export const contentType = 'image/png';

export default async function Icon() {
  let logoUrl: string | null = null;
  try {
    const settings = await client.fetch(SITE_SETTINGS_QUERY);
    logoUrl = settings?.logo || null;
  } catch {
    /* fall back to monogram */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Gut Shell"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #636B2F 0%, #4d5424 100%)',
              color: '#FAF6EE',
              fontSize: 140,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              fontFamily: 'serif',
            }}
          >
            gs
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
