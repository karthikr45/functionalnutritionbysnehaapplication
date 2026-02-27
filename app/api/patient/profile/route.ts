import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { name, phone, ...profileData } = data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone },
  });

  const updated = await prisma.patientProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...profileData, phone },
    update: { ...profileData, phone },
  });

  return NextResponse.json({ profile: updated });
}
