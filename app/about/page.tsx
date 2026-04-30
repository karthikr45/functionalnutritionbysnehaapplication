import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { ImageReveal, CountUp, MagneticButton } from '@/components/AnimationEffects';
import { GraduationIcon, MedalIcon, PillIcon, DnaIcon, LeafIcon } from '@/components/Icons';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import Link from 'next/link';

export const revalidate = 60;

export const metadata = {
  title: 'About — Gut Shell',
  description: 'Meet the functional nutritionist behind Gut Shell. Learn about our approach, qualifications, and philosophy.',
};

const defaultDescription = [
  "I'm a Functional Nutritionist and Gut Health Practitioner, and the voice behind this practice.",
  "I've always been drawn to understanding how the body works — not just how it looks, but how it feels, responds, and communicates. Over time, that curiosity grew into a deeper focus on the signals we often ignore: bloating, fatigue, skin flare-ups, hormonal shifts, and the everyday symptoms that are easy to dismiss but rarely random.",
  "My work is rooted in helping you understand what your body has been trying to say all along. Through a food-first, root-cause approach, I focus on restoring gut health, calming inflammation, and supporting the body's natural ability to heal and regulate itself.",
  "I hold both a Bachelor's and Master's degree in Nutrition and Dietetics, and my practice is built on a strong foundation in clinical nutrition, therapeutic healing, and evidence-based wellness.",
];

const defaultCredentials = [
  "Bachelor's in Nutrition & Dietetics",
  "Master's in Nutrition & Dietetics",
  'Functional Nutrition Practitioner',
  'Gut Health Specialist',
  'Clinical Nutrition & Therapeutic Healing',
];

const defaultStats = [
  { number: '8+', label: 'Years Experience' },
];

const credentialIcons = [
  <GraduationIcon key="g" className="w-5 h-5" />,
  <MedalIcon key="m" className="w-5 h-5" />,
  <PillIcon key="p" className="w-5 h-5" />,
  <DnaIcon key="d" className="w-5 h-5" />,
  <LeafIcon key="l" className="w-5 h-5" />,
];

const highlights = [
  { word: 'bloating', color: 'text-primary-700' },
  { word: 'fatigue', color: 'text-primary-700' },
  { word: 'skin flare-ups', color: 'text-primary-700' },
  { word: 'hormonal shifts', color: 'text-primary-700' },
  { word: 'food-first', color: 'text-primary-700 font-semibold' },
  { word: 'root-cause', color: 'text-primary-700 font-semibold' },
  { word: 'gut health', color: 'text-primary-700 font-semibold' },
  { word: 'calming inflammation', color: 'text-primary-700 font-semibold' },
  { word: "Bachelor's and Master's", color: 'font-semibold text-gray-900' },
  { word: 'clinical nutrition', color: 'font-semibold text-gray-900' },
  { word: 'evidence-based wellness', color: 'font-semibold text-gray-900' },
];

function highlightText(text: string): JSX.Element {
  let result: (string | JSX.Element)[] = [text];
  highlights.forEach(({ word, color }) => {
    result = result.flatMap((part) => {
      if (typeof part !== 'string') return [part];
      const idx = part.toLowerCase().indexOf(word.toLowerCase());
      if (idx === -1) return [part];
      const before = part.slice(0, idx);
      const match = part.slice(idx, idx + word.length);
      const after = part.slice(idx + word.length);
      return [
        before,
        <span key={`${word}-${idx}`} className={color}>{match}</span>,
        after,
      ].filter(Boolean);
    });
  });
  return <>{result}</>;
}

async function getSettings() {
  try { return await client.fetch(SITE_SETTINGS_QUERY); }
  catch { return null; }
}

export default async function AboutPage() {
  const settings = await getSettings();

  const name = settings?.aboutName || 'Sneha';
  const title = settings?.aboutTitle || `Hi, I'm Sneha`;
  const description = settings?.aboutDescription?.length ? settings.aboutDescription : defaultDescription;
  const credentials = settings?.aboutCredentials?.length ? settings.aboutCredentials : defaultCredentials;
  const stats = settings?.aboutStats?.length ? settings.aboutStats : defaultStats;
  const image = settings?.aboutImage || settings?.doctorImage;
  const specializations = settings?.aboutSpecializations || 'Gut Health | Hormonal Balance | Inflammation | Therapeutic Nutrition';

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <Navbar />

      {/* Hero — image left, bio right */}
      <section className="relative bg-warm-footer text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Image */}
            <div>
              {/* Mobile header — above image */}
              <div className="lg:hidden mb-6">
                <p className="text-primary-300 font-semibold text-sm uppercase tracking-[0.25em] mb-3">About Me</p>
                <h1 className="text-4xl font-medium font-serif leading-[1.1]">{title}</h1>
              </div>

              {image ? (
                <ScrollReveal animation="fade-up">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-primary-600/20 to-transparent rounded-[2rem] blur-2xl" />
                    <img src={image} alt={name} className="relative w-full aspect-[3/4] object-cover rounded-[2rem] shadow-2xl" />
                  </div>
                </ScrollReveal>
              ) : (
                <div className="bg-primary-900/30 rounded-[2rem] aspect-[3/4] flex items-center justify-center">
                  <p className="text-cream-dark/50 text-sm">Upload photo in Sanity</p>
                </div>
              )}
            </div>

            {/* Bio text */}
            <div>
              {/* Desktop header */}
              <div className="hidden lg:block mb-6">
                <p className="text-primary-300 font-semibold text-sm uppercase tracking-[0.25em] mb-3">About Me</p>
                <h1 className="text-5xl lg:text-6xl font-medium font-serif leading-[1.1]">{title}</h1>
              </div>

              <div className="w-16 h-[2px] bg-gradient-to-r from-primary-400 to-primary-300 mb-6" />

              <div className="space-y-5">
                <p className="text-cream-dark/90 text-lg leading-relaxed font-medium">
                  {description[0] || ''}
                </p>
                {description.slice(1).map((para: string, i: number) => (
                  <p key={i} className="text-cream-dark/75 text-base leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                {specializations.split('|').map((s: string) => (
                  <span key={s.trim()} className="px-4 py-1.5 border border-primary-400/30 text-primary-200 text-xs rounded-full uppercase tracking-wider">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section className="bg-cream-dark py-10 sm:py-14 border-b border-primary-100/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal animation="fade-up">
            <blockquote className="text-2xl sm:text-3xl font-serif font-medium text-gray-800 italic leading-relaxed">
              &ldquo;Your body speaks. My work is helping you listen.&rdquo;
            </blockquote>
            <p className="mt-4 text-primary-600 font-signature text-2xl">— {name}</p>
          </ScrollReveal>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

        {/* Stats row */}
        <ScrollReveal animation="fade-up">
          <div className="flex flex-wrap justify-center gap-8 mt-16 mb-16">
            {stats.map((stat: { number: string; label: string }) => (
              <div key={stat.label} className="text-center px-8">
                <p className="text-5xl sm:text-6xl font-serif font-medium text-primary-700">
                  {/^\d+/.test(stat.number) ? (
                    <CountUp end={parseInt(stat.number)} suffix={stat.number.replace(/^\d+/, '')} duration={2500} />
                  ) : stat.number}
                </p>
                <p className="text-warm-text text-sm mt-2 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Credentials */}
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-primary-200/50" />
              <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.2em]">Qualifications</h3>
              <div className="h-px flex-1 bg-primary-200/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {credentials.map((label: string, i: number) => (
                <div key={label} className="flex items-center gap-4 bg-cream-dark rounded-2xl p-4 hover:shadow-md transition-all duration-300 group">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-700 to-primary-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                    {credentialIcons[i] || <LeafIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-gray-800 font-medium text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mx-auto mt-16 bg-warm-footer rounded-3xl p-10 sm:p-12 text-white text-center">
            <h3 className="text-3xl sm:text-4xl font-medium font-serif mb-4">Ready to start your healing journey?</h3>
            <p className="text-cream-dark/70 max-w-lg mx-auto mb-8">
              Book a consultation and let&apos;s create a personalized nutrition plan designed specifically for your needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <MagneticButton>
                <Link
                  href="/#services"
                  className="px-8 py-4 bg-cream text-warm-footer font-bold rounded-xl hover:bg-white transition-colors text-sm shadow-lg"
                >
                  View Services & Book
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/#contact"
                  className="px-8 py-4 border border-cream-dark/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  Get in Touch
                </Link>
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
