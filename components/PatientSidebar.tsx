'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Logo from './Logo';
import { useCart } from './CartProvider';

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/patient/book', label: 'Book Appointment', icon: '📅' },
  { href: '/patient/appointments', label: 'My Appointments', icon: '🗓' },
  { href: '/patient/packages', label: 'My Packages', icon: '📦' },
  { href: '/patient/cart', label: 'Cart', icon: '🛒' },
  { href: '/patient/orders', label: 'My Orders', icon: '📋' },
  { href: '/patient/documents', label: 'Documents', icon: '📄' },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Logo + Cart */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/">
          <Logo size="sm" />
        </Link>
        <Link href="/patient/cart" className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* User info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
            {session?.user?.name?.[0] || 'P'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">Patient</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === item.href
                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span className="text-xl">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
