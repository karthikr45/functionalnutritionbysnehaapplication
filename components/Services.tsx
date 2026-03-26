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
  const iconClass = 'w-12 h-12 text-primary-800';

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => {
        if (d.services && d.services.length > 0) {
          setServices(d.services);
        } else {
          setServices(fallbackServices);
        }
        setLoaded(true);
      })
      .catch(() => {
        setServices(fallbackServices);
        setLoaded(true);
      });
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Our Programs</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Specialized Nutrition Programs
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Evidence-based functional nutrition programs designed to address your specific health concerns
            and help you achieve lasting wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service) => {
            const slug = service.slug?.current || '';

            return (
              <Link
                key={service._id}
                href={`/services/${slug}`}
                className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-primary-200 transition-all duration-300"
              >
                {/* Top section — olive green background with icon and title */}
                <div className="p-6 min-h-[160px] flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: '#D4DE95' }}>
                  {/* Subtle decorative circle */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ backgroundColor: 'rgba(99,107,47,0.15)' }} />
                  <div className="relative z-10">
                    <ServiceIcon slug={slug} />
                  </div>
                  <div className="relative z-10 mt-4">
                    <h3 className="text-xl font-bold text-primary-900 group-hover:text-primary-700 transition-colors leading-tight">
                      {service.title}
                    </h3>
                    {service.subtitle && (
                      <p className="text-primary-800 text-sm mt-1.5 leading-relaxed line-clamp-2">{service.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Image section */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50 text-6xl">
                      {service.icon || '🌿'}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
