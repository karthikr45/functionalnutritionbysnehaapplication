'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  status: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  type: string;
  patientName: string;
  patientEmail: string;
  packageName: string | null;
  appointmentDate: string | null;
}

interface Stats {
  totalRevenue: number;
  totalTransactions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  weeklyRevenue: number;
  totalRefunded: number;
  refundCount: number;
}

const PERIODS = [
  { value: 'all', label: 'All Time' },
  { value: 'year', label: 'This Year' },
  { value: 'month', label: 'This Month' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'today', label: 'Today' },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  CONSULTATION: { label: 'Consultation', color: 'bg-blue-100 text-blue-700' },
  FOLLOW_UP: { label: 'Follow-up', color: 'bg-teal-100 text-teal-700' },
  PACKAGE_SESSION: { label: 'Package Session', color: 'bg-purple-100 text-purple-700' },
  PACKAGE: { label: 'Package Purchase', color: 'bg-indigo-100 text-indigo-700' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  REFUNDED: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-600',
};

export default function RevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/doctor/revenue?period=${period}`);
    const data = await res.json();
    setPayments(data.payments || []);
    setStats(data.stats || null);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [period]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Revenue & Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Complete payment history from Razorpay.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                period === p.value ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-emerald-50 text-emerald-700">💰</div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total Revenue</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-blue-50 text-blue-700">📊</div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="text-sm text-gray-500 mt-0.5">This Month</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-purple-50 text-purple-700">🧾</div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total Transactions</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-amber-50 text-amber-700">↩️</div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRefunded)}</p>
            <p className="text-sm text-gray-500 mt-0.5">Refunded ({stats.refundCount})</p>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading transactions...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🧾</p>
            <p className="text-gray-500">No transactions found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => {
                  const typeInfo = TYPE_LABELS[p.type] || TYPE_LABELS.OTHER;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{formatDate(p.createdAt)}</p>
                        {p.appointmentDate && (
                          <p className="text-xs text-gray-400 mt-0.5">Appt: {formatDate(p.appointmentDate)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{p.patientName}</p>
                        {p.patientEmail && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.patientEmail}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {p.packageName && (
                          <p className="text-xs text-gray-400 mt-1">{p.packageName}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-bold ${p.status === 'REFUNDED' ? 'text-amber-600 line-through' : 'text-gray-900'}`}>
                          {formatCurrency(p.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] || STATUS_STYLES.PENDING}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-gray-500 truncate max-w-[140px]">
                          {p.razorpayPaymentId || '—'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary footer */}
        {!loading && payments.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
            <p className="text-sm font-bold text-gray-800">
              Net: {formatCurrency(payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
