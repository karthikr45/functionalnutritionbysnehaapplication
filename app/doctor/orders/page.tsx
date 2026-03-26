'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { STATUS_COLORS, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function DoctorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filter !== 'ALL') params.set('status', filter);
    if (search) params.set('search', search);
    fetch(`/api/orders?${params}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setTotalPages(d.totalPages || 1); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const handleUpdateStatus = async (orderId: string) => {
    if (!newStatus) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note: statusNote, trackingNumber: trackingNumber || undefined }),
    });
    setUpdating(false);
    if (res.ok) {
      toast.success('Order status updated!');
      setSelectedOrder(null);
      setNewStatus(''); setStatusNote(''); setTrackingNumber('');
      fetchOrders();
    } else toast.error('Failed to update status');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Order Management</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600'}`}>
              {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #..." className="px-4 py-2 border rounded-xl text-sm w-48" />
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><p className="text-5xl mb-4">📦</p><p className="text-gray-500">No orders found.</p></div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{order.orderNumber}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>{order.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-500">{order.user?.name} &bull; {order.user?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')} &bull; {order.items.length} items</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-xl hover:bg-primary-100"
                  >
                    {selectedOrder?.id === order.id ? 'Close' : 'Update'}
                  </button>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 rounded-b-2xl space-y-4">
                  {/* Items */}
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item: any) => (
                      <span key={item.id} className="text-xs bg-white px-3 py-1.5 rounded-lg border">{item.productName} x{item.quantity}</span>
                    ))}
                  </div>
                  {/* Shipping */}
                  <p className="text-xs text-gray-500">{order.shippingName}, {order.shippingAddress}, {order.shippingCity} - {order.shippingPincode}</p>
                  {/* Status Update */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
                      <option value="">Change Status...</option>
                      {STATUSES.filter((s) => s !== 'ALL').map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number" className="px-3 py-2 border rounded-xl text-sm" />
                    <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Note (optional)" className="px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <button onClick={() => handleUpdateStatus(order.id)} disabled={!newStatus || updating} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 hover:bg-primary-700">
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              )}
            </div>
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
