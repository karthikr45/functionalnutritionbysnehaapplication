'use client';

import { useCart } from '@/components/CartProvider';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const total = getCartTotal();
  const shippingFee = total >= 500 ? 0 : 50;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our products and add items to your cart.</p>
        <Link href="/products" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear All</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold text-gray-800 text-sm hover:text-primary-600">{item.name}</Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-primary-600">{formatCurrency(item.salePrice || item.price)}</span>
                  {item.salePrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</span>}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-sm">-</button>
                    <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-200">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-sm" disabled={item.quantity >= item.stock}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">{formatCurrency((item.salePrice || item.price) * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-20">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span></div>
            {shippingFee > 0 && <p className="text-xs text-primary-600">Free shipping on orders above {formatCurrency(500)}</p>}
            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3"><span>Total</span><span className="text-primary-600">{formatCurrency(total + shippingFee)}</span></div>
          </div>
          <button
            onClick={() => router.push('/patient/checkout')}
            className="w-full mt-5 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Proceed to Checkout
          </button>
          <Link href="/products" className="block text-center text-sm text-primary-600 mt-3 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
