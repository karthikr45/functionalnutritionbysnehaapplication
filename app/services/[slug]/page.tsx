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
    subtitle: 'Sustainable Weight Loss — No Fad Diets, No Starvation',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop',
    description: 'Forget crash diets that leave you hungry and frustrated. Our Weight Loss Program helps you lose weight sustainably — while eating real, home-cooked meals. No skipping meals. No extreme rules. Just balanced, satisfying nutrition that includes breakfast, lunch, and dinner.',
    philosophy: 'We work with your lifestyle, support your metabolism, and keep you full and happy — so the results actually last.',
    benefits: [
      'Comprehensive Blood Work Assessment — We go deep into your lab reports to identify metabolic imbalances, hormonal issues, and nutrient gaps',
      'Smart Supplement Recommendations — Only when your blood work clearly shows a need, safe and evidence-based',
      'Personalised Nutrition Plans + Recipe Booklet — Customised to your body, preferences, and history',
      'Locally Sourced Meal Planning — Ingredients from your local market, convenient and culturally familiar',
      'Lifestyle & Habit Coaching — Better sleep routines, stress management, and small daily habits that last',
    ],
    conditions: ['Obesity', 'Stubborn Weight Gain', 'Slow Metabolism', 'Hormonal Weight Gain', 'Emotional Eating', 'Post-pregnancy Weight'],
    whyGutHealth: null,
    programStructure: [
      'Onboarding Mentor Call — A warm, detailed conversation to understand your goals and what you enjoy eating',
      'Dedicated Clinical Dietitian — A qualified dietitian stays by your side, guiding every step',
      'Regular Progress Review Calls — Scheduled check-ins to celebrate wins and adjust your plan',
      'Daily WhatsApp Support — Real-time answers, motivation, and encouragement on weekdays',
      'Maintenance Nutrition Plan — Protects your new weight and keeps you feeling free, not restricted',
    ],
    steps: null,
    investment: '2 months — ₹25,000 (4 review calls) · 3 months — ₹30,000 (6 review calls)',
    guidelines: {
      suitable: [
        'Consultation with Sneha Agarwal',
        '2 months – ₹25,000 includes 4 review calls on alternate weeks',
        '3 months – ₹30,000 includes 6 review calls on alternate weeks',
      ],
      notIncluded: null,
    },
  },
  'metabolic-health-program': {
    title: 'Metabolic Health Nutrition',
    subtitle: 'Root-Cause Nutrition for Metabolic Conditions',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=600&fit=crop',
    description: 'Your body isn\'t broken. It just needs the right support. If you\'re living with Insulin Resistance, PCOS, Type 2 Diabetes, High Cholesterol, High Blood Pressure, Uric Acid Imbalance, Obesity, or Fatty Liver — healing your metabolism isn\'t about eating less. It\'s about eating right, for your body.',
    philosophy: 'No starvation. No extreme cutting out of food groups. Just real, evidence-based nutrition that fits your life — and stays with you for good.',
    benefits: [
      'Stable blood sugar, naturally',
      'Healthier cholesterol and lipid profiles',
      'Reduced inflammation throughout your body',
      'Stronger liver and heart function',
    ],
    conditions: ['Insulin Resistance', 'PCOS', 'Type 2 Diabetes', 'High Cholesterol', 'High Blood Pressure', 'Uric Acid Imbalance', 'Obesity', 'Fatty Liver'],
    whyGutHealth: 'This isn\'t a quick fix. It\'s a transformation — one meal, one habit, one day at a time. Whether you were just diagnosed or have been struggling for years, we give you the tools, knowledge, and steady support to take back control of your health.',
    steps: [
      {
        title: 'Deep-Dive Blood Work Analysis',
        description: 'We study your lab reports to find hidden metabolic imbalances, hormone disruptions, and nutrient gaps that could be draining your energy.',
      },
      {
        title: 'Supplements Only If Needed',
        description: 'No random recommendations. If your blood work shows a deficiency, we suggest targeted, safe supplements to help your body heal — nothing more.',
      },
      {
        title: 'Your Personalised Plan + Recipe Booklet',
        description: 'We build your nutrition plan around your medical history, your goals, and your taste buds. Plus a recipe booklet to keep things fresh and easy.',
      },
      {
        title: 'Local & Affordable Ingredients',
        description: 'We design every meal around what\'s available in your nearby market — fresh, affordable, and culturally familiar.',
      },
      {
        title: 'Lifestyle Coaching That Sticks',
        description: 'Food is just one piece. We help you fix sleep, manage stress, and build small daily habits that add up to lasting change.',
      },
    ],
    programStructure: [
      'Onboarding Mentor Call — A warm, focused conversation to understand your goals and how you like to eat',
      'Dedicated Clinical Dietitian — One expert stays with you from start to finish',
      'Regular Progress Review Calls — Scheduled check-ins to celebrate wins and tweak your plan',
      'Daily WhatsApp Support (Weekdays) — Quick answers, real encouragement, someone in your corner',
      'Follow-up Blood Work (at 3 months) — Proof on paper: better blood sugar, improved cholesterol, healthier liver markers',
      'Maintenance Nutrition Plan — Lock in your results with a flexible long-term plan',
    ],
    investment: '3 months — ₹30,000 (includes 6 review calls on alternate weeks)',
    guidelines: {
      suitable: [
        'Plans built for you, not a crowd — your diagnosis, lab numbers, food preferences all factored in',
        'Real dietitians, real guidance — one-on-one with qualified clinical dietitians',
        'Food you\'ll actually enjoy — delicious, home-friendly meals from local ingredients',
      ],
      notIncluded: null,
    },
  },
  'pregnancy-nutrition': {
    title: 'Pregnancy Nutrition',
    subtitle: 'Nourishing You, Nourishing Your Baby',
    image: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=1200&h=600&fit=crop',
    description: 'Healthy pregnancy starts with healthy nutrition — let us help you make every bite count. Whether you\'re preparing for pregnancy, currently expecting, managing gestational diabetes, or breastfeeding, our program supports you with the right nutrition at the right time.',
    philosophy: 'Backed by clinical expertise, we ensure both mother and baby receive optimal nourishment for a healthy journey — before, during, and after birth.',
    benefits: [
      'Personalised meal planning for each trimester',
      'Key nutrients like iron, calcium, folate, and protein — made simple',
      'Support for common concerns like gestational diabetes',
      'Safe supplement recommendations, only if needed',
      'Ongoing check-ins and WhatsApp support for all your questions',
    ],
    conditions: ['Obesity', 'Insulin resistance', 'Thyroid imbalances', 'PCOS', 'Constipation', 'Anemia', 'Gestational diabetes'],
    whyGutHealth: null,
    steps: [
      {
        title: 'Pre-Pregnancy Nutrition',
        description: 'Optimise your fertility, correct nutritional deficiencies, and prepare your body for a healthy conception with a balanced, hormone-supportive diet.',
      },
      {
        title: 'Pregnancy Nutrition',
        description: 'Personalised trimester-wise meal plans to support fetal development, manage symptoms like nausea and heartburn, and promote healthy weight gain.',
      },
      {
        title: 'Gestational Diabetes Management',
        description: 'Specialised meal planning to regulate blood sugar levels, prevent complications, and support a healthy pregnancy outcome — without extreme food restrictions.',
      },
      {
        title: 'Lactation Support',
        description: 'Nutrient-rich plans to support milk production, maintain your energy, and aid postpartum recovery — with practical guidance for new mothers.',
      },
    ],
    programStructure: [
      'Onboarding Mentor Call — A detailed one-on-one conversation to understand your goals, lifestyle, and food preferences',
      'Dedicated Clinical Dietitian — Personally guides and supports you throughout your journey',
      'Personalised Nutrition Plans for Every Stage — Tailored to preconception, pregnancy, and postpartum',
      'Regular Progress Review Calls — Assess progress, address challenges, and fine-tune your plan',
      'Daily WhatsApp Support (Weekdays) — Real-time support, motivation, and answers at your fingertips',
      'Individualised plans based on nutrition needs, blood work, and dietary preferences',
      'Education to help you make informed, confident food choices',
    ],
    investment: '3 months — ₹30,000 (includes 6 review calls)',
    guidelines: {
      suitable: [
        'Consultation with Sneha Agarwal',
        'Support for every stage — from planning to postpartum',
        'Medical conditions supported: Obesity, Insulin resistance, Thyroid, PCOS, Anemia, Gestational diabetes',
      ],
      notIncluded: [
        'Irritable Bowel Syndrome (IBS)',
        'Inflammatory Bowel Disease (IBD)',
        'Gastroesophageal Reflux Disease (GERD)',
        'Chronic or severe constipation',
        'Those under strict medical supervision or on prescribed fertility/pregnancy support medication',
        'If unsure, please speak with our team before booking — your safety and care come first',
      ],
    },
  },
  'personalized-nutrition-plan': {
    title: 'One-Time Personalized Nutrition Plan',
    subtitle: 'Expert Guidance. One Clear Plan. No Long-Term Commitment.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=600&fit=crop',
    description: 'Not everyone needs a full program. Sometimes, you just need the right roadmap. If you don\'t have any medical conditions but want to eat better, this plan is for you. We\'ll help you master the essentials — protein, carbs, fibre, and key micronutrients — so you can build lasting health and keep lifestyle diseases at bay.',
    philosophy: 'No ongoing calls. No monthly follow-ups. Just one powerful plan to set you on the right path.',
    benefits: [
      'Gym Enthusiast — Clarity on protein intake, balanced meals, supplement suggestions, and blood work review',
      'Prevent Lifestyle Diseases — Focused meal ideas to help ward off diabetes, high cholesterol, fatty liver',
      'Weight Loss (Lighter Option) — Professional guidance without the long-term commitment',
      'Parent of a Kid or Teen — Age-specific nutrition for healthy growth, strong immunity, and development',
      'Vegan Diet — Plant-based plans ensuring enough protein, iron, B12, calcium — no guesswork',
      'Frequent Traveller — Practical nutrition for home stays, plus supplement tips for the road',
    ],
    conditions: ['General Wellness', 'Preventive Health', 'Gym & Fitness', 'Kids & Teens', 'Vegan Nutrition', 'Travel Nutrition'],
    whyGutHealth: 'This is a one-time plan — not a recurring program. There are no follow-up calls or ongoing support after your explanation session. And that\'s exactly the point. It\'s for people who want expert input once, then want to go live their life.',
    steps: [
      {
        title: 'Book Your Case Analysis Call',
        description: 'We\'ll talk about your goals, what you like to eat, and whether any blood work would be helpful.',
      },
      {
        title: 'Team Consultation',
        description: 'Our experts review your case behind the scenes.',
      },
      {
        title: 'We Build Your Plan',
        description: 'Once you sign up, allow 5 days for us to create your customised nutrition plan.',
      },
      {
        title: 'Plan Explanation Call (30 Minutes)',
        description: 'We walk you through your plan step by step so you leave feeling confident and clear.',
      },
    ],
    programStructure: null,
    investment: '₹15,000 — Includes case analysis call, custom plan development, and a 30-minute plan walkthrough',
    guidelines: {
      suitable: [
        'One-time plan — no recurring commitment',
        'Includes case analysis call + custom plan + 30-min walkthrough',
        'Perfect for those without medical conditions who want to eat better',
      ],
      notIncluded: [
        'No follow-up calls or ongoing support after plan explanation',
        'Not a recurring program — designed as a one-time expert consultation',
      ],
    },
  },
  'group-program': {
    title: '21 Days to PCOS Wellness',
    subtitle: 'You Don\'t Have to Do This Alone.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop',
    description: 'Irregular periods. Hormonal chaos. Weight that won\'t budge. Exhaustion that never lifts. Mood swings that leave you confused. You\'ve been managing PCOS on your own for too long. It\'s time to try something different — a group journey designed specifically for women, by gut and hormonal health expert Sneha Agarwal.',
    philosophy: 'Because PCOS can feel isolating. But healing doesn\'t have to be. When you join this program, you\'re not just getting a plan. You\'re getting a circle of women who truly understand. You\'ll share, learn, support each other, and grow together. There\'s power in that. Real power.',
    benefits: [
      'A clearer understanding of your PCOS',
      'Daily habits that support hormonal balance',
      'Better energy and mood',
      'Practical nutrition strategies you can keep using',
      'A sense of control over your health again',
      'Genuine connections with women on the same path',
    ],
    conditions: ['Irregular or missing periods', 'Hormonal acne or hair changes', 'Stubborn weight gain', 'Constant fatigue', 'Mood swings or brain fog'],
    whyGutHealth: null,
    steps: null,
    programStructure: [
      'Created by a Specialist — Sneha Agarwal lives and breathes gut and hormonal health. Every recommendation is science-backed and practical',
      'Structured for Real Life — 21 days of clear, daily guidance. No confusion. No overwhelm. Just a steady path forward',
      'Natural & Sustainable — No harsh protocols. No extreme restrictions. Just nutrition and lifestyle changes that work with your body',
      'Community at the Heart — Sisters on this journey who get the late-night cravings, the frustration, the wins, and the setbacks',
    ],
    investment: '₹9,999 only — 21 Days PCOS Wellness Program',
    guidelines: {
      suitable: [
        'Women experiencing irregular periods, hormonal acne, stubborn weight gain',
        'Those dealing with constant fatigue, mood swings, or brain fog',
        'Anyone ready to stop struggling with PCOS alone',
        '🎉 Registrations Are Open',
      ],
      notIncluded: null,
    },
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

  // Use fallback if Sanity data not available, or merge fallback for missing fields
  const fallback = fallbackData[params.slug];
  if (!service && !fallback) notFound();

  // Merge: Sanity fields take priority, fallback fills gaps
  service = {
    ...fallback,
    ...service,
    // For nested/array fields, use Sanity if non-empty, else fallback
    benefits: service?.benefits?.length ? service.benefits : fallback?.benefits,
    conditions: service?.conditions?.length ? service.conditions : fallback?.conditions,
    philosophy: service?.philosophy || fallback?.philosophy,
    whyGutHealth: service?.whyGutHealth || fallback?.whyGutHealth,
    steps: service?.steps?.length ? service.steps : fallback?.steps,
    programStructure: service?.programStructure?.length ? service.programStructure : fallback?.programStructure,
    investment: service?.investment || fallback?.investment,
    guidelines: (service?.guidelines?.suitable?.length || service?.guidelines?.notIncluded?.length)
      ? service.guidelines
      : fallback?.guidelines,
  };

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
          {service.guidelines && (service.guidelines.suitable || service.guidelines.notIncluded) && (
            <div className="max-w-3xl mx-auto mb-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {service.guidelines.suitable?.length > 0 && (
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
              )}
              {service.guidelines.notIncluded?.length > 0 && (
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
              )}
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
