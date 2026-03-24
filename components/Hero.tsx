'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-200/20 rounded-full translate-y-1/2 -translate-x-1/4 opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              Certified Functional Nutrition Consultant
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight font-serif">
              Heal Your Body with{' '}
              <span className="text-green-600">Functional Nutrition</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover the root cause of your health issues through personalized, science-backed nutrition plans.
              No fad diets, no quick fixes — just sustainable healing through the power of real food.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {[
                { icon: '🌿', label: 'Functional Medicine Approach' },
                { icon: '🔬', label: 'Root Cause Analysis' },
                { icon: '🥗', label: 'Personalized Diet Plans' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="font-semibold text-gray-800">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/#packages"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Book a Consultation
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                Explore Services
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { number: '500+', label: 'Happy Clients' },
                { number: '8+', label: 'Years Experience' },
                { number: '95%', label: 'Success Rate' },
                { number: '4.9', label: 'Google Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xl font-bold text-green-600">{stat.number}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-400 rounded-3xl rotate-3 opacity-30" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-40 h-40 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
                      🌿
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 font-serif">Sneha</h3>
                    <p className="text-green-600 font-medium mt-1">Functional Nutrition Consultant</p>
                    <p className="text-gray-500 text-sm mt-2">Certified in Functional Medicine & Clinical Nutrition</p>
                    <div className="mt-4 space-y-2">
                      <div className="bg-green-50 rounded-lg px-4 py-2 text-sm text-green-700 font-medium">
                        PCOS | Thyroid | Gut Health
                      </div>
                      <div className="bg-amber-50 rounded-lg px-4 py-2 text-sm text-amber-700 font-medium">
                        Weight Management | Diabetes
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-amber-400 text-xl">&#9733;</span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">4.9 / 5.0 (500+ reviews)</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -left-8 bg-white rounded-2xl shadow-lg p-4 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🥗</div>
                  <div>
                    <p className="text-xs text-gray-500">Next Available</p>
                    <p className="font-semibold text-gray-800 text-sm">Tomorrow, 10 AM</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-8 bg-white rounded-2xl shadow-lg p-4 border border-green-100">
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
