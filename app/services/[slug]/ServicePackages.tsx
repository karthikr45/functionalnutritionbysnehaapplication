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
          })),
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
    return <div className="text-center py-12 text-gray-400 text-sm">Loading packages...</div>;
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-16 border-t border-gray-200">
      <div className="text-center mb-10">
        <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Pricing</p>
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 font-serif mt-2">
          {serviceTitle} Packages
        </h2>
        <p className="text-gray-600 mt-3 max-w-xl mx-auto">
          Choose the package that best fits your needs. All packages include personalized support from your doctor.
        </p>
      </div>

      <div className={`grid gap-6 ${packages.length === 1 ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'}`}>
        {packages.map((pkg) => (
          <article key={pkg.id} className="relative rounded-3xl bg-olive-gradient text-white p-8 sm:p-10 flex flex-col">
            {pkg.isPopular && (
              <div className="absolute -top-3 right-6 bg-amber-400 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <h3 className="text-2xl font-medium font-serif mb-2">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-cream-dark/70 text-sm leading-relaxed mb-6">{pkg.description}</p>
            )}

            {pkg.features.length > 0 && (
              <ul className="space-y-3 mb-6 flex-1">
                {pkg.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-cream-dark/85 text-sm leading-relaxed">
                    <span className="text-primary-300 mt-0.5 shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto p-5 bg-white/10 backdrop-blur-sm rounded-2xl">
              <p className="text-[11px] text-primary-200 uppercase tracking-wider mb-1">Investment</p>
              <p className="text-2xl font-serif font-medium text-white">
                {formatCurrency(pkg.price)}
                <span className="text-sm text-cream-dark/70 font-sans font-normal ml-2">
                  · {pkg.sessions} sessions · {pkg.validity} days
                </span>
              </p>
            </div>

            <button
              onClick={() => handleSelect(pkg.id)}
              className="mt-5 w-full py-3 rounded-xl font-semibold text-sm bg-cream text-warm-footer hover:bg-white transition-colors"
            >
              {session?.user?.role === 'PATIENT'
                ? selectedId === pkg.id
                  ? 'Close'
                  : 'Buy Now'
                : session
                  ? 'Login as Patient'
                  : 'Sign Up to Buy'}
            </button>
          </article>
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
