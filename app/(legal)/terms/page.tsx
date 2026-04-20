import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = { title: 'Terms of Service — Gut Shell' };

export default function TermsPage() {
  return <LegalPageContent pageType="terms" />;
}
