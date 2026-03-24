'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/#about', label: 'About' },
    { href: '/#services', label: 'Services' },
    { href: '/#packages', label: 'Packages' },
    { href: '/#testimonials', label: 'Testimonials' },
    { href: '/blog', label: 'Blog' },
    { href: '/#faq', label: 'FAQ' },
    { href: '/#contact', label: 'Contact' },
  ];

  const dashboardHref =
    session?.user.role === 'DOCTOR'
      ? '/doctor/dashboard'
      : session?.user.role === 'PATIENT'
      ? '/patient/dashboard'
      : '/dashboard';

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              FN
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg leading-tight">Functional Nutrition</span>
              <p className="text-green-600 text-xs leading-tight">by Sneha</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-green-600 font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="px-4 py-2 text-green-600 font-medium text-sm hover:bg-green-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 font-medium text-sm hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/#packages"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-gray-700 font-medium hover:text-green-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {session ? (
              <>
                <Link href={dashboardHref} onClick={() => setOpen(false)} className="block py-2.5 px-4 bg-green-50 text-green-700 rounded-lg font-medium text-center">
                  Dashboard
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium text-center">
                  Login
                </Link>
                <Link href="/#packages" onClick={() => setOpen(false)} className="block py-2.5 px-4 bg-green-600 text-white rounded-xl font-semibold text-center">
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
