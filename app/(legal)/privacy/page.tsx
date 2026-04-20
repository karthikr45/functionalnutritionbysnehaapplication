import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = { title: 'Privacy Policy — Gut Shell' };

export default function PrivacyPage() {
  return <LegalPageContent pageType="privacy" />;
}
