'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface RazorpayPaymentProps {
  type: 'appointment' | 'package';
  itemId: string;     // appointmentId or packageId
  amount: number;
  packageId?: string; // when type=appointment from a package
  onSuccess: (paymentId: string) => void;
  label?: string;
}

async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPayment({
  type, itemId, amount, packageId, onSuccess, label,
}: RazorpayPaymentProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Failed to load payment gateway. Check your connection.'); setLoading(false); return; }

      // Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          appointmentId: type === 'appointment' ? itemId : undefined,
          packageId: type === 'package' ? itemId : undefined,
        }),
      });

      if (!orderRes.ok) { toast.error('Could not initiate payment. Please try again.'); setLoading(false); return; }

      const { orderId, currency } = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'Gut Shell',
        description: type === 'appointment' ? 'Consultation Booking' : 'Package Booking',
        order_id: orderId,
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: { color: '#16a34a' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packageId: type === 'package' ? itemId : packageId,
              }),
            });

            if (verifyRes.ok) {
              const { paymentId } = await verifyRes.json();
              toast.success('Payment successful! Appointment confirmed.');
              onSuccess(paymentId);
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Verification error. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled.', { icon: 'ℹ️' });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors shadow-sm"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          <span>🔒</span>
          {label || `Pay ${formatCurrency(amount)}`}
        </>
      )}
    </button>
  );
}
