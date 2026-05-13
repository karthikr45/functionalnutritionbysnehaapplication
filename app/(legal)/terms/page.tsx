import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms governing the use of Gut Shell — consultations, packages, payments, and refunds.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalPageContent pageType="terms" />;
}
