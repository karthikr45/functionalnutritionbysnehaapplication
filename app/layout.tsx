import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/ThemeProvider';
import { prisma } from '@/lib/prisma';
import { generatePalette, paletteToCss } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Gut Shell — Heal from the Root Cause',
  description:
    'Personalized functional nutrition consultations. Science-backed diet plans for PCOS, thyroid, gut health, diabetes, weight management, and more. Book online consultations today.',
  keywords: 'functional nutrition, nutritionist, PCOS diet, thyroid nutrition, gut health, weight loss, diabetes diet, online consultation, India, Gut Shell',
  openGraph: {
    title: 'Gut Shell',
    description: 'Heal from the root cause with personalized, science-backed functional nutrition. Book your consultation today.',
    type: 'website',
  },
};

async function getThemeColor(): Promise<string> {
  try {
    const theme = await prisma.themeSettings.findUnique({ where: { id: 'global' } });
    return theme?.primaryColor || '#636B2F';
  } catch {
    return '#636B2F';
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const primaryColor = await getThemeColor();
  const palette = generatePalette(primaryColor);
  const cssVars = paletteToCss(palette);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject theme CSS variables BEFORE render to prevent FOUC */}
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
      </head>
      <body>
        <Providers>
          <ThemeProvider>
          {children}
          </ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
