// Shared theme utilities — used both server-side and client-side

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePalette(baseHex: string): Record<string, string> {
  const [h, s] = hexToHsl(baseHex);
  return {
    '--primary-50':  hslToHex(h, Math.min(s, 40), 97),
    '--primary-100': hslToHex(h, Math.min(s, 45), 93),
    '--primary-200': hslToHex(h, Math.min(s, 50), 85),
    '--primary-300': hslToHex(h, Math.min(s, 55), 72),
    '--primary-400': hslToHex(h, Math.min(s, 60), 60),
    '--primary-500': hslToHex(h, s, 48),
    '--primary-600': baseHex,
    '--primary-700': hslToHex(h, s, 35),
    '--primary-800': hslToHex(h, s, 28),
    '--primary-900': hslToHex(h, s, 22),
  };
}

export function paletteToCss(palette: Record<string, string>): string {
  return Object.entries(palette)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}
