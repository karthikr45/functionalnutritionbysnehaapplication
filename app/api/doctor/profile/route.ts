import { NextRequest, NextResponse } from 'next/server';
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

// PATCH - update doctor profile (doctor only)
export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { name, phone, ...profileData } = data;

  // Update user
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone },
  });

  // Update doctor profile
  const updated = await prisma.doctorProfile.update({
    where: { userId: session.user.id },
    data: profileData,
  });

  return NextResponse.json({ profile: updated });
}
