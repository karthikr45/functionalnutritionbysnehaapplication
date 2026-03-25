'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/superadmin/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/superadmin/logs', label: 'Audit Logs', icon: '📋' },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-sm">
      <div className="p-5 border-b border-gray-700">
        <Link href="/superadmin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">SA</div>
          <span className="font-bold text-white">Super Admin</span>
        </Link>
      </div>

      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center text-red-200 font-bold">
            {session?.user?.name?.[0] || 'S'}
          </div>
          <div>
            <p className="font-semibold text-gray-100 text-sm">{session?.user?.name}</p>
            <p className="text-xs text-red-400 font-medium">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === item.href
                ? 'bg-red-700 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-900 hover:text-red-200 transition-all"
        >
          <span className="text-xl">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
