import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #636B2F 0%, #4d5424 100%)',
          color: '#FAF6EE',
          fontSize: 100,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          fontFamily: 'serif',
        }}
      >
        gs
      </div>
    ),
    { ...size },
  );
}
