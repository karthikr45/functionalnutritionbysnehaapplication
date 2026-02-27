import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'NutritionCare — Personalized Nutrition by Dr. Priya Sharma',
  description:
    'Get expert, personalized nutrition guidance from Dr. Priya Sharma, a certified Clinical Nutritionist with 10+ years of experience. Book online consultations for weight management, diabetes, PCOS, and more.',
  keywords: 'nutritionist, dietitian, online consultation, weight loss, diabetes diet, PCOS nutrition, India',
  openGraph: {
    title: 'NutritionCare — Personalized Nutrition',
    description: 'Transform your health through expert nutrition guidance.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
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
