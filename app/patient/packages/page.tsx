'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RazorpayPayment from '@/components/RazorpayPayment';
import DoctorProfileCard, { DoctorProfileCardData } from '@/components/DoctorProfileCard';
import { formatCurrency, formatDate, STATUS_COLORS } from '@/lib/utils';
import { getServiceMeta } from '@/lib/services';

interface Package { id: string; name: string; description: string; price: number; sessions: number; validity: number; features: string[]; isPopular: boolean; serviceSlug: string | null; }
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

  // Group packages by serviceSlug (program). 'general' = no slug set.
  const popular = useMemo(() => packages.filter((p) => p.isPopular), [packages]);
  const grouped = useMemo(() => {
    const map = new Map<string, Package[]>();
    for (const p of packages) {
      const key = p.serviceSlug || '__general__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [packages]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Consultation Packages</h1>

      {doctor && tab === 'buy' && (
        <DoctorProfileCard doctor={doctor} showFees={false} />
      )}

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

      {/* Buy a Package — segmented by Most Popular + program groups */}
      {tab === 'buy' && (
        <div className="space-y-12">
          {popular.length > 0 && (
            <section className="rounded-3xl bg-gradient-to-br from-amber-50 via-amber-50 to-white border border-amber-200/60 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                    <span>★</span> Most Popular
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-medium text-gray-900">Top picks</h2>
                  <p className="text-sm text-gray-600 mt-1">The programs picked most often.</p>
                </div>
              </div>
              <PackageGrid
                packages={popular}
                selectedId={selectedPackageId}
                onSelect={(id) => setSelectedPackageId(selectedPackageId === id ? null : id)}
                showProgramBadge
                allPackages={packages}
              />
            </section>
          )}

          {Array.from(grouped.entries()).map(([slug, pkgs]) => {
            const meta = getServiceMeta(slug === '__general__' ? null : slug);
            return (
              <section key={slug}>
                <div className="flex items-end justify-between gap-4 mb-5 pb-4 border-b border-gray-200 flex-wrap">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-medium text-gray-900">{meta.label}</h2>
                    <p className="text-sm italic mt-0.5 text-gray-500">{meta.tagline}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {pkgs.length} option{pkgs.length === 1 ? '' : 's'}
                  </span>
                </div>
                <PackageGrid
                  packages={pkgs}
                  selectedId={selectedPackageId}
                  onSelect={(id) => setSelectedPackageId(selectedPackageId === id ? null : id)}
                  allPackages={packages}
                />
              </section>
            );
          })}
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

function PackageGrid({
  packages,
  selectedId,
  onSelect,
  showProgramBadge = false,
  allPackages,
}: {
  packages: Package[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showProgramBadge?: boolean;
  allPackages: Package[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {packages.map((pkg) => {
        const meta = getServiceMeta(pkg.serviceSlug);
        const perSession = pkg.sessions > 0 ? pkg.price / pkg.sessions : pkg.price;

        // Compute "Save X%" relative to the most expensive per-session option
        // in the same program. Only shown when there's actually savings vs an
        // alternative in the group.
        const peers = allPackages.filter(
          (p) => p.id !== pkg.id && p.serviceSlug === pkg.serviceSlug && p.sessions > 0,
        );
        const peerMaxPerSession = peers.length
          ? Math.max(...peers.map((p) => p.price / p.sessions))
          : 0;
        const savePct =
          peerMaxPerSession > 0 && perSession < peerMaxPerSession
            ? Math.round(((peerMaxPerSession - perSession) / peerMaxPerSession) * 100)
            : 0;

        const isSelected = selectedId === pkg.id;
        return (
          <div
            key={pkg.id}
            className={`relative rounded-2xl p-6 flex flex-col transition-all ${
              isSelected
                ? 'border-2 border-primary-500 bg-primary-50 shadow-lg'
                : pkg.isPopular
                  ? 'border-2 border-amber-300 bg-white shadow-md hover:shadow-lg'
                  : 'border border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
          >
            {savePct >= 5 && (
              <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Save {savePct}%
              </div>
            )}

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {pkg.isPopular && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  ★ Popular
                </span>
              )}
              {showProgramBadge && (
                <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-[11px] font-semibold rounded-full">
                  <span className="truncate max-w-[180px]">{meta.label}</span>
                </span>
              )}
            </div>

            <h3 className="font-medium text-gray-900 text-xl font-serif leading-tight">{pkg.name}</h3>
            <p className="text-gray-500 text-sm mt-1.5 mb-5 leading-relaxed">{pkg.description}</p>

            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-700">{formatCurrency(pkg.price)}</span>
                {pkg.sessions > 1 && (
                  <span className="text-xs text-gray-400">≈ {formatCurrency(Math.round(perSession))}/session</span>
                )}
              </div>
              <div className="flex gap-3 text-xs text-gray-500 mt-2">
                <span className="inline-flex items-center gap-1">🗓 {pkg.sessions} sessions</span>
                <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-1">⏳ {pkg.validity} days validity</span>
              </div>
            </div>

            <ul className="space-y-2 flex-1 mb-5">
              {pkg.features.map((f: string) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary-500 mt-0.5 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelect(pkg.id)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                isSelected
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isSelected ? '✓ Selected' : 'Select Package'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
