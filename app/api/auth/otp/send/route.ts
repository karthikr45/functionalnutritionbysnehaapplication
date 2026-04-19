import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, otpEmail, generateOtp } from '@/lib/email';
import { addMinutes } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, name } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: 'Email and purpose required' }, { status: 400 });
    }

    if (!['SIGNUP', 'RESET_PASSWORD'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // For SIGNUP, check if user already exists
    if (purpose === 'SIGNUP') {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing && existing.isEmailVerified) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    // For RESET_PASSWORD, check user exists
    if (purpose === 'RESET_PASSWORD') {
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        // Don't reveal that user doesn't exist
        return NextResponse.json({ success: true, message: 'If the email is registered, an OTP has been sent.' });
      }
    }

    // Rate limit: prevent spamming (max 1 OTP per minute per email)
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recentOtp) {
      return NextResponse.json({ error: 'Please wait 60 seconds before requesting another OTP.' }, { status: 429 });
    }

    // Generate OTP
    const otp = generateOtp();

    // Delete any old OTPs for this email+purpose
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, purpose },
    });

    // Create new OTP record (10 min expiry)
    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp,
        purpose,
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: purpose === 'SIGNUP' ? 'Verify Your Email' : 'Reset Your Password',
      html: otpEmail(otp, purpose, name),
    });

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err: any) {
    console.error('[otp/send] Error:', err);
    return NextResponse.json({ error: 'Failed to send OTP. Check email configuration.' }, { status: 500 });
  }
}
