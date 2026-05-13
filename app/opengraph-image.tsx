import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Gut Shell — Heal from the Root Cause';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #76754F 0%, #5C5B3A 100%)',
          color: '#FAF6EE',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: '#FAF6EE',
              color: '#4d5424',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: '-0.04em',
            }}
          >
            gs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.85 }}>
              Gut Shell
            </div>
            <div style={{ fontSize: 20, opacity: 0.7, fontFamily: 'sans-serif', marginTop: 4 }}>
              by Sneha
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 500,
            lineHeight: 1.05,
            maxWidth: 1000,
            color: '#FFFFFF',
            display: 'flex',
          }}
        >
          Heal from the root cause.
        </div>
        <div
          style={{
            fontSize: 32,
            opacity: 0.85,
            marginTop: 32,
            maxWidth: 900,
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          Personalized functional nutrition for gut health, PCOS, thyroid, diabetes &amp; weight.
        </div>
      </div>
    ),
    { ...size },
  );
}
