import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true, image: true } } } },
      payment: true,
      documents: { include: { uploadedBy: { select: { name: true, role: true } } } },
      packageBooking: { include: { package: true } },
    },
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ appointment });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Patients can only cancel
  if (session.user.role === 'PATIENT') {
    if (body.status && body.status !== 'CANCELLED') {
      return NextResponse.json({ error: 'Patients can only cancel appointments' }, { status: 403 });
    }
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.doctorNotes && { doctorNotes: body.doctorNotes }),
      ...(body.dietPlanUrl && { dietPlanUrl: body.dietPlanUrl }),
      ...(body.videoCallLink && { videoCallLink: body.videoCallLink }),
    },
  });

  // If completing a package session, increment usedSessions
  if (body.status === 'COMPLETED' && appointment.packageBookingId) {
    await prisma.packageBooking.update({
      where: { id: appointment.packageBookingId },
      data: { usedSessions: { increment: 1 } },
    });
  }

  return NextResponse.json({ appointment: updated });
}
