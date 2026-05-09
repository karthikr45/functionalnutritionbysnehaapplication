import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { refundRazorpayPayment } from '@/lib/razorpay';
import { createNotifications } from '@/lib/notifications';
import {
  sendEmail,
  appointmentCancelledEmail,
  appointmentRescheduledEmail,
  appointmentConfirmationEmail,
  doctorAppointmentNotifyEmail,
} from '@/lib/email';
import { formatDate, formatTime } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true, image: true } } } },
      payment: true,
      documents: {
        select: {
          id: true, title: true, type: true, fileUrl: true, fileType: true,
          fileSize: true, notes: true, appointmentId: true, isShared: true,
          aiAnalyzedAt: true, createdAt: true,
          uploadedBy: { select: { name: true, role: true } },
        },
      },
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

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: { include: { user: { select: { name: true, email: true } } } },
      doctor: { include: { user: { select: { name: true, email: true } } } },
      payment: true,
    },
  });
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isReschedule = body.date || body.startTime || body.endTime;
  const isCancel = body.status === 'CANCELLED';

  // Permission rules for patients: may only cancel or reschedule their own appointments
  if (session.user.role === 'PATIENT') {
    if (appointment.patient.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Not your appointment' }, { status: 403 });
    }
    if (body.status && body.status !== 'CANCELLED') {
      return NextResponse.json({ error: 'Patients can only cancel or reschedule' }, { status: 403 });
    }
    if (body.doctorNotes || body.dietPlanUrl || body.videoCallLink) {
      return NextResponse.json({ error: 'Patients cannot set doctor fields' }, { status: 403 });
    }
  }

  // Block changes on already-cancelled or completed appointments
  if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
    return NextResponse.json({ error: `Appointment is ${appointment.status.toLowerCase()} and cannot be modified` }, { status: 400 });
  }

  // Handle reschedule — ensure new slot is free
  if (isReschedule) {
    const newDate = body.date ? new Date(body.date) : appointment.date;
    const newStart = body.startTime || appointment.startTime;
    const newEnd = body.endTime || appointment.endTime;

    // PENDING appointments older than 15 min are treated as abandoned (see
    // /api/appointments POST + /api/availability for matching logic).
    const PENDING_TTL_MS = 15 * 60 * 1000;
    const staleThreshold = new Date(Date.now() - PENDING_TTL_MS);
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        date: newDate,
        startTime: newStart,
        id: { not: appointment.id },
        OR: [
          { status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] } },
          { status: 'PENDING', createdAt: { gte: staleThreshold } },
        ],
      },
    });
    if (conflict) return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });

    body._newDate = newDate;
    body._newStart = newStart;
    body._newEnd = newEnd;
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(isReschedule && {
        date: body._newDate,
        startTime: body._newStart,
        endTime: body._newEnd,
      }),
      ...(body.doctorNotes !== undefined && { doctorNotes: body.doctorNotes }),
      ...(body.dietPlanUrl !== undefined && { dietPlanUrl: body.dietPlanUrl }),
      ...(body.videoCallLink !== undefined && { videoCallLink: body.videoCallLink }),
    },
  });

  // Increment package session usage on completion
  if (body.status === 'COMPLETED' && appointment.packageBookingId) {
    await prisma.packageBooking.update({
      where: { id: appointment.packageBookingId },
      data: { usedSessions: { increment: 1 } },
    });
  }

  // Refund on cancellation if paid (not package sessions — those restock the package instead)
  let refundAmount = 0;
  if (isCancel) {
    if (appointment.packageBookingId) {
      // Package session: do NOT charge a session — nothing to do, session stays available
    } else if (appointment.payment?.status === 'SUCCESS' && appointment.payment.razorpayPaymentId) {
      try {
        await refundRazorpayPayment(appointment.payment.razorpayPaymentId, appointment.payment.amount);
        await prisma.payment.update({
          where: { id: appointment.payment.id },
          data: { status: 'REFUNDED' },
        });
        refundAmount = appointment.payment.amount;
      } catch (err) {
        console.error('[appointments/cancel] Refund failed:', err);
        // Still mark appointment cancelled — operator can refund manually
      }
    }
  }

  // Fire-and-forget emails
  const patientEmail = appointment.patient.user.email;
  const patientName = appointment.patient.user.name;
  const doctorName = appointment.doctor.user.name;
  const appointmentUrl = `${process.env.NEXTAUTH_URL || ''}/patient/appointments`;

  if (isCancel && patientEmail) {
    sendEmail({
      to: patientEmail,
      subject: 'Appointment Cancelled',
      html: appointmentCancelledEmail({
        patientName,
        doctorName,
        date: formatDate(appointment.date),
        time: formatTime(appointment.startTime),
        type: appointment.type.replace('_', ' '),
        refundAmount,
      }),
    }).catch((e) => console.error('[email/cancel] failed:', e));
  }

  // Confirmation email when patient confirms a package-session booking (no payment step)
  const isNewConfirmation = body.status === 'CONFIRMED' && appointment.status === 'PENDING' && appointment.packageBookingId;
  if (isNewConfirmation && patientEmail) {
    const commonData = {
      patientName,
      doctorName,
      date: formatDate(appointment.date),
      time: formatTime(appointment.startTime),
      type: appointment.type.replace('_', ' '),
      amount: 0,
      appointmentUrl,
    };
    sendEmail({
      to: patientEmail,
      subject: 'Appointment Confirmed',
      html: appointmentConfirmationEmail(commonData),
    }).catch((e) => console.error('[email/confirm-package] failed:', e));

    const docEmail = appointment.doctor.user.email;
    if (docEmail) {
      sendEmail({
        to: docEmail,
        subject: `New appointment — ${patientName}`,
        html: doctorAppointmentNotifyEmail({
          ...commonData,
          appointmentUrl: `${process.env.NEXTAUTH_URL || ''}/doctor/appointments`,
        }),
      }).catch((e) => console.error('[email/doctor-notify-package] failed:', e));
    }
  }

  if (isReschedule && patientEmail) {
    sendEmail({
      to: patientEmail,
      subject: 'Appointment Rescheduled',
      html: appointmentRescheduledEmail({
        patientName,
        doctorName,
        date: formatDate(body._newDate),
        time: formatTime(body._newStart),
        oldDate: formatDate(appointment.date),
        oldTime: formatTime(appointment.startTime),
        type: appointment.type.replace('_', ' '),
        appointmentUrl,
      }),
    }).catch((e) => console.error('[email/reschedule] failed:', e));
  }

  // Create notifications
  const patientUserId = await prisma.patientProfile.findUnique({ where: { id: appointment.patientId }, select: { userId: true } });
  const doctorUserId = await prisma.doctorProfile.findUnique({ where: { id: appointment.doctorId }, select: { userId: true } });
  if (patientUserId && doctorUserId) {
    const notifs = [];
    if (isCancel) {
      notifs.push(
        { userId: patientUserId.userId, type: 'APPOINTMENT_CANCELLED', title: 'Appointment Cancelled', message: `Your appointment with Dt. ${doctorName} has been cancelled.${refundAmount > 0 ? ` Refund of ₹${refundAmount} initiated.` : ''}`, link: '/patient/appointments' },
        { userId: doctorUserId.userId, type: 'APPOINTMENT_CANCELLED', title: 'Appointment Cancelled', message: `${patientName} cancelled their appointment.`, link: '/doctor/appointments' },
      );
    }
    if (isReschedule) {
      notifs.push(
        { userId: patientUserId.userId, type: 'APPOINTMENT_RESCHEDULED', title: 'Appointment Rescheduled', message: `Your appointment with Dt. ${doctorName} has been rescheduled to ${formatDate(body._newDate)}.`, link: `/appointment/${appointment.id}` },
        { userId: doctorUserId.userId, type: 'APPOINTMENT_RESCHEDULED', title: 'Appointment Rescheduled', message: `${patientName} rescheduled to ${formatDate(body._newDate)}.`, link: `/appointment/${appointment.id}` },
      );
    }
    if (notifs.length > 0) createNotifications(notifs).catch(() => {});
  }

  return NextResponse.json({ appointment: updated, refundAmount });
}
