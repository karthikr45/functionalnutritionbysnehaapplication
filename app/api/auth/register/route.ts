import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check OTP was verified
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: 'SIGNUP',
        verified: true,
        expiresAt: { gt: new Date(Date.now() - 60 * 60 * 1000) }, // within last hour
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Email not verified. Please verify your email with OTP first.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing && existing.isEmailVerified) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create or update user (in case of partial signup attempt)
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { name, password: hashed, phone, isEmailVerified: true },
          select: { id: true, name: true, email: true, role: true },
        })
      : await prisma.user.create({
          data: {
            name,
            email: normalizedEmail,
            password: hashed,
            phone,
            role: 'PATIENT',
            isEmailVerified: true,
            patientProfile: { create: { phone } },
          },
          select: { id: true, name: true, email: true, role: true },
        });

    // Clean up OTP records for this email
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, purpose: 'SIGNUP' },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
