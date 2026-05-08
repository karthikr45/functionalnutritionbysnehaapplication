'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Logo from './Logo';

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/patient/book', label: 'Book Appointment', icon: '📅' },
  { href: '/patient/appointments', label: 'My Appointments', icon: '🗓' },
  { href: '/patient/packages', label: 'My Packages', icon: '📦' },
  { href: '/patient/cart', label: 'Cart', icon: '🛒' },
  { href: '/patient/orders', label: 'My Orders', icon: '📋' },
  { href: '/patient/documents', label: 'Documents', icon: '📄' },
  { href: '/patient/profile', label: 'My Profile', icon: '👤' },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/">
          <Logo size="sm" />
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
