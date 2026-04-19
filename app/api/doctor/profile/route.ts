import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// GET public doctor profile (any user can view)
export async function GET() {
  const doctor = await prisma.doctorProfile.findFirst({
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  });
  return NextResponse.json({ doctor });
}

// PATCH - update own doctor profile (doctor only)
export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name, phone,
    bio, shortBio, specialization, qualifications, experience,
    consultationFee, followUpFee, profileImage, isAcceptingPatients,
    currentPassword, newPassword,
  } = body;

  const userUpdateData: any = {};
  if (name !== undefined) userUpdateData.name = String(name).trim();
  if (phone !== undefined) userUpdateData.phone = phone || null;

  // Password change requires current password verification
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return NextResponse.json({ error: 'Password change not supported for this account' }, { status: 400 });
    }
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    userUpdateData.password = await bcrypt.hash(newPassword, 10);
  }

  const profileUpdateData: any = {};
  if (bio !== undefined) profileUpdateData.bio = bio || null;
  if (shortBio !== undefined) profileUpdateData.shortBio = shortBio || null;
  if (specialization !== undefined) profileUpdateData.specialization = specialization || null;
  if (qualifications !== undefined) profileUpdateData.qualifications = qualifications || null;
  if (experience !== undefined) profileUpdateData.experience = Number(experience) || 0;
  if (consultationFee !== undefined) profileUpdateData.consultationFee = Number(consultationFee);
  if (followUpFee !== undefined) profileUpdateData.followUpFee = Number(followUpFee);
  if (profileImage !== undefined) profileUpdateData.profileImage = profileImage || null;
  if (isAcceptingPatients !== undefined) profileUpdateData.isAcceptingPatients = !!isAcceptingPatients;

  if (Object.keys(userUpdateData).length > 0) {
    await prisma.user.update({ where: { id: session.user.id }, data: userUpdateData });
  }
  if (Object.keys(profileUpdateData).length > 0) {
    await prisma.doctorProfile.update({ where: { userId: session.user.id }, data: profileUpdateData });
  }

  const updated = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { doctorProfile: true },
  });

  return NextResponse.json({ doctor: updated });
}
