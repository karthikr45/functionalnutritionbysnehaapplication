import ScrollReveal from './ScrollReveal';
import { ImageReveal, SplitLetterReveal } from './AnimationEffects';
import { GraduationIcon, MedalIcon, PillIcon, DnaIcon, RunnerIcon, LeafIcon, MicroscopeIcon, SproutIcon } from './Icons';

interface AboutProps {
  settings?: {
    doctorImage?: string;
    aboutImage?: string;
    aboutName?: string;
    aboutTitle?: string;
    aboutDescription?: string[];
    aboutCredentials?: string[];
    aboutStats?: { number: string; label: string }[];
  } | null;
}

const defaultDescription = [
  "I'm Sneha, a certified Gut Shell Consultant passionate about helping people heal from the root cause — not just manage symptoms. I combine the principles of functional medicine with personalized nutrition to create lasting health transformations.",
  'I specialize in hormonal imbalances (PMOS, thyroid), gut health issues (IBS, bloating, acid reflux), diabetes management, weight loss, and autoimmune conditions. My approach goes beyond calorie counting — I look at your complete health picture including lab work, lifestyle, stress, sleep, and gut health.',
  'My philosophy is simple: food is medicine. When you give your body the right nutrition, it has an incredible ability to heal itself. Every plan I create is rooted in science, customized to Indian food habits, and designed for real life — not just theory.',
];

const defaultCredentials = [
  'Certified Gut Shell Consultant',
  'Advanced Clinical Nutrition & Dietetics',
  'Certified in Functional Medicine Approach',
  'Gut Microbiome & Hormonal Health Specialist',
  'Sports & Performance Nutrition Certified',
];

const defaultStats: { number: string; label: string }[] = [];

const credentialIcons = [
  <GraduationIcon key="g" className="w-5 h-5" />,
  <MedalIcon key="m" className="w-5 h-5" />,
  <PillIcon key="p" className="w-5 h-5" />,
  <DnaIcon key="d" className="w-5 h-5" />,
  <RunnerIcon key="r" className="w-5 h-5" />,
  <LeafIcon key="l" className="w-5 h-5" />,
  <MicroscopeIcon key="mi" className="w-5 h-5" />,
  <SproutIcon key="s" className="w-5 h-5" />,
];

export default function About({ settings }: AboutProps) {
  const image = settings?.aboutImage || settings?.doctorImage;
  const name = settings?.aboutName || 'Sneha';
  const title = settings?.aboutTitle || `Hi, I'm Sneha`;
  const description = settings?.aboutDescription?.length ? settings.aboutDescription : defaultDescription;
  const credentials = settings?.aboutCredentials?.length ? settings.aboutCredentials : defaultCredentials;
  const stats = (settings?.aboutStats?.length ? settings.aboutStats : defaultStats)
    .filter((s: { label: string }) => !/experience/i.test(s.label));

  return (
    <section id="about" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <ScrollReveal animation="slide-right">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8">
              {image ? (
                <ImageReveal className="rounded-2xl aspect-[4/5] shadow-lg" color="bg-amber-400">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h3 className="text-xl font-bold text-white font-serif">{name}</h3>
                    <p className="text-primary-300 text-sm font-medium">Gut Shell Consultant</p>
                  </div>
                </ImageReveal>
              ) : (
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-full mx-auto shadow-lg flex items-center justify-center text-8xl mb-6">
                    🌿
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-2xl font-bold text-primary-600">{stat.number}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* Content side */}
          <ScrollReveal animation="slide-left" delay={200}>
          <div className="space-y-6">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">About Me</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
                <SplitLetterReveal text={title} stagger={35} />
              </h2>
            </div>

            {description.map((para, i) => {
              if (para.includes('food is medicine')) {
                const parts = para.split('food is medicine');
                return (
                  <p key={i} className="text-gray-600 leading-relaxed">
                    {parts[0]}
                    <strong className="text-primary-700">food is medicine.</strong>
                    {parts[1]?.replace(/^\./, '')}
                  </p>
                );
              }
              return (
                <p key={i} className={`text-gray-600 leading-relaxed ${i === 0 ? 'text-lg' : ''}`}>
                  {para}
                </p>
              );
            })}

            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-gray-800">Qualifications &amp; Expertise</h4>
              {credentials.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-primary-600">{credentialIcons[i] || <LeafIcon className="w-5 h-5" />}</span>
                  <span className="text-gray-700 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
