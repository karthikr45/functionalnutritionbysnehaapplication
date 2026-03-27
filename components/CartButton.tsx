'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function CartButton() {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <Link
      href="/patient/cart"
      className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-primary-300 hover:text-primary-700 transition-colors text-sm"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      Cart
      {count > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
