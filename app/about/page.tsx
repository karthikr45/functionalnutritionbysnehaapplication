import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { SplitLetterReveal, ImageReveal, CountUp } from '@/components/AnimationEffects';
import { GraduationIcon, MedalIcon, PillIcon, DnaIcon, RunnerIcon, LeafIcon, MicroscopeIcon, SproutIcon } from '@/components/Icons';
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
  <GraduationIcon key="g" className="w-6 h-6" />,
  <MedalIcon key="m" className="w-6 h-6" />,
  <PillIcon key="p" className="w-6 h-6" />,
  <DnaIcon key="d" className="w-6 h-6" />,
  <RunnerIcon key="r" className="w-6 h-6" />,
  <LeafIcon key="l" className="w-6 h-6" />,
  <MicroscopeIcon key="mi" className="w-6 h-6" />,
  <SproutIcon key="s" className="w-6 h-6" />,
];

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

      {/* Hero banner */}
      <section className="bg-warm-footer text-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-300 font-semibold text-sm uppercase tracking-[0.2em] mb-4">About Me</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif leading-tight">
            <SplitLetterReveal text={title} stagger={30} />
          </h1>
          <p className="text-cream-dark/70 mt-4 max-w-2xl mx-auto text-lg">
            Functional Nutritionist &middot; Gut Health Practitioner
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Image side */}
          <ScrollReveal animation="fade-up">
            <div className="sticky top-24">
              {image ? (
                <ImageReveal className="rounded-3xl aspect-[4/5] shadow-xl" color="bg-primary-400">
                  <img src={image} alt={name} className="w-full h-full object-cover rounded-3xl" />
                </ImageReveal>
              ) : (
                <div className="bg-cream-dark rounded-3xl aspect-[4/5] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl">🌿</div>
                    <p className="text-warm-text text-sm">Upload photo in Sanity</p>
                  </div>
                </div>
              )}

              {/* Stats below image */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {stats.map((stat: { number: string; label: string }) => (
                  <div key={stat.label} className="bg-cream-dark rounded-2xl p-5 text-center">
                    <p className="text-3xl font-bold text-primary-700 font-serif">
                      {/^\d+/.test(stat.number) ? (
                        <CountUp end={parseInt(stat.number)} suffix={stat.number.replace(/^\d+/, '')} />
                      ) : stat.number}
                    </p>
                    <p className="text-warm-text text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Content side */}
          <div className="space-y-10">
            <ScrollReveal animation="fade-up">
              <div className="space-y-6">
                {description.map((para: string, i: number) => (
                  <p key={i} className={`text-warm-text leading-relaxed ${i === 0 ? 'text-lg font-medium text-gray-800' : 'text-base'}`}>
                    {para}
                  </p>
                ))}
              </div>
            </ScrollReveal>

            {/* Specializations */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div>
                <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.15em] mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {specializations.split('|').map((s: string) => (
                    <span key={s.trim()} className="px-4 py-2 bg-cream-dark text-warm-text text-sm rounded-full border border-primary-200/30">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Credentials */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div>
                <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.15em] mb-5">Qualifications & Expertise</h3>
                <div className="space-y-4">
                  {credentials.map((label: string, i: number) => (
                    <div key={label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-dark transition-colors">
                      <div className="w-12 h-12 border-2 border-primary-200 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                        {credentialIcons[i] || <LeafIcon className="w-6 h-6" />}
                      </div>
                      <span className="text-gray-800 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-warm-footer rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold font-serif mb-3">Ready to start your healing journey?</h3>
                <p className="text-cream-dark/70 text-sm mb-6">
                  Book a consultation and let&apos;s create a personalized nutrition plan designed specifically for your needs.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/#packages"
                    className="px-6 py-3 bg-cream text-warm-footer font-bold rounded-xl hover:bg-white transition-colors text-sm"
                  >
                    View Packages & Book
                  </Link>
                  <Link
                    href="/#contact"
                    className="px-6 py-3 border border-cream-dark/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors text-sm"
                  >
                    Get in Touch
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
