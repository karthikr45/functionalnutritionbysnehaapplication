import LegalPageContent from '@/components/LegalPage';

export const revalidate = 60;

export const metadata = { title: 'Refund Policy — Gut Shell' };

export default function RefundPage() {
  return <LegalPageContent pageType="refund" />;
}
