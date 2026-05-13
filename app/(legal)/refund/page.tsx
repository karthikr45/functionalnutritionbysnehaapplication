import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = {
  title: 'Refund Policy',
  description: 'Refund eligibility, timelines, and process for consultations, programs, and products purchased from Gut Shell.',
  alternates: { canonical: '/refund' },
};

export default function RefundPage() {
  return <LegalPageContent pageType="refund" />;
}
