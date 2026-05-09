'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getServiceLabel } from '@/lib/services';

interface Booking {
  id: string;
  totalSessions: number;
  usedSessions: number;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  package: { name: string; price: number; sessions: number; validity: number; serviceSlug: string | null };
  patient: { user: { name: string; email: string; phone: string | null } };
  payment: { id: string; amount: number; status: string; mode?: string | null; razorpayPaymentId: string | null; createdAt: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function PackageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL'
        ? '/api/doctor/package-bookings'
        : `/api/doctor/package-bookings?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const FILTERS: { value: typeof filter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const totalRevenue = bookings
    .filter((b) => b.payment?.status === 'SUCCESS')
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Package Purchases</h1>
        <p className="text-sm text-gray-500 mt-1">Patients who have bought a program package.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                filter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {bookings.length} purchase{bookings.length === 1 ? '' : 's'} · {' '}
          <span className="font-semibold text-primary-700">{formatCurrency(totalRevenue)}</span> revenue
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 text-sm">No package purchases {filter !== 'ALL' ? `(${filter.toLowerCase()})` : ''} yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Patient</th>
                  <th className="px-5 py-3 text-left font-semibold">Package</th>
                  <th className="px-5 py-3 text-left font-semibold">Program</th>
                  <th className="px-5 py-3 text-left font-semibold">Sessions</th>
                  <th className="px-5 py-3 text-left font-semibold">Expires</th>
                  <th className="px-5 py-3 text-left font-semibold">Amount</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Purchased</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{b.patient.user.name}</p>
                      <p className="text-xs text-gray-500">{b.patient.user.email}</p>
                      {b.patient.user.phone && (
                        <p className="text-xs text-gray-400">{b.patient.user.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">{b.package.name}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {getServiceLabel(b.package.serviceSlug)}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      <span className="font-medium">{b.usedSessions}</span>
                      <span className="text-gray-400"> / {b.totalSessions}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(b.expiryDate)}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-primary-700">{formatCurrency(b.payment?.amount || b.package.price)}</p>
                      {b.payment?.mode === 'TEST' && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Test</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
