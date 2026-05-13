import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Gut Shell collects, uses, and protects your personal and health information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalPageContent pageType="privacy" />;
}
