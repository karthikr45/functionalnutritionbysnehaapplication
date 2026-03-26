import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Functional Nutrition by Sneha — Heal from the Root Cause',
  description:
    'Personalized functional nutrition consultations by Sneha. Science-backed diet plans for PCOS, thyroid, gut health, diabetes, weight management, and more. Book online consultations today.',
  keywords: 'functional nutrition, nutritionist, PCOS diet, thyroid nutrition, gut health, weight loss, diabetes diet, online consultation, India, Sneha',
  openGraph: {
    title: 'Functional Nutrition by Sneha',
    description: 'Heal from the root cause with personalized, science-backed functional nutrition. Book your consultation today.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
