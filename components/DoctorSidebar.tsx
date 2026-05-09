'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Logo from './Logo';

const navItems = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/doctor/appointments', label: 'Appointments', icon: '🗓' },
  { href: '/doctor/availability', label: 'Availability', icon: '⏰' },
  { href: '/doctor/packages', label: 'Packages', icon: '📦' },
  { href: '/doctor/package-bookings', label: 'Package Sales', icon: '💼' },
  { href: '/doctor/products', label: 'Products', icon: '🛍️' },
  { href: '/doctor/orders', label: 'Orders', icon: '📋' },
  { href: '/doctor/revenue', label: 'Revenue', icon: '💰' },
  { href: '/doctor/documents', label: 'Documents', icon: '📄' },
  { href: '/doctor/testimonials', label: 'Stories', icon: '⭐' },
  { href: '/doctor/profile', label: 'My Profile', icon: '👤' },
  { href: '/studio', label: 'Blog CMS', icon: '✍️' },
];

export default function DoctorSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <Link href="/">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
            {session?.user?.name?.[0] || 'D'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{session?.user?.name}</p>
          </div>
        </div>
      </div>

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
