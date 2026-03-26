'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { STATUS_COLORS, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d.order); setLoading(false); })
      .catch(() => { setLoading(false); router.back(); });
  }, [id, router]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading order...</div>;
  if (!order) return null;

  const currentStep = ORDER_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'RETURNED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Orders
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">{format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a')}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Order Progress</h2>
          <div className="flex items-center justify-between">
            {ORDER_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                  i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i <= currentStep ? '✓' : i + 1}
                </div>
                <p className={`text-xs mt-2 text-center ${i <= currentStep ? 'text-primary-700 font-medium' : 'text-gray-400'}`}>
                  {step.replace(/_/g, ' ')}
                </p>
                {i < ORDER_STEPS.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-800">Tracking Number</p>
            <p className="text-primary-700 font-mono">{order.trackingNumber}</p>
          </div>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">
              Track Package
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Items ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(item.price)} x {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-800 text-sm">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Shipping */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-primary-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-primary-600">{formatCurrency(order.totalAmount)}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
              <p>{order.shippingPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Status History</h2>
          <div className="space-y-3">
            {order.statusHistory.map((h: any) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">{h.status.replace(/_/g, ' ')}</span>
                  {h.note && <span className="text-gray-500"> — {h.note}</span>}
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(h.createdAt), 'dd MMM yyyy, hh:mm a')} by {h.updatedBy?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
