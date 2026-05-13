import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/ThemeProvider';
import JsonLd from '@/components/JsonLd';
import { prisma } from '@/lib/prisma';
import { generatePalette, paletteToCss } from '@/lib/theme';

const SITE_URL = 'https://gutshell.com';
const ORG_NAME = 'Gut Shell';

// Site-wide structured data — Organization + LocalBusiness merged so
// Google can present rich brand info, hours, and contact on SERPs.
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: ORG_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      sameAs: [] as string[], // populate with Instagram/YouTube/etc. URLs if available
      description: 'Personalized functional nutrition consultations for gut health, PCOS, thyroid, diabetes, weight management and more.',
    },
    {
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}#business`,
      name: ORG_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image`,
      priceRange: '₹₹',
      areaServed: { '@type': 'Country', name: 'India' },
      availableLanguage: ['English', 'Hindi'],
      medicalSpecialty: [
        'Nutrition',
        'Dietetics',
        'Gastroenterology',
        'Endocrinology',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: ORG_NAME,
      publisher: { '@id': `${SITE_URL}#organization` },
      inLanguage: 'en-IN',
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gutshell.com'),
  title: {
    default: 'Gut Shell — Heal from the Root Cause',
    template: '%s | Gut Shell',
  },
  description:
    'Personalized functional nutrition consultations. Science-backed diet plans for PCOS, thyroid, gut health, diabetes, weight management, and more. Book online consultations today.',
  keywords: [
    'functional nutrition',
    'nutritionist India',
    'dietitian online',
    'PCOS diet plan',
    'thyroid nutrition',
    'gut health',
    'gut reset',
    'weight loss program',
    'diabetes diet',
    'metabolic health',
    'pregnancy nutrition',
    'online nutritionist',
    'Gut Shell',
    'Sneha Agarwal',
  ],
  authors: [{ name: 'Gut Shell' }],
  creator: 'Gut Shell',
  publisher: 'Gut Shell',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://gutshell.com',
    siteName: 'Gut Shell',
    title: 'Gut Shell — Heal from the Root Cause',
    description: 'Heal from the root cause with personalized, science-backed functional nutrition. Book your consultation today.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gut Shell — Heal from the Root Cause',
    description: 'Personalized functional nutrition consultations for PCOS, thyroid, gut health, diabetes & more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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
        <JsonLd data={orgJsonLd} />
      </head>
      <body className="overflow-x-hidden">
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
