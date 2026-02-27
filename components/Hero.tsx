'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-green-50 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-400/20 rounded-full translate-y-1/2 -translate-x-1/4 opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              ✨ India&apos;s Trusted Nutrition Expert
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight font-serif">
              Transform Your Health Through{' '}
              <span className="text-primary-600">Personalized Nutrition</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Get expert nutrition guidance tailored to your unique body, lifestyle, and health goals.
              Science-backed diet plans that actually work — no fad diets, no shortcuts.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {[
                { icon: '👩‍⚕️', label: '10+ Years Experience' },
                { icon: '🏆', label: '5000+ Patients Helped' },
                { icon: '⭐', label: '4.9 Rating' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="font-semibold text-gray-800">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Book a Consultation
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#packages"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                View Packages
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-400 rounded-3xl rotate-3 opacity-30" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-40 h-40 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center text-6xl">
                      👩‍⚕️
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 font-serif">Dr. Priya Sharma</h3>
                    <p className="text-primary-600 font-medium mt-1">Clinical Nutritionist & Dietitian</p>
                    <p className="text-gray-500 text-sm mt-2">M.Sc. Food Science | RD | CDE</p>
                    <div className="mt-6 flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-accent-500 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">4.9 / 5.0 (500+ reviews)</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -left-8 bg-white rounded-2xl shadow-lg p-4 border border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🥗</div>
                  <div>
                    <p className="text-xs text-gray-500">Next Available</p>
                    <p className="font-semibold text-gray-800 text-sm">Tomorrow, 10 AM</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-8 bg-white rounded-2xl shadow-lg p-4 border border-primary-100">
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
