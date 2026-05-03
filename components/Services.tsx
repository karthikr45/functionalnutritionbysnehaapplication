'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Service {
  _id: string;
  title: string;
  slug: { current: string };
  subtitle?: string;
  description?: string;
  icon?: string;
  image?: string;
}

const fallbackServices: Service[] = [
  {
    _id: '1',
    title: 'Gut Reset Program',
    slug: { current: 'gut-reset-program' },
    subtitle: 'Start your journey to lasting wellness today. True healing begins within.',
    icon: '🧬',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop',
  },
  {
    _id: '2',
    title: 'Weight Management',
    slug: { current: 'weight-management' },
    subtitle: 'Sustainable weight loss through personalized nutrition — no crash diets.',
    icon: '⚖️',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
  },
  {
    _id: '3',
    title: 'Metabolic Health Program',
    slug: { current: 'metabolic-health-program' },
    subtitle: 'Diabetes / PCOS / Thyroid Imbalances / Cardiac Health (High Cholesterol)',
    icon: '🩺',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
  },
  {
    _id: '4',
    title: 'Pregnancy Nutrition',
    slug: { current: 'pregnancy-nutrition' },
    subtitle: 'Comprehensive nutrition support for pre-conception, pregnancy & postpartum.',
    icon: '🤰',
    image: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=600&h=400&fit=crop',
  },
  {
    _id: '5',
    title: 'One-Time Personalized Nutrition Plan',
    slug: { current: 'personalized-nutrition-plan' },
    subtitle: 'A complete nutrition blueprint tailored to your unique health needs.',
    icon: '📋',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop',
  },
  {
    _id: '6',
    title: 'Group Program',
    slug: { current: 'group-program' },
    subtitle: '4-Week PCOS Empowerment Program',
    icon: '👥',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
  },
];

// SVG icons similar to the reference design
function ServiceIcon({ slug }: { slug: string }) {
  const iconClass = 'w-10 h-10 text-primary-700';

  switch (slug) {
    case 'gut-reset-program':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
          <path d="M24 6c-4 0-7 3-7 7 0 3 1 5 1 8s-2 6-2 10c0 5 3 9 8 9s8-4 8-9c0-4-2-7-2-10s1-5 1-8c0-4-3-7-7-7z" />
          <path d="M20 16c-2 1-3 3-3 5m14-5c2 1 3 3 3 5" />
          <circle cx="22" cy="28" r="1.5" fill="currentColor" />
          <circle cx="26" cy="32" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'weight-management':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
          <rect x="8" y="28" width="32" height="14" rx="3" />
          <path d="M14 28V18a10 10 0 0120 0v10" />
          <circle cx="24" cy="22" r="3" />
          <line x1="24" y1="22" x2="30" y2="18" />
          <line x1="16" y1="35" x2="32" y2="35" />
        </svg>
      );
    case 'metabolic-health-program':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
          <path d="M24 8c-6 0-12 6-12 14 0 10 12 20 12 20s12-10 12-20c0-8-6-14-12-14z" />
          <path d="M18 20h4l2-4 4 8 2-4h4" />
        </svg>
      );
    case 'pregnancy-nutrition':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
          <circle cx="24" cy="12" r="5" />
          <path d="M20 18c-3 1-5 4-5 8v4c0 2 1 4 3 5l2 1v4h8v-4l2-1c2-1 3-3 3-5v-4c0-4-2-7-5-8" />
          <path d="M22 26c0 2 1 4 2 4s2-2 2-4" />
        </svg>
      );
    case 'personalized-nutrition-plan':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
          <rect x="10" y="6" width="28" height="36" rx="3" />
          <path d="M16 14h16M16 20h16M16 26h10" />
          <circle cx="34" cy="34" r="8" fill="none" />
          <path d="M31 34l2 2 4-4" />
        </svg>
      );
    case 'group-program':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClass}>
          <circle cx="24" cy="14" r="5" />
          <circle cx="12" cy="18" r="4" />
          <circle cx="36" cy="18" r="4" />
          <path d="M18 26c-3 1-6 4-6 7v3h24v-3c0-3-3-6-6-7" />
          <path d="M6 32v-2c0-2 2-4 4-5M38 25c2 1 4 3 4 5v2" />
        </svg>
      );
    default:
      return <span className="text-4xl">{fallbackServices[0]?.icon || '🌿'}</span>;
  }
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => {
        if (d.services && d.services.length > 0) {
          setServices(d.services);
        } else {
          setServices(fallbackServices);
        }
      })
      .catch(() => {
        setServices(fallbackServices);
      });
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <section id="services" className="py-16 sm:py-20 bg-[#FAF6EE] overflow-hidden pl-4 sm:pl-6 lg:pl-20">
      {/* Header: headline+description (max-w 580) on left, scroll pill on right */}
      <div className="max-w-[1240px] pr-4 sm:pr-6 lg:pr-8 mb-12 sm:mb-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="max-w-[580px]">
            <p className="font-semibold text-[11px] uppercase tracking-[0.2em]" style={{ color: '#7A8B5C' }}>
              Our Signature Programs
            </p>
            <h2 className="text-4xl sm:text-5xl font-serif font-normal text-gray-900 mt-5 leading-[1.05] tracking-tight">
              Personalized Programs.
              <br />
              Lasting Transformation.
            </h2>
            <p className="text-warm-text text-[15px] leading-relaxed mt-6">
              Evidence-based functional nutrition programs designed to address your specific health concerns
              and help you achieve lasting wellness.
            </p>
          </div>

          <div className="flex items-center gap-3 text-gray-600 shrink-0 lg:mt-2">
            {/* Vertical capsule indicator: 14×28px, 1px #C5BFB0, no fill, no arrow */}
            <div
              className="w-[14px] h-7 rounded-full shrink-0"
              style={{ border: '1px solid #C5BFB0' }}
              aria-hidden="true"
            />
            <p className="text-[13px] leading-tight">
              Scroll to explore
              <br />
              our programs
            </p>
          </div>
        </div>
      </div>

      {/* Carousel — perspective container creates the 3D fan/curved-row effect */}
      <div
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth py-12 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          perspective: '1400px',
          perspectiveOrigin: 'center center',
        }}
      >
        {displayServices.map((service, idx) => {
          const slug = service.slug?.current || '';
          // 3D fan/cylinder effect — each card rotates around its vertical axis.
          // Edges rotate inward toward center (positive on left, negative on right).
          // Center cards drop slightly lower to complete the panoramic arc.
          const yRotate = [22, 10, 0, -10, -22, -22];
          const arcDrop = [-12, -4, 8, -4, -12, -12];
          const rotY = yRotate[idx] ?? 0;
          const dropY = arcDrop[idx] ?? 0;

          return (
            <Link
              key={service._id}
              href={`/services/${slug}`}
              className="group snap-start shrink-0 w-[80%] sm:w-[44%] md:w-[220px]"
              style={{
                transform: `rotateY(${rotY}deg) translateY(${dropY}px)`,
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
              }}
            >
              <div>
                {/* Image — portrait ~4:5; 3D rotation comes from parent Link */}
                <div
                  className="h-[260px] sm:h-[280px] overflow-hidden bg-cream-dark shadow-md"
                  style={{
                    borderRadius: '18px',
                    clipPath: idx === 0 ? 'polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 4%)' : undefined,
                  }}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 border-2 border-primary-200 rounded-full flex items-center justify-center">
                        <ServiceIcon slug={slug} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="pt-5">
                  <div className="w-8 h-8 border border-gray-400/50 rounded-full flex items-center justify-center mb-3">
                    <div className="scale-[0.5]">
                      <ServiceIcon slug={slug} />
                    </div>
                  </div>
                  <h3 className="text-[18px] font-serif font-normal text-gray-900 leading-snug">
                    {service.title}
                  </h3>
                  {service.subtitle && (
                    <p className="text-warm-text text-[13px] mt-1.5 leading-relaxed line-clamp-2">{service.subtitle}</p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-1.5 text-gray-900 text-[13px] font-semibold border-b border-gray-900 pb-0.5 group-hover:gap-2 transition-all">
                    <span>Explore Program</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
