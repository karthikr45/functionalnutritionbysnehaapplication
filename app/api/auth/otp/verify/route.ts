import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, purpose } = await req.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json({ error: 'Email, OTP, and purpose required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = await prisma.otpVerification.findFirst({
      where: { email: normalizedEmail, purpose, verified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 404 });
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Check attempts (max 5)
    if (record.attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
    }

    // Increment attempts
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify OTP
    if (record.otp !== String(otp).trim()) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err: any) {
    console.error('[otp/verify] Error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
