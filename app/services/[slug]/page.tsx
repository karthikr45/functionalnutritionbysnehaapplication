import { client } from '@/sanity/lib/client';
import { SERVICE_BY_SLUG_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';

export const revalidate = 60;
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicePackages from './ServicePackages';
import { notFound } from 'next/navigation';

// Fallback service data when Sanity isn't configured
const fallbackData: Record<string, any> = {
  'gut-reset-program': {
    title: 'Gut Health & Immune Support',
    subtitle: 'We don\'t just treat symptoms — we address root causes.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=600&fit=crop',
    description: 'Our Gut Reset Program focuses on functional disorders underlying chronic health issues. When your gut is in balance, your body\'s natural healing ability awakens.',
    benefits: [
      'Irritable Bowel Syndrome (IBS) — our signature program',
      'Bloating, reflux, indigestion',
      'H. pylori and gut infections',
      'Stomach acid imbalances',
      'Digestive enzyme deficiencies',
      'Hormonal imbalances (e.g., PCOS linked to chronic iron deficiency)',
      'Motility disorders (chronic constipation, incomplete evacuation)',
      'Autoimmune thyroid conditions',
      'Chronic inflammation',
      'Food and histamine intolerances',
      'Detoxification challenges',
    ],
    conditions: [
      'Acid reflux / GERD',
      'IBS and IBD',
      'Autoimmune disorders (e.g., Hashimoto\'s)',
      'Poor nutrient absorption',
      'Chronic inflammation',
      'Anxiety and migraines',
    ],
    philosophy: 'We follow "Food as Medicine" — supported by targeted nutrition strategies, evidence-based supplements, and the four pillars of health: nutrition, sleep, mental well-being, movement.',
    whyGutHealth: '70–80% of your immune system lives in your gut. A healthy gut microbiome regulates immunity, absorbs nutrients, and protects against chronic disease.',
    steps: [
      {
        title: 'Complete Your Lab Work',
        description: 'Use any lab you prefer, but ensure all required tests are done.',
        link: 'https://booking.thyrocare.com/landing-page?pageId=5648c507ffc84bda8905aaeb91769695941204737254874eed4514a3dae03c73',
        linkText: 'Book Your Lab Work',
      },
      {
        title: 'Book Your Case Analysis',
        description: 'Choose a session with Sneha Agarwal. Submit lab reports and any prior test results before your session.',
        includes: [
          'Deep dive into your health history, symptoms, and concerns',
          'Lab and diagnostic report analysis',
          'Suggestions for additional tests (if needed)',
          'Estimated recovery timeline and program duration',
          'Open Q&A for all your health questions',
        ],
        notes: [
          'We are not doctors and do not provide prescriptions.',
          'No nutrition or supplement plans are given during case analysis.',
          'A follow-up call will be scheduled to discuss your report.',
          'The case analysis fee is adjustable toward your maintenance nutrition and supplement plan after program completion.',
        ],
      },
      {
        title: 'Enroll in the Personalized Gut Reset Program',
        description: 'After signing up, you\'ll receive an onboarding call and begin your custom healing journey.',
      },
    ],
    programStructure: [
      '30-min onboarding call with your mentor',
      '30-min detailed plan explanation session',
      'WhatsApp support (7–8 hours/day)',
      'Alternate-week scheduled review calls',
      'Personalized supplement protocol',
      'Group mental wellness sessions with a certified coach',
    ],
    investment: '3 months — ₹50,000 (includes weekly review calls)',
    guidelines: {
      suitable: [
        'Ages 10–50',
        'Requires access to home-cooked meals (clean eating is essential for gut healing)',
        'Open to using recommended supplements to address nutrient deficiencies',
      ],
      notIncluded: [
        'Medical prescriptions or emergency medical care',
        'We are not medical doctors and cannot assist with emergencies',
      ],
    },
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
    description: 'Join our supportive community-based group programs led by our experts. Our flagship 4-Week PCOS Empowerment Program brings together women dealing with PCOS for guided nutrition education, meal planning, accountability, and peer support. Transform your health alongside others on the same journey.',
    benefits: ['Community support and accountability', 'Weekly live sessions', 'Group meal planning workshops', 'Exclusive recipe collections', 'Progress tracking together', 'Lifetime access to program materials'],
    conditions: ['PCOS Management', 'Hormonal Imbalance', 'Weight Management', 'Insulin Resistance', 'Irregular Periods', 'Hormonal Acne'],
  },
};

export default async function ServicePage({ params }: { params: { slug: string } }) {
  let service: any = null;
  let siteSettings: any = null;

  try {
    [service, siteSettings] = await Promise.all([
      client.fetch(SERVICE_BY_SLUG_QUERY, { slug: params.slug }),
      client.fetch(SITE_SETTINGS_QUERY),
    ]);
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
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-warm-footer text-white">
        <div className="absolute inset-0 bg-black/20 z-10" />
        {image && (
          <img
            src={image}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 text-center">
          <p className="text-primary-300 font-semibold text-sm uppercase tracking-[0.2em] mb-4">Our Programs</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium font-serif mb-4">{service.title}</h1>
          {service.subtitle && (
            <p className="text-xl text-cream-dark/80 max-w-2xl mx-auto">{service.subtitle}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-cream text-warm-footer font-bold rounded-xl hover:bg-white transition-colors shadow-lg"
            >
              Book a Consultation
            </Link>
            <a
              href={`https://wa.me/${siteSettings?.whatsappNumber || '919391675213'}?text=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(service.title)}%20program.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-cream-dark/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
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
              <div className="prose prose-lg max-w-none prose-headings:font-serif">
                <PortableText value={service.body} />
              </div>
            ) : service.description ? (
              <p className="text-lg text-warm-text leading-relaxed text-center">{service.description}</p>
            ) : null}
          </div>

          {/* Philosophy (gut-reset specific) */}
          {service.philosophy && (
            <div className="max-w-3xl mx-auto mb-16 bg-cream-dark rounded-3xl p-8 sm:p-10 border border-primary-100/30">
              <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.2em] mb-4">Our Philosophy</h2>
              <p className="text-lg text-gray-800 font-serif leading-relaxed italic">&ldquo;{service.philosophy}&rdquo;</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Conditions we address */}
            {benefits.length > 0 && (
              <div className="bg-cream-dark rounded-3xl p-8 border border-primary-100/30">
                <h2 className="text-2xl font-medium text-gray-900 font-serif mb-6">Conditions We Address</h2>
                <ul className="space-y-3">
                  {benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2.5 flex-shrink-0" />
                      <span className="text-warm-text text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why Gut Health / Conditions */}
            <div className="space-y-8">
              {service.whyGutHealth && (
                <div className="bg-warm-footer rounded-3xl p-8 text-white">
                  <h2 className="text-2xl font-medium font-serif mb-4">Why Gut Health Matters</h2>
                  <p className="text-cream-dark/80 leading-relaxed">{service.whyGutHealth}</p>
                </div>
              )}

              {conditions.length > 0 && (
                <div className="bg-cream-dark rounded-3xl p-8 border border-primary-100/30">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">These conditions often start in the gut:</h2>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((condition: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-cream text-warm-text rounded-full text-sm border border-primary-200/30">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps (gut-reset specific) */}
          {service.steps && (
            <div className="max-w-3xl mx-auto mb-16">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-primary-200/50" />
                <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.2em]">How to Join</h2>
                <div className="h-px flex-1 bg-primary-200/50" />
              </div>

              <div className="space-y-8">
                {service.steps.map((step: any, i: number) => (
                  <div key={i} className="relative bg-cream-dark rounded-3xl p-8 border border-primary-100/30">
                    <span className="absolute top-6 right-6 text-6xl font-serif font-bold text-primary-700/[0.06]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs font-semibold text-primary-500 uppercase tracking-[0.15em] mb-2">Step {i + 1}</p>
                    <h3 className="text-xl font-semibold text-gray-900 font-serif mb-3">{step.title}</h3>
                    <p className="text-warm-text mb-4">{step.description}</p>

                    {step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors mb-4">
                        📎 {step.linkText || 'Book Now'}
                      </a>
                    )}

                    {step.includes && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-800 mb-2">What&apos;s included:</p>
                        <ul className="space-y-2">
                          {step.includes.map((item: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-warm-text">
                              <span className="text-primary-600 mt-0.5">✓</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.notes && (
                      <div className="mt-4 p-4 bg-cream rounded-xl border border-primary-100/30">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Important Notes</p>
                        <ul className="space-y-1.5">
                          {step.notes.map((note: string, j: number) => (
                            <li key={j} className="text-sm text-warm-text flex items-start gap-2">
                              <span className="text-primary-500">•</span> {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Program Structure */}
          {service.programStructure && (
            <div className="max-w-3xl mx-auto mb-16">
              <div className="bg-warm-footer rounded-3xl p-8 sm:p-10 text-white">
                <h2 className="text-2xl font-medium font-serif mb-6">Program Structure — 3 Months of Support</h2>
                <ul className="space-y-3">
                  {service.programStructure.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-cream-dark/80">
                      <span className="text-primary-300 mt-0.5">✓</span> {item}
                    </li>
                  ))}
                </ul>
                {service.investment && (
                  <div className="mt-8 p-5 bg-white/10 rounded-2xl">
                    <p className="text-sm text-primary-200 uppercase tracking-wider mb-1">Investment</p>
                    <p className="text-2xl font-serif font-medium text-white">{service.investment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guidelines */}
          {service.guidelines && (
            <div className="max-w-3xl mx-auto mb-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-cream-dark rounded-3xl p-8 border border-primary-100/30">
                <h3 className="font-semibold text-gray-900 mb-4">✅ Suitable For</h3>
                <ul className="space-y-2">
                  {service.guidelines.suitable.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-warm-text flex items-start gap-2">
                      <span className="text-primary-600">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-cream-dark rounded-3xl p-8 border border-red-100/30">
                <h3 className="font-semibold text-gray-900 mb-4">❌ Not Included</h3>
                <ul className="space-y-2">
                  {service.guidelines.notIncluded.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-warm-text flex items-start gap-2">
                      <span className="text-red-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Final CTA */}
          <div className="max-w-3xl mx-auto text-center bg-cream-dark rounded-3xl p-10 sm:p-12 border border-primary-100/30">
            <h2 className="text-3xl font-medium font-serif text-gray-900 mb-3">Ready to Begin Your Healing Journey?</h2>
            <p className="text-warm-text mb-6">Take the first step toward gut transformation and whole-body health.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="tel:9391675213" className="px-6 py-3 bg-warm-footer text-white font-bold rounded-xl hover:bg-primary-900 transition-colors text-sm">
                📞 Call 9391675213
              </a>
              <Link href="/#contact" className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm">
                📅 Book Case Analysis
              </Link>
            </div>
          </div>

          {/* Packages for this service */}
          <div className="mt-16">
            <ServicePackages serviceSlug={params.slug} serviceTitle={service.title} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
