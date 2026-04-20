'use client';

import Link from 'next/link';

interface HeroProps {
  settings?: {
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroHighlights?: string[];
    heroStats?: { number: string; label: string }[];
    doctorImage?: string;
    aboutName?: string;
    aboutSpecializations?: string;
  } | null;
}

const defaultHighlights = ['Functional Medicine Approach', 'Root Cause Analysis', 'Personalized Diet Plans'];
const defaultStats = [
  { number: '8+', label: 'Years Experience' },
];
const defaultIcons = ['🌿', '🔬', '🥗'];

export default function Hero({ settings }: HeroProps) {
  const badge = settings?.heroBadge || 'Certified Gut Shell Consultant';
  const title = settings?.heroTitle || 'Heal Your Body with Gut Shell';
  const subtitle = settings?.heroSubtitle || 'Discover the root cause of your health issues through personalized, science-backed nutrition plans. No fad diets, no quick fixes — just sustainable healing through the power of real food.';
  const highlights = settings?.heroHighlights?.length ? settings.heroHighlights : defaultHighlights;
  const stats = settings?.heroStats?.length ? settings.heroStats : defaultStats;
  const doctorImage = settings?.doctorImage;
  const name = settings?.aboutName || 'Your Doctor';
  const specializations = settings?.aboutSpecializations || 'PCOS | Thyroid | Gut Health | Weight Management | Diabetes';

  // Split title to highlight last part in green
  const titleParts = title.split('Gut Shell');
  const hasHighlight = titleParts.length > 1;

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-200/20 rounded-full translate-y-1/2 -translate-x-1/4 opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              {badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight font-serif">
              {hasHighlight ? (
                <>
                  {titleParts[0]}
                  <span className="text-primary-600">Gut Shell</span>
                  {titleParts[1]}
                </>
              ) : (
                title
              )}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">{subtitle}</p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {highlights.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-2xl">{defaultIcons[i] || '✨'}</span>
                  <span className="font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/#packages"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Book a Consultation
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                Explore Services
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xl font-bold text-primary-600">{stat.number}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-400 rounded-3xl rotate-3 opacity-30" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden aspect-[4/5]">
                {doctorImage ? (
                  <img
                    src={doctorImage}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-40 h-40 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
                        🌿
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 font-serif">{name}</h3>
                      <p className="text-primary-600 font-medium mt-1">Gut Shell Consultant</p>
                      <p className="text-gray-500 text-sm mt-2">Certified in Functional Medicine &amp; Clinical Nutrition</p>
                    </div>
                  </div>
                )}
                {/* Overlay name card when image is present */}
                {doctorImage && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6">
                    <h3 className="text-2xl font-bold text-white font-serif">{name}</h3>
                    <p className="text-primary-300 font-medium text-sm mt-0.5">Gut Shell Consultant</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {specializations.split('|').map((s) => (
                        <span key={s.trim()} className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -left-2 sm:-left-8 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-primary-100 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🥗</div>
                  <div>
                    <p className="text-xs text-gray-500">Next Available</p>
                    <p className="font-semibold text-gray-800 text-sm">Tomorrow, 10 AM</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-2 sm:-right-8 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-primary-100 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🎯</div>
                  <div>
                    <p className="text-xs text-gray-500">Success Rate</p>
                    <p className="font-semibold text-gray-800 text-sm">95% Goal Achieved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
