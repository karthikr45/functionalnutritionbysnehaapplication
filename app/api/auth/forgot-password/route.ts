import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail, passwordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your password — Gut Shell',
      html: passwordResetEmail(resetUrl, user.name),
    });

    return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' });
  } catch (err: any) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Failed to send password reset email. SMTP may not be configured.' }, { status: 500 });
  }
}
