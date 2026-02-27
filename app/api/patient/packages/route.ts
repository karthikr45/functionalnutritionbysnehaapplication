import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!patientProfile) return NextResponse.json({ bookings: [] });

  const bookings = await prisma.packageBooking.findMany({
    where: { patientId: patientProfile.id },
    include: {
      package: true,
      payment: true,
      appointments: { select: { id: true, date: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ bookings });
}
