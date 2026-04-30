import { client } from '@/sanity/lib/client';
import { LEGAL_PAGE_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import { format } from 'date-fns';

// Fallback content when Sanity has no data
const FALLBACKS: Record<string, { title: string; subtitle: string; content: string[] }> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your information.',
    content: [
      'This Privacy Policy explains how Gut Shell ("we", "us", "our") collects, uses, and protects your personal information when you use our website and services.',
      'Information We Collect: We collect information you provide directly (name, email, phone, health data, payment details) and information automatically (cookies, browser data, usage analytics).',
      'How We Use Information: To provide consultation services, process payments, send appointment reminders, personalize your experience, and comply with legal obligations.',
      'Data Security: We use industry-standard encryption (SSL/TLS), secure payment processors (Razorpay), and hashed passwords. Your medical information is protected under applicable health privacy laws.',
      'Data Sharing: We never sell your data. We share data only with payment processors for transactions, cloud storage providers (Cloudinary) for documents, and as required by law.',
      'Your Rights: You can access, update, or delete your data anytime from your dashboard. Contact us at gutshell.com@gmail.com for data deletion requests.',
      'Contact: For privacy questions, email gutshell.com@gmail.com',
      'This policy is subject to Indian data protection laws including the Information Technology Act, 2000 and its rules.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Terms and conditions for using our services.',
    content: [
      'By accessing or using Gut Shell, you agree to these Terms of Service. If you do not agree, please do not use the service.',
      'Services: We provide nutrition consultations, diet plans, supplements, and wellness programs. Our services are NOT a substitute for medical advice. Always consult a qualified medical professional for medical conditions.',
      'Account: You must be 18+ or have parental consent. You are responsible for keeping your login credentials secure. We may suspend accounts for violations of these terms.',
      'Payments: All payments are processed securely via Razorpay. Package validity periods start from purchase date. Unused sessions expire as per package terms.',
      'Consultation Rules: Appointments can be rescheduled up to 24 hours in advance from your dashboard. Late cancellations may not be refundable. Recording sessions requires written consent.',
      'Intellectual Property: All content (diet plans, recipes, articles) is the intellectual property of Gut Shell. Redistribution without permission is prohibited.',
      'Liability: We are not liable for any adverse health outcomes. Nutrition plans are suggestions based on the information you provide. Individual results vary.',
      'Governing Law: These terms are governed by Indian law. Disputes will be resolved in the courts of India.',
      'Contact: For questions, email gutshell.com@gmail.com',
    ],
  },
  refund: {
    title: 'Refund Policy',
    subtitle: 'Our policy on refunds and cancellations.',
    content: [
      'We strive to provide excellent service. If you are not satisfied, please review our refund policy below.',
      'Consultation Refunds: Initial consultations are refundable within 24 hours of payment if not yet attended. Partially used packages are non-refundable.',
      'Package Refunds: Unused package sessions are refundable within 7 days of purchase, minus a 10% processing fee. After 7 days, packages become non-refundable.',
      'Product Orders: Products can be returned within 7 days of delivery if unopened and in original condition. Refunds are processed within 5-10 business days after we receive the returned product.',
      'Cancellation Fees: If you cancel an appointment less than 24 hours in advance, you may forfeit that session. Cancellations 24+ hours in advance are free of charge.',
      'How to Request a Refund: Email gutshell.com@gmail.com with your order/appointment number and reason. We will respond within 2 business days.',
      'Refund Processing: Approved refunds are processed to the original payment method within 5-10 business days. Refund timelines depend on your bank.',
      'Non-Refundable Items: Personalized diet plans once delivered, digital content downloads, and opened/used supplements are non-refundable.',
      'Contact: For refund requests, email gutshell.com@gmail.com',
    ],
  },
};

interface Props {
  pageType: 'privacy' | 'terms' | 'refund';
}

async function fetchPage(pageType: string) {
  try {
    return await client.fetch(LEGAL_PAGE_QUERY, { pageType });
  } catch {
    return null;
  }
}

export default async function LegalPageContent({ pageType }: Props) {
  const page = await fetchPage(pageType);
  const fallback = FALLBACKS[pageType];
  const title = page?.title || fallback.title;
  const subtitle = page?.subtitle || fallback.subtitle;
  const lastUpdated = page?.lastUpdated || new Date().toISOString();

  return (
    <div>
      <section className="bg-gradient-to-br from-cream-dark to-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">{title}</h1>
          <p className="text-gray-600 mt-3 text-lg">{subtitle}</p>
          <p className="text-sm text-gray-400 mt-2">
            Last updated: {format(new Date(lastUpdated), 'dd MMMM yyyy')}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {page?.content ? (
          <div className="prose prose-lg prose-headings:font-serif prose-headings:text-gray-900 max-w-none">
            <PortableText value={page.content} />
          </div>
        ) : (
          <div className="space-y-5 text-gray-700 leading-relaxed">
            {fallback.content.map((para, i) => {
              const colonIdx = para.indexOf(':');
              if (colonIdx > 0 && colonIdx < 40) {
                return (
                  <p key={i}>
                    <strong className="text-gray-900">{para.substring(0, colonIdx + 1)}</strong>
                    {para.substring(colonIdx + 1)}
                  </p>
                );
              }
              return <p key={i}>{para}</p>;
            })}
          </div>
        )}

        <div className="mt-12 p-6 bg-primary-50 rounded-2xl border border-primary-100">
          <p className="text-sm text-primary-800">
            Have questions about this policy? Email us at{' '}
            <a href="mailto:gutshell.com@gmail.com" className="font-semibold underline">
              gutshell.com@gmail.com
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}
