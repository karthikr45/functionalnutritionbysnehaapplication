'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What is Gut Shell and how is it different from regular dieting?',
    answer:
      'Gut Shell focuses on identifying and addressing the root cause of your health issues — not just the symptoms. Unlike regular dieting that focuses on calorie counting, I analyze your lab reports, gut health, hormonal balance, lifestyle, and food sensitivities to create a holistic, personalized plan that heals your body from within.',
  },
  {
    question: 'Do I need to eat special or expensive foods?',
    answer:
      'Absolutely not! All my diet plans are based on everyday Indian food — dal, roti, rice, sabzi, curd, fruits, and local ingredients. I believe healing should be accessible and practical. You won\'t need any imported superfoods or expensive supplements unless absolutely necessary based on your lab work.',
  },
  {
    question: 'How are consultations conducted?',
    answer:
      'All consultations are conducted online via video call (Google Meet or Zoom). This makes it convenient for clients across India and internationally. Your personalized diet plan, recipes, and reports are shared via email and WhatsApp after each session.',
  },
  {
    question: 'How soon will I see results?',
    answer:
      'Most clients start noticing improvements in energy, digestion, and overall well-being within 2-3 weeks. For conditions like PCOS, thyroid, and diabetes, significant improvements in lab markers are typically seen within 2-3 months. Sustainable weight loss usually happens at 2-4 kg per month.',
  },
  {
    question: 'Can you help with multiple health conditions at once?',
    answer:
      'Yes! In fact, most clients come with interconnected issues — for example, PCOS often comes with weight gain, acne, and gut issues. The functional nutrition approach addresses the underlying imbalance that connects all these symptoms, so improving one often improves everything.',
  },
  {
    question: 'What if I have food allergies or am vegetarian/vegan?',
    answer:
      'I cater to all dietary preferences — vegetarian, vegan, eggetarian, non-vegetarian, Jain, and specific religious dietary requirements. Food allergies and sensitivities are a core part of the assessment, and your plan will be fully customized around your needs.',
  },
  {
    question: 'Do I need to share my lab reports?',
    answer:
      'Sharing recent lab reports (within 3-6 months) is highly recommended as it helps me understand your current health status and design a more effective plan. If you don\'t have recent reports, I may recommend specific tests based on your health concerns.',
  },
  {
    question: 'What is included in the WhatsApp support?',
    answer:
      'WhatsApp support means you can reach out to me for quick questions, meal swap suggestions, eating out guidance, doubt clarifications, and progress updates between sessions. Response time is typically within a few hours during working days.',
  },
  {
    question: 'Can I cancel or reschedule my appointment?',
    answer:
      'Yes, you can reschedule or cancel your appointment up to 24 hours before the scheduled time from your dashboard. Package sessions remain valid throughout the validity period, so you can book them at your convenience.',
  },
  {
    question: 'Is this suitable for children and elderly?',
    answer:
      'Yes! I work with clients of all age groups — from toddlers to senior citizens. Pediatric nutrition plans focus on growth, immunity, and development. For elderly clients, plans address age-related conditions, bone health, and medication-nutrition interactions.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-cream-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Everything you need to know before starting your health journey with functional nutrition.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
