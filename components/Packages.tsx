'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  validity: number;
  features: string[];
  isPopular: boolean;
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => {
        setPackages(
          d.packages.map((p: any) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
          }))
        );
      })
      .catch(console.error);
  }, []);

  return (
    <section id="packages" className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mt-2">
            Consultation Packages
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Flexible packages designed for every stage of your wellness journey.
            All plans include personalized diet plans and WhatsApp support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 flex flex-col ${
                pkg.isPopular
                  ? 'bg-primary-600 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-800 shadow-md border border-gray-100'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3
                  className={`text-xl font-bold font-serif ${
                    pkg.isPopular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {pkg.name}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    pkg.isPopular ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {pkg.description}
                </p>

                <div className="mt-6 mb-4">
                  <span
                    className={`text-4xl font-bold ${pkg.isPopular ? 'text-white' : 'text-primary-600'}`}
                  >
                    {formatCurrency(pkg.price)}
                  </span>
                </div>

                <div
                  className={`flex gap-4 text-sm mb-6 ${
                    pkg.isPopular ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  <span>🗓 {pkg.sessions} Sessions</span>
                  <span>⏳ {pkg.validity} days validity</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {pkg.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        pkg.isPopular ? 'text-green-300' : 'text-primary-500'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={pkg.isPopular ? 'text-primary-50' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup?package=${pkg.id}`}
                className={`w-full text-center py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                  pkg.isPopular
                    ? 'bg-white text-primary-600 hover:bg-primary-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Not sure which plan is right for you?{' '}
          <Link href="/#contact" className="text-primary-600 font-medium hover:underline">
            Contact us for a free consultation call.
          </Link>
        </p>
      </div>
    </section>
  );
}
