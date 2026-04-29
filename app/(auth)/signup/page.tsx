'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Step = 'details' | 'otp';

export default function SignupPage() {
  return <Suspense><SignupContent /></Suspense>;
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');

  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, purpose: 'SIGNUP', name: form.name }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch {
      toast.error('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      // Verify OTP
      const verifyRes = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp, purpose: 'SIGNUP' }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        toast.error(err.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Register
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });

      if (!regRes.ok) {
        const err = await regRes.json();
        toast.error(err.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto login
      const loginResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.error) {
        toast.success('Account created! Please log in.');
        router.push('/login');
        return;
      }

      toast.success('Welcome to Gut Shell!');
      router.push(packageId ? `/patient/packages?highlight=${packageId}` : '/patient/dashboard');
    } catch {
      toast.error('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, purpose: 'SIGNUP', name: form.name }),
      });
      if (res.ok) toast.success('OTP resent!');
      else {
        const err = await res.json();
        toast.error(err.error || 'Failed to resend');
      }
    } catch {
      toast.error('Failed to resend');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            {step === 'details' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 'details' ? 'Start your health transformation journey today' : `We sent a 6-digit code to ${form.email}`}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          {packageId && step === 'details' && (
            <div className="mb-5 p-3 bg-primary-50 border border-primary-100 rounded-xl text-sm text-primary-700">
              🎯 You&apos;re signing up to book a package. Complete registration to proceed.
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required className="input" />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required className="input" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input" />
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" required minLength={8} className="input" />
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat your password" required className="input" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors shadow-sm mt-2">
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="input text-center text-2xl font-mono tracking-[0.5em]"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors shadow-sm">
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep('details')} className="text-gray-500 hover:underline">
                  ← Change email
                </button>
                <button type="button" onClick={handleResendOtp} disabled={loading} className="text-primary-600 font-medium hover:underline disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
