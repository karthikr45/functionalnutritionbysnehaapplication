'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { getServiceLabel } from '@/lib/services';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  validity: number;
  features: string[] | string;
  isPopular: boolean;
  serviceSlug: string | null;
  sortOrder: number;
}

export default function ProgramPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => {
        setPackages(
          (d.packages || []).map((p: Package) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : JSON.parse((p.features as string) || '[]'),
          })),
        );
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (packages.length === 0) return null;

  // Group by serviceSlug. Maintain insertion order, packages with no slug last.
  const groups = new Map<string, Package[]>();
  for (const p of packages) {
    const key = p.serviceSlug || '__general__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return (
    <section id="programs-pricing" className="py-20 bg-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Programs &amp; Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 font-serif mt-2">
            Choose the Program That Fits Your Journey
          </h2>
          <p className="text-warm-text mt-4 max-w-2xl mx-auto text-base">
            Each program is structured around your goals — pick the duration of support that works for you.
          </p>
        </div>

        <div className="space-y-16">
          {Array.from(groups.entries()).map(([slug, pkgs]) => (
            <div key={slug}>
              <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-medium text-gray-900 font-serif">
                  {slug === '__general__' ? 'General Packages' : getServiceLabel(slug)}
                </h3>
                {slug !== '__general__' && (
                  <Link
                    href={`/services/${slug}`}
                    className="text-sm font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
                  >
                    Learn about this program
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </div>

              <div className={`grid gap-6 ${pkgs.length === 1 ? 'max-w-2xl' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                {pkgs.map((pkg) => {
                  const features = Array.isArray(pkg.features)
                    ? (pkg.features as string[])
                    : (JSON.parse((pkg.features as unknown as string) || '[]') as string[]);
                  return (
                    <article
                      key={pkg.id}
                      className="relative rounded-3xl bg-olive-gradient text-white p-8 flex flex-col"
                    >
                      {pkg.isPopular && (
                        <div className="absolute -top-3 right-6 bg-amber-400 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Most Popular
                        </div>
                      )}

                      <h4 className="text-xl font-medium font-serif mb-2">{pkg.name}</h4>
                      {pkg.description && (
                        <p className="text-cream-dark/70 text-sm leading-relaxed mb-5">{pkg.description}</p>
                      )}

                      {features.length > 0 && (
                        <ul className="space-y-2.5 mb-5 flex-1">
                          {features.slice(0, 5).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-cream-dark/85 text-sm leading-relaxed">
                              <span className="text-primary-300 mt-0.5 shrink-0">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                          {features.length > 5 && (
                            <li className="text-xs text-cream-dark/60 pl-6">+ {features.length - 5} more inclusions</li>
                          )}
                        </ul>
                      )}

                      <div className="mt-auto p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="text-[10px] text-primary-200 uppercase tracking-wider mb-1">Investment</p>
                        <p className="text-xl font-serif font-medium text-white">
                          {formatCurrency(pkg.price)}
                          <span className="text-xs text-cream-dark/70 font-sans font-normal ml-2">
                            · {pkg.sessions} sessions · {pkg.validity}d
                          </span>
                        </p>
                      </div>

                      {slug !== '__general__' && (
                        <Link
                          href={`/services/${slug}#programs`}
                          className="mt-4 w-full py-2.5 text-center rounded-xl font-semibold text-sm bg-cream text-warm-footer hover:bg-white transition-colors"
                        >
                          View Details
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
