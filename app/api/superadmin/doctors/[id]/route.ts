import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getRawAuthSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, phone, password, isActive, bio, shortBio, specialization, qualifications, experience, consultationFee, followUpFee, profileImage, isAcceptingPatients } = body;

  const doctor = await prisma.user.findUnique({
    where: { id: params.id },
    include: { doctorProfile: true },
  });
  if (!doctor || doctor.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
  }

  // Check for email conflicts
  if (email && email !== doctor.email) {
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const userUpdateData: any = {};
  if (name !== undefined) userUpdateData.name = name;
  if (email !== undefined) userUpdateData.email = email.trim().toLowerCase();
  if (phone !== undefined) userUpdateData.phone = phone || null;
  if (isActive !== undefined) userUpdateData.isActive = isActive;
  if (password) {
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    userUpdateData.password = await bcrypt.hash(password, 10);
  }

  const profileUpdateData: any = {};
  if (bio !== undefined) profileUpdateData.bio = bio || null;
  if (shortBio !== undefined) profileUpdateData.shortBio = shortBio || null;
  if (specialization !== undefined) profileUpdateData.specialization = specialization || null;
  if (qualifications !== undefined) profileUpdateData.qualifications = qualifications || null;
  if (experience !== undefined) profileUpdateData.experience = experience;
  if (consultationFee !== undefined) profileUpdateData.consultationFee = consultationFee;
  if (followUpFee !== undefined) profileUpdateData.followUpFee = followUpFee;
  if (profileImage !== undefined) profileUpdateData.profileImage = profileImage || null;
  if (isAcceptingPatients !== undefined) profileUpdateData.isAcceptingPatients = isAcceptingPatients;

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...userUpdateData,
      ...(Object.keys(profileUpdateData).length > 0 && doctor.doctorProfile && {
        doctorProfile: { update: profileUpdateData },
      }),
    },
    include: { doctorProfile: true },
  });

  return NextResponse.json({ doctor: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Soft delete — just deactivate
  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ message: 'Doctor deactivated' });
}
