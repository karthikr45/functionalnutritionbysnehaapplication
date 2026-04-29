'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RazorpayPayment from '@/components/RazorpayPayment';
import DoctorProfileCard, { DoctorProfileCardData } from '@/components/DoctorProfileCard';
import { formatCurrency, formatDate, STATUS_COLORS } from '@/lib/utils';

interface Package { id: string; name: string; description: string; price: number; sessions: number; validity: number; features: string[]; isPopular: boolean; }
interface PackageBooking { id: string; status: string; usedSessions: number; totalSessions: number; expiryDate: string; package: Package; payment: any; }

export default function PackagesPage() {
  return <Suspense><PackagesContent /></Suspense>;
}

function PackagesContent() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get('highlight');

  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [doctor, setDoctor] = useState<DoctorProfileCardData | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(highlight);
  const [tab, setTab] = useState<'buy' | 'my'>('buy');

  useEffect(() => {
    fetch('/api/packages').then((r) => r.json()).then((d) =>
      setPackages(d.packages.map((p: any) => ({ ...p, features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]') })))
    );
    fetch('/api/patient/packages').then((r) => r.json()).then((d) => setBookings(d.bookings || []));
    fetch('/api/doctor/profile').then((r) => r.json()).then((d) => setDoctor(d.doctor));
  }, []);

  const handlePaymentSuccess = () => {
    setSelectedPackageId(null);
    setTab('my');
    fetch('/api/patient/packages').then((r) => r.json()).then((d) => setBookings(d.bookings || []));
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackageId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Consultation Packages</h1>

      {doctor && tab === 'buy' && (
        <DoctorProfileCard doctor={doctor} showFees={false} />
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['buy', 'my'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'buy' ? '🛒 Buy a Package' : `📦 My Packages (${bookings.length})`}
          </button>
        ))}
      </div>

      {/* Buy a Package */}
      {tab === 'buy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl border-2 p-6 flex flex-col transition-all ${
                selectedPackageId === pkg.id
                  ? 'border-primary-500 bg-primary-50'
                  : pkg.isPopular
                  ? 'border-primary-300 bg-white shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary-200'
              }`}
            >
              {pkg.isPopular && (
                <span className="inline-block px-3 py-1 bg-accent-500 text-white text-xs font-bold rounded-full mb-3 self-start">
                  MOST POPULAR
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-lg font-serif">{pkg.name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">{pkg.description}</p>
              <p className="text-3xl font-bold text-primary-600 mb-1">{formatCurrency(pkg.price)}</p>
              <div className="flex gap-3 text-xs text-gray-500 mb-4">
                <span>🗓 {pkg.sessions} sessions</span>
                <span>⏳ {pkg.validity} days</span>
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {pkg.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-primary-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedPackageId(selectedPackageId === pkg.id ? null : pkg.id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                  selectedPackageId === pkg.id
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {selectedPackageId === pkg.id ? 'Deselect' : 'Select Package'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment section */}
      {tab === 'buy' && selectedPkg && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md">
          <h3 className="font-bold text-gray-800 mb-4">Complete Purchase</h3>
          <div className="space-y-2 text-sm mb-5 bg-primary-50 p-4 rounded-xl">
            <div className="flex justify-between"><span className="text-gray-500">Package</span><span className="font-medium">{selectedPkg.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sessions</span><span>{selectedPkg.sessions}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Validity</span><span>{selectedPkg.validity} days</span></div>
            <div className="flex justify-between font-bold border-t border-primary-200 pt-2">
              <span>Total</span><span className="text-primary-600">{formatCurrency(selectedPkg.price)}</span>
            </div>
          </div>
          <RazorpayPayment
            type="package"
            itemId={selectedPkg.id}
            amount={selectedPkg.price}
            packageId={selectedPkg.id}
            onSuccess={handlePaymentSuccess}
            label={`Buy ${selectedPkg.name} — ${formatCurrency(selectedPkg.price)}`}
          />
        </div>
      )}

      {/* My Packages */}
      {tab === 'my' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-gray-500 mb-4">You haven&apos;t purchased any packages yet.</p>
              <button onClick={() => setTab('buy')} className="text-primary-600 font-medium hover:underline">Browse packages →</button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{booking.package.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Expires {formatDate(booking.expiryDate)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Sessions Used</span>
                    <span className="font-semibold">{booking.usedSessions} / {booking.totalSessions}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-primary-600 rounded-full transition-all"
                      style={{ width: `${(booking.usedSessions / booking.totalSessions) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{booking.totalSessions - booking.usedSessions} sessions remaining</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
