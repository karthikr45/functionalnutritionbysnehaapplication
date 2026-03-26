'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { STATUS_COLORS, formatCurrency } from '@/lib/utils';

export default function PatientOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setTotalPages(d.totalPages || 1); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">My Orders</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-semibold text-gray-700 mb-2">No orders yet</h3>
          <Link href="/products" className="text-primary-600 font-medium hover:underline">Browse products →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/patient/orders/${order.id}`} className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="w-10 h-10 bg-gray-100 rounded-lg border-2 border-white overflow-hidden">
                      {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                    </div>
                  ))}
                  {order.items.length > 3 && <div className="w-10 h-10 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center text-xs text-gray-500">+{order.items.length - 3}</div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>
                <p className="font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
              </div>
            </Link>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-white border rounded-xl text-sm disabled:opacity-50">Previous</button>
              <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border rounded-xl text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
