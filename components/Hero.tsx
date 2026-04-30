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
        {doctorImage && (
          <img
            src={doctorImage}
            alt={name}
            className="lg:hidden absolute inset-0 w-full h-full object-cover object-top z-[1]"
          />
        )}

        {/* Desktop: if wide image exists, use it with cover */}
        {desktopImage && (
          <img
            src={desktopImage}
            alt={name}
            className="hidden lg:block absolute inset-0 w-full h-full object-cover object-top z-[1]"
          />
        )}

        {/* Desktop fallback: portrait with blurred bg + contain */}
        {!desktopImage && doctorImage && (
          <>
            <img
              src={doctorImage}
              alt=""
              aria-hidden="true"
              className="hidden lg:block absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-50"
            />
            <img
              src={doctorImage}
              alt={name}
              className="hidden lg:block absolute inset-0 w-full h-full object-contain object-center z-[1]"
            />
          </>
        )}

        {/* No image placeholder */}
        {!doctorImage && !desktopImage && (
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
        <div className="absolute inset-x-0 bottom-0 z-[3] px-4 pb-4 sm:px-8 sm:pb-8 lg:px-12 lg:pb-10 sm:pr-28 lg:pr-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-0.5 sm:gap-4">
            {/* Left: Signature name — slides from left, slow */}
            <div
              className="transition-all duration-[2000ms]"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(80px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '500ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <p className="font-signature text-white text-3xl sm:text-5xl lg:text-7xl drop-shadow-2xl leading-none">
                {name}
              </p>
            </div>

            {/* Right: Title + specializations — slides from right, slower */}
            <div
              className="transition-all duration-[2500ms] sm:text-right"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(80px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '1200ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <p className="text-white text-xs sm:text-lg lg:text-2xl font-serif font-semibold tracking-wide">
                Functional Nutritionist
              </p>
              <p className="text-white/80 text-[9px] sm:text-sm mt-0.5 tracking-wide">
                Gut &amp; Hormonal Health
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function HeroContent() {
  return (
    <section className="relative bg-cream-dark overflow-hidden py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Pre-Consultation Blood Work */}
        <div className="text-center mb-12">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-[0.2em] mb-3">Lab Work</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 font-serif">Pre-Consultation &amp; Annual Blood Work</h2>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-warm-text text-base leading-relaxed mb-8 text-center">
            Whether you&apos;re beginning your health journey or simply staying on top of your wellbeing, this panel is designed to give a more complete view of what your body may need. Instead of navigating multiple tests and still missing the full picture, this package brings together essential markers in one place.
          </p>

          <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.15em] mb-4">Why does this blood work matter</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              'Offers a clearer picture of your overall health',
              'Helps identify early imbalances before they progress',
              'Covers key markers in one complete panel',
              'Reduces guesswork from scattered testing',
              'Gives clearer direction for nutrition and lifestyle support',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-warm-text">
                <span className="text-primary-600 mt-0.5">✓</span> {item}
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://booking.thyrocare.com/landing-page?pageId=5648c507ffc84bda8905aaeb91769695941204737254874eed4514a3dae03c73"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg text-sm"
            >
              📎 Book Your Lab Work
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-12">
          <div className="h-px flex-1 bg-primary-200/50" />
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-[0.2em]">Advanced Testing</span>
          <div className="h-px flex-1 bg-primary-200/50" />
        </div>

        {/* Advanced Functional Testing */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 font-serif mb-4 text-center">Advanced Functional Testing</h2>
          <p className="text-warm-text text-base leading-relaxed mb-8 text-center">
            For cases that need deeper investigation, advanced functional testing may be recommended to explore underlying imbalances more closely. These tests are suggested only when clinically relevant and based on symptoms, health history, and case complexity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-cream rounded-3xl p-8 border border-primary-100/30">
              <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-[0.15em] mb-5">Functional Testing Available</h3>
              <ul className="space-y-2.5">
                {[
                  'GI-MAP (Gut Microbiome & Infections)',
                  'H. Pylori Testing',
                  'SIBO Breath Testing',
                  'DUTCH Test for Hormonal Health',
                  'Mould Toxicity Testing',
                  'Food Allergy & Sensitivity Testing',
                  'Heavy Metals Testing',
                  'Neurotransmitter Testing',
                  'Cortisol & Adrenal Function Testing',
                  'Additional functional testing as required',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-warm-text">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-warm-footer rounded-3xl p-8 text-white">
              <h3 className="text-sm font-semibold text-primary-300 uppercase tracking-[0.15em] mb-5">When deeper testing is needed</h3>
              <ul className="space-y-2.5">
                {[
                  'Persistent IBS or digestive concerns',
                  'Chronic bloating, reflux, or irregular bowel patterns',
                  'Hormonal imbalances',
                  'Fatigue and burnout',
                  'Skin flare-ups and inflammation',
                  'Food sensitivities',
                  'Suspected infections or deeper gut dysfunction',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-cream-dark/80">
                    <span className="text-primary-300 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-warm-text text-sm text-center italic">
            Advanced testing allows for a more precise and personalised approach when routine testing alone does not explain the full picture.
          </p>
        </div>
      </div>
    </section>
  );
}
