import { client } from '@/sanity/lib/client';
import { SERVICE_BY_SLUG_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePackages from './ServicePackages';
import { notFound } from 'next/navigation';

// Fallback service data when Sanity isn't configured
const fallbackData: Record<string, any> = {
  'gut-reset-program': {
    title: 'Gut Reset Program',
    subtitle: 'Start your journey to lasting wellness today. True healing begins within.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=600&fit=crop',
    description: 'Our Gut Reset Program is a comprehensive functional nutrition protocol designed to heal your gut from the inside out. Using evidence-based strategies, we address the root causes of digestive issues including IBS, bloating, acid reflux, food sensitivities, and leaky gut syndrome.',
    benefits: ['Eliminate chronic bloating and gas', 'Improve nutrient absorption', 'Strengthen immune function', 'Reduce food sensitivities', 'Restore healthy gut bacteria', 'Improve mental clarity and energy'],
    conditions: ['IBS (Irritable Bowel Syndrome)', 'Chronic Bloating', 'Acid Reflux / GERD', 'Leaky Gut Syndrome', 'Food Sensitivities', 'Constipation / Diarrhea'],
  },
  'weight-management': {
    title: 'Weight Management',
    subtitle: 'Sustainable weight loss through personalized nutrition — no crash diets.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop',
    description: 'Our Weight Management program goes beyond calorie counting. We use a functional nutrition approach to understand your unique metabolism, hormonal balance, and lifestyle factors to create a sustainable plan that delivers lasting results with real Indian food.',
    benefits: ['Sustainable weight loss without crash diets', 'Improved metabolism and energy', 'Balanced hormones for better weight control', 'Personalized Indian meal plans', 'Better relationship with food', 'Long-term lifestyle transformation'],
    conditions: ['Obesity', 'Stubborn Weight Gain', 'Slow Metabolism', 'Hormonal Weight Gain', 'Emotional Eating', 'Post-pregnancy Weight'],
  },
  'metabolic-health-program': {
    title: 'Metabolic Health Program',
    subtitle: 'Diabetes / PCOS / Thyroid Imbalances / Cardiac Health (High Cholesterol)',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=600&fit=crop',
    description: 'Our Metabolic Health Program addresses the interconnected web of metabolic disorders including diabetes, PCOS, thyroid imbalances, and cardiovascular health. Through targeted nutrition interventions, we aim to reduce medication dependency and restore your body\'s natural metabolic balance.',
    benefits: ['Better blood sugar control', 'Improved thyroid function', 'PCOS symptom management', 'Reduced cholesterol levels', 'Lower medication dependency', 'Increased energy and vitality'],
    conditions: ['Type 2 Diabetes', 'Pre-diabetes', 'PCOS', 'Hypothyroidism', 'Hyperthyroidism', 'High Cholesterol', 'Hypertension'],
  },
  'pregnancy-nutrition': {
    title: 'Pregnancy Nutrition',
    subtitle: 'Comprehensive nutrition support for pre-conception, pregnancy & postpartum.',
    image: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=1200&h=600&fit=crop',
    description: 'Our Pregnancy Nutrition program provides expert dietary guidance through every stage — from pre-conception planning to pregnancy and postpartum recovery. We ensure optimal nutrition for both mother and baby, addressing common concerns like morning sickness, gestational diabetes, and healthy weight gain.',
    benefits: ['Optimal fetal development', 'Manage pregnancy-related conditions', 'Healthy weight gain guidance', 'Postpartum recovery nutrition', 'Lactation support', 'Energy and mood balance'],
    conditions: ['Pre-conception Planning', 'Morning Sickness', 'Gestational Diabetes', 'Pregnancy Anemia', 'Postpartum Recovery', 'Lactation Support'],
  },
  'personalized-nutrition-plan': {
    title: 'One-Time Personalized Nutrition Plan',
    subtitle: 'A complete nutrition blueprint tailored to your unique health needs.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=600&fit=crop',
    description: 'Perfect for those who want a comprehensive, one-time nutrition assessment. You\'ll receive a detailed personalized nutrition plan including meal plans, grocery lists, recipes, and supplement recommendations — all tailored to your specific health goals, food preferences, and lifestyle.',
    benefits: ['Complete health assessment', 'Personalized 7-day meal plan', 'Grocery list and recipes', 'Supplement recommendations', 'Lab report interpretation', 'Lifestyle modification guide'],
    conditions: ['General Wellness', 'Preventive Health', 'Energy Optimization', 'Skin Health', 'Sleep Improvement', 'Stress Management'],
  },
  'group-program': {
    title: 'Group Program',
    subtitle: '4-Week PCOS Empowerment Program',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop',
    description: 'Join our supportive community-based group programs led by Sneha. Our flagship 4-Week PCOS Empowerment Program brings together women dealing with PCOS for guided nutrition education, meal planning, accountability, and peer support. Transform your health alongside others on the same journey.',
    benefits: ['Community support and accountability', 'Weekly live sessions with Sneha', 'Group meal planning workshops', 'Exclusive recipe collections', 'Progress tracking together', 'Lifetime access to program materials'],
    conditions: ['PCOS Management', 'Hormonal Imbalance', 'Weight Management', 'Insulin Resistance', 'Irregular Periods', 'Hormonal Acne'],
  },
};

export default async function ServicePage({ params }: { params: { slug: string } }) {
  let service: any = null;

  try {
    service = await client.fetch(SERVICE_BY_SLUG_QUERY, { slug: params.slug });
  } catch {}

  // Use fallback if Sanity data not available
  if (!service) {
    service = fallbackData[params.slug];
    if (!service) notFound();
  }

  const image = service.image;
  const benefits = service.benefits || [];
  const conditions = service.conditions || [];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-teal-800 text-white">
        <div className="absolute inset-0 bg-black/20 z-10" />
        {image && (
          <img
            src={image}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <p className="text-teal-200 font-semibold text-sm uppercase tracking-wide mb-3">Our Programs</p>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-4">{service.title}</h1>
          {service.subtitle && (
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">{service.subtitle}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#packages"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-800 font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
            >
              Book a Consultation
            </Link>
            <a
              href="https://wa.me/919876543210?text=Hi%20Sneha%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(service.title)}%20program."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description */}
          <div className="max-w-3xl mx-auto mb-16">
            {service.body ? (
              <div className="prose prose-lg prose-green max-w-none">
                <PortableText value={service.body} />
              </div>
            ) : service.description ? (
              <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
                <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">Key Benefits</h2>
                <ul className="space-y-3">
                  {benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conditions */}
            {conditions.length > 0 && (
              <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
                <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">Conditions Addressed</h2>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition: string, i: number) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-white text-teal-700 rounded-full text-sm font-medium border border-teal-200"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Packages for this service */}
          <ServicePackages serviceSlug={params.slug} serviceTitle={service.title} />

          {/* CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-teal-700 to-primary-600 rounded-2xl p-10 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-3">
              Ready to Start Your {service.title} Journey?
            </h2>
            <p className="text-teal-100 mb-8 max-w-xl mx-auto">
              Book a consultation with Sneha Agarwal to get a personalized plan designed specifically for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#packages"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
              >
                View Packages & Book
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
              >
                Explore Other Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
