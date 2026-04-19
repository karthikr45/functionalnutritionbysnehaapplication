import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getRawAuthSession } from '@/lib/auth';
import { sendEmail, doctorWelcomeEmail } from '@/lib/email';

export async function GET() {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    include: { doctorProfile: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ doctors });
}

export async function POST(req: NextRequest) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, phone, password, bio, shortBio, specialization, qualifications, experience, consultationFee, followUpFee, profileImage } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const doctor = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: hashed,
      phone: phone || null,
      role: 'DOCTOR',
      isEmailVerified: true,
      doctorProfile: {
        create: {
          bio: bio || null,
          shortBio: shortBio || null,
          specialization: specialization || null,
          qualifications: qualifications || null,
          experience: experience || 0,
          consultationFee: consultationFee || 500,
          followUpFee: followUpFee || 300,
          profileImage: profileImage || null,
          isAcceptingPatients: true,
        },
      },
    },
    include: { doctorProfile: true },
  });

  // Send welcome email with credentials
  try {
    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;
    await sendEmail({
      to: normalizedEmail,
      subject: 'Welcome — Your Doctor Account is Ready',
      html: doctorWelcomeEmail(name, normalizedEmail, password, loginUrl),
    });
  } catch (err) {
    console.error('[create-doctor] Email send failed:', err);
  }

  return NextResponse.json({ doctor }, { status: 201 });
}
