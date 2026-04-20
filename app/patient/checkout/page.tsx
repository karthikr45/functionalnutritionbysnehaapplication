'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/CartProvider';
import RazorpayPayment from '@/components/RazorpayPayment';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [shipping, setShipping] = useState({
    name: session?.user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const [creating, setCreating] = useState(false);

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <Link href="/products" className="text-primary-600 font-medium hover:underline">Browse products →</Link>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.state || !shipping.pincode) {
      toast.error('Please fill all shipping details');
      return;
    }

    setCreating(true);
    try {
      // Step 1: Create order in our DB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shipping,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        toast.error(data.error || 'Failed to create order');
        setCreating(false);
        return;
      }

      const { order } = await orderRes.json();
      setOrderId(order.id);
      setOrderAmount(order.totalAmount);

      // Step 2: Create Razorpay payment order
      const payRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'order', orderId: order.id }),
      });

      if (!payRes.ok) {
        toast.error('Failed to initiate payment');
        setCreating(false);
        return;
      }

      const payData = await payRes.json();

      // Step 3: Open Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: payData.keyId,
          amount: payData.amount,
          currency: payData.currency || 'INR',
          name: 'Gut Shell',
          description: `Order #${order.orderNumber}`,
          order_id: payData.orderId,
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            contact: shipping.phone,
          },
          theme: { color: '#636B2F' },
          handler: async (response: any) => {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              clearCart();
              toast.success('Payment successful! Order confirmed.');
              router.push(`/patient/orders/${order.id}`);
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          modal: {
            ondismiss: () => {
              toast('Payment cancelled.', { icon: 'ℹ️' });
              setCreating(false);
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error('[checkout] Error:', err);
      toast.error('Something went wrong');
    }
    setCreating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Shipping Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
              <input type="text" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number *</label>
              <input type="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                placeholder="+91 98765 43210" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Address *</label>
            <textarea value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none resize-none" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">City *</label>
              <input type="text" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">State *</label>
              <input type="text" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Pincode *</label>
              <input type="text" value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes (optional)</label>
            <input type="text" value={shipping.notes} onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
              placeholder="Delivery instructions..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-20 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-gray-800 font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">{formatCurrency((item.salePrice || item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span></div>
            {shippingFee > 0 && <p className="text-xs text-primary-600">Free shipping on orders above {formatCurrency(500)}</p>}
            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={creating}
            className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:bg-primary-400 transition-colors"
          >
            {creating ? 'Processing...' : `Pay ${formatCurrency(total)}`}
          </button>

          <p className="text-xs text-gray-400 text-center">Secured by Razorpay. 100% safe payment.</p>
        </div>
      </div>
    </div>
  );
}
