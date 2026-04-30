'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CountUp, MagneticButton } from './AnimationEffects';
import { LeafIcon, MicroscopeIcon, BowlFoodIcon } from './Icons';

interface HeroProps {
  settings?: {
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroHighlights?: string[];
    heroStats?: { number: string; label: string }[];
    doctorImage?: string;
    heroDesktopImage?: string;
    aboutName?: string;
    aboutSpecializations?: string;
  } | null;
}

const defaultHighlights = ['Functional Medicine Approach', 'Root Cause Analysis', 'Personalized Diet Plans'];
const defaultStats = [
  { number: '8+', label: 'Years Experience' },
];
const defaultIcons = [
  <LeafIcon key="leaf" className="w-5 h-5 text-primary-600" />,
  <MicroscopeIcon key="mic" className="w-5 h-5 text-primary-600" />,
  <BowlFoodIcon key="bowl" className="w-5 h-5 text-primary-600" />,
];

export default function Hero({ settings }: HeroProps) {
  const badge = settings?.heroBadge || 'Certified Gut Shell Consultant';
  const title = settings?.heroTitle || 'Heal Your Body with Gut Shell';
  const subtitle = settings?.heroSubtitle || 'Discover the root cause of your health issues through personalized, science-backed nutrition plans. No fad diets, no quick fixes — just sustainable healing through the power of real food.';
  const highlights = settings?.heroHighlights?.length ? settings.heroHighlights : defaultHighlights;
  const stats = settings?.heroStats?.length ? settings.heroStats : defaultStats;
  const doctorImage = settings?.doctorImage;
  const desktopImage = settings?.heroDesktopImage;
  const name = settings?.aboutName || 'Sneha Agarwal';
  const specializations = settings?.aboutSpecializations || 'PCOS | Thyroid | Gut Health | Weight Management | Diabetes';

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const titleParts = title.split('Gut Shell');
  const hasHighlight = titleParts.length > 1;

  return (
    <>
      {/* Hero Banner */}
      <section className="relative w-full h-[calc(100svh-64px)] overflow-hidden bg-gray-900">
        {/* Mobile image — portrait, cover */}
        {doctorImage ? (
          <img
            src={doctorImage}
            alt={name}
            className="lg:hidden absolute inset-0 w-full h-full object-cover object-top z-[1]"
          />
        ) : null}

        {/* Desktop image — wide landscape, cover */}
        {(desktopImage || doctorImage) ? (
          <img
            src={desktopImage || doctorImage!}
            alt={name}
            className="hidden lg:block absolute inset-0 w-full h-full object-cover object-center z-[1]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center z-[1]">
            <div className="text-center">
              <div className="w-40 h-40 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center text-7xl">🌿</div>
              <p className="text-gray-400 text-sm">Upload doctor image in Sanity → Site Settings</p>
            </div>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-[2]" />

        {/* Bottom overlays */}
        <div className="absolute inset-x-0 bottom-0 z-[3] px-4 pb-4 sm:px-8 sm:pb-8 lg:px-12 lg:pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-0.5 sm:gap-4">
            {/* Left: Signature name */}
            <div
              className="transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(60px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '300ms',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <p className="font-signature text-white text-3xl sm:text-5xl lg:text-7xl drop-shadow-2xl leading-none">
                {name}
              </p>
            </div>

            {/* Right: Title + specializations */}
            <div
              className="transition-all duration-1000 ease-out sm:text-right"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(60px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '700ms',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <p className="text-white text-xs sm:text-lg lg:text-2xl font-serif font-semibold tracking-wide">
                Functional Nutritionist
              </p>
              <p className="text-white/70 text-[8px] sm:text-xs mt-0.5 tracking-[0.08em] sm:tracking-[0.15em] uppercase break-words">
                {specializations}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content section below the banner */}
      <section className="relative bg-gradient-to-br from-cream-dark via-cream to-cream-dark overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              {badge}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight font-serif">
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

            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">{subtitle}</p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600 justify-center">
              {highlights.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span>{defaultIcons[i] || <LeafIcon className="w-5 h-5 text-primary-600" />}</span>
                  <span className="font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton strength={0.2}>
                <Link
                  href="/#packages"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                >
                  Book a Consultation
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link
                  href="#services"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-all duration-200 text-lg"
                >
                  Explore Services
                </Link>
              </MagneticButton>
            </div>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center px-5 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xl font-bold text-primary-600">
                    {/^\d+/.test(stat.number) ? (
                      <CountUp end={parseInt(stat.number)} suffix={stat.number.replace(/^\d+/, '')} duration={2000} />
                    ) : stat.number}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
