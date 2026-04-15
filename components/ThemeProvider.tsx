'use client';

// Theme is now loaded server-side in app/layout.tsx to prevent FOUC (Flash of Unstyled Content).
// This component is kept as a passthrough so existing imports still work.
// Live preview updates for the theme picker use generatePalette from lib/theme directly.

export { generatePalette, hexToHsl } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
