'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import RazorpayPayment from '@/components/RazorpayPayment';
import toast from 'react-hot-toast';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  validity: number;
  features: string[];
  isPopular: boolean;
}

export default function ServicePackages({ serviceSlug, serviceTitle }: { serviceSlug: string; serviceTitle: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/packages?service=${serviceSlug}`)
      .then((r) => r.json())
      .then((d) => {
        setPackages(
          (d.packages || []).map((p: any) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [serviceSlug]);

  const handleSelect = (pkgId: string) => {
    if (!session) {
      router.push(`/signup?package=${pkgId}`);
      return;
    }
    if (session.user.role !== 'PATIENT') {
      toast.error('Only patients can purchase packages.');
      return;
    }
    setSelectedId(selectedId === pkgId ? null : pkgId);
  };

  const handlePaymentSuccess = () => {
    toast.success('Package purchased successfully!');
    router.push('/patient/packages');
  };

  const selected = packages.find((p) => p.id === selectedId);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">Loading packages...</div>
    );
  }

  if (packages.length === 0) {
    return null; // Don't show the section if no packages
  }

  return (
    <section className="mt-16 pt-16 border-t border-gray-200">
      <div className="text-center mb-10">
        <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Pricing</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mt-2">
          {serviceTitle} Packages
        </h2>
        <p className="text-gray-600 mt-3 max-w-xl mx-auto">
          Choose the package that best fits your needs. All packages include personalized support from your doctor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative rounded-2xl p-6 flex flex-col ${
              pkg.isPopular
                ? 'bg-primary-600 text-white shadow-2xl lg:scale-105'
                : 'bg-white text-gray-800 shadow-md border border-gray-100'
            }`}
          >
            {pkg.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <h3 className={`text-lg font-bold font-serif ${pkg.isPopular ? 'text-white' : 'text-gray-900'}`}>
              {pkg.name}
            </h3>
            <p className={`mt-2 text-xs leading-relaxed ${pkg.isPopular ? 'text-primary-100' : 'text-gray-500'}`}>
              {pkg.description}
            </p>
            <div className="mt-4 mb-3">
              <span className={`text-3xl font-bold ${pkg.isPopular ? 'text-white' : 'text-primary-600'}`}>
                {formatCurrency(pkg.price)}
              </span>
            </div>
            <div className={`flex gap-3 text-xs mb-4 ${pkg.isPopular ? 'text-primary-100' : 'text-gray-500'}`}>
              <span>🗓 {pkg.sessions} Sessions</span>
              <span>⏳ {pkg.validity} days</span>
            </div>
            <ul className="space-y-2 flex-1 mb-5 text-sm">
              {pkg.features.map((feature: string) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pkg.isPopular ? 'text-primary-300' : 'text-primary-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-xs ${pkg.isPopular ? 'text-primary-50' : 'text-gray-600'}`}>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(pkg.id)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                pkg.isPopular
                  ? 'bg-white text-primary-600 hover:bg-primary-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {session?.user?.role === 'PATIENT'
                ? selectedId === pkg.id ? 'Close' : 'Buy Now'
                : session ? 'Login as Patient' : 'Sign Up to Buy'}
            </button>
          </div>
        ))}
      </div>

      {/* Payment section */}
      {selected && session?.user?.role === 'PATIENT' && (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl border border-primary-200 shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Complete Purchase</h3>
          <div className="space-y-2 text-sm bg-primary-50 p-4 rounded-xl mb-5">
            <div className="flex justify-between"><span className="text-gray-500">Package</span><span className="font-medium">{selected.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sessions</span><span>{selected.sessions}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Validity</span><span>{selected.validity} days</span></div>
            <div className="flex justify-between font-bold border-t border-primary-200 pt-2">
              <span>Total</span><span className="text-primary-600">{formatCurrency(selected.price)}</span>
            </div>
          </div>
          <RazorpayPayment
            type="package"
            itemId={selected.id}
            amount={selected.price}
            packageId={selected.id}
            onSuccess={handlePaymentSuccess}
            label={`Pay ${formatCurrency(selected.price)} via Razorpay`}
          />
        </div>
      )}
    </section>
  );
}
