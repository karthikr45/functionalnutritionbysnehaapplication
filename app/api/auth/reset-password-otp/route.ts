import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP was used
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: 'RESET_PASSWORD',
        verified: true,
        expiresAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'OTP not verified or expired. Please restart the process.' }, { status: 400 });
    }

    // Validate OTP matches
    if (otpRecord.otp !== String(otp).trim()) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // Clean up OTP
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, purpose: 'RESET_PASSWORD' },
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err: any) {
    console.error('[reset-password-otp] Error:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
