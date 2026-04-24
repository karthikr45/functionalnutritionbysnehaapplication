import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: { select: { userId: true } },
      doctor: { include: { user: { select: { id: true } } } },
    },
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify access
  const isDoctor = appointment.doctor.user.id === session.user.id;
  const isPatient = appointment.patient.userId === session.user.id;
  if (!isDoctor && !isPatient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { appointmentId: params.id },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });

  // Mark unread messages as read for the current user
  await prisma.message.updateMany({
    where: {
      appointmentId: params.id,
      senderId: { not: session.user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: { select: { userId: true } },
      doctor: { include: { user: { select: { id: true } } } },
    },
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isDoctor = appointment.doctor.user.id === session.user.id;
  const isPatient = appointment.patient.userId === session.user.id;
  if (!isDoctor && !isPatient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      appointmentId: params.id,
      senderId: session.user.id,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  // Notify the other party
  const recipientId = isDoctor ? appointment.patient.userId : appointment.doctor.user.id;
  createNotification({
    userId: recipientId,
    type: 'MESSAGE',
    title: `New message from ${session.user.name}`,
    message: content.trim().substring(0, 100),
    link: `/appointment/${params.id}`,
  }).catch(() => {});

  return NextResponse.json({ message }, { status: 201 });
}
