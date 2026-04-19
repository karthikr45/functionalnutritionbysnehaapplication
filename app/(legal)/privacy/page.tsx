import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = { title: 'Privacy Policy — Functional Nutrition by Sneha' };

export default function PrivacyPage() {
  return <LegalPageContent pageType="privacy" />;
}
