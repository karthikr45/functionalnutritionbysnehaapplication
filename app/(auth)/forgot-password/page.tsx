'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'RESET_PASSWORD' }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      toast.success('If the email is registered, an OTP has been sent.');
      setStep('otp');
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      const verifyRes = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose: 'RESET_PASSWORD' }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        toast.error(err.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      const resetRes = await fetch('/api/auth/reset-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!resetRes.ok) {
        const err = await resetRes.json();
        toast.error(err.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      toast.success('Password reset successfully!');
      setStep('success');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-dark to-cream flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Enter OTP & New Password'}
            {step === 'success' && 'Password Reset!'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && `We sent a 6-digit code to ${email}`}
            {step === 'success' && 'Redirecting you to login...'}
          </p>
        </div>

        <div className="bg-cream rounded-3xl shadow-lg border border-primary-100/30 p-8">
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="input" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="label">6-digit OTP</label>
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
              <div>
                <label className="label">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="input" />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required className="input" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-500 hover:underline">
                ← Change email
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-gray-600">Password reset successful! Redirecting to login...</p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
