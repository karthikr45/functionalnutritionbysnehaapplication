'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useCart } from './CartProvider';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/#services', label: 'Services' },
    { href: '/products', label: 'Products' },
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
    <nav className="bg-primary-700 backdrop-blur-sm border-b border-primary-800/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <Logo variant="light" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-warm-footer-text hover:text-white font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            <Link href="/patient/cart" className="relative p-2 text-warm-footer-text hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="px-4 py-2 text-primary-300 font-medium text-sm hover:bg-white/10 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 border border-warm-footer-text/30 text-warm-footer-text text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-warm-footer-text font-medium text-sm hover:bg-white/10 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/#packages"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-warm-footer-text hover:bg-white/10"
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
        <div className="lg:hidden border-t border-primary-800/30 bg-primary-700 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-warm-footer-text font-medium hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-primary-900/20 flex flex-col gap-2">
            {session ? (
              <>
                <Link href={dashboardHref} onClick={() => setOpen(false)} className="block py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium text-center">
                  Dashboard
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="py-2.5 px-4 border border-warm-footer-text/30 text-warm-footer-text rounded-lg font-medium">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block py-2.5 px-4 border border-warm-footer-text/30 text-warm-footer-text rounded-lg font-medium text-center">
                  Login
                </Link>
                <Link href="/#packages" onClick={() => setOpen(false)} className="block py-2.5 px-4 bg-primary-600 text-white rounded-xl font-semibold text-center">
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
