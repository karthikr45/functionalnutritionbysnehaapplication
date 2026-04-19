import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';
import {
  sendEmail,
  appointmentConfirmationEmail,
  doctorAppointmentNotifyEmail,
  packagePurchasedEmail,
} from '@/lib/email';
import { formatDate, formatTime } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'SUCCESS',
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || '';

    // Appointment flow
    if (payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      const appt = await prisma.appointment.findUnique({
        where: { id: payment.appointmentId },
        include: {
          patient: { include: { user: { select: { name: true, email: true } } } },
          doctor: { include: { user: { select: { name: true, email: true } } } },
        },
      });

      if (appt) {
        const commonData = {
          patientName: appt.patient.user.name,
          doctorName: appt.doctor.user.name,
          date: formatDate(appt.date),
          time: formatTime(appt.startTime),
          type: appt.type.replace('_', ' '),
          amount: payment.amount,
          appointmentUrl: `${baseUrl}/patient/appointments`,
        };

        if (appt.patient.user.email) {
          sendEmail({
            to: appt.patient.user.email,
            subject: 'Appointment Confirmed',
            html: appointmentConfirmationEmail(commonData),
          }).catch((e) => console.error('[email/patient-confirm] failed:', e));
        }

        if (appt.doctor.user.email) {
          sendEmail({
            to: appt.doctor.user.email,
            subject: `New appointment — ${appt.patient.user.name}`,
            html: doctorAppointmentNotifyEmail({
              ...commonData,
              appointmentUrl: `${baseUrl}/doctor/appointments`,
              healthConcerns: appt.healthConcerns || undefined,
            }),
          }).catch((e) => console.error('[email/doctor-notify] failed:', e));
        }
      }
    }

    // Package purchase flow
    if (packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (pkg) {
        const patientProfile = await prisma.patientProfile.findUnique({
          where: { userId: session.user.id },
          include: { user: { select: { name: true, email: true } } },
        });
        if (patientProfile) {
          const booking = await prisma.packageBooking.create({
            data: {
              patientId: patientProfile.id,
              packageId,
              totalSessions: pkg.sessions,
              expiryDate: addDays(new Date(), pkg.validity),
              status: 'ACTIVE',
            },
          });
          await prisma.payment.update({
            where: { id: payment.id },
            data: { packageBookingId: booking.id },
          });

          if (patientProfile.user.email) {
            sendEmail({
              to: patientProfile.user.email,
              subject: `Package Activated — ${pkg.name}`,
              html: packagePurchasedEmail({
                patientName: patientProfile.user.name,
                packageName: pkg.name,
                sessions: pkg.sessions,
                validityDays: pkg.validity,
                amount: payment.amount,
                packagesUrl: `${baseUrl}/patient/book`,
              }),
            }).catch((e) => console.error('[email/package] failed:', e));
          }
        }
      }
    }

    // Product order flow
    if (payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });
      await prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: 'CONFIRMED',
          note: 'Payment received',
          updatedById: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true, paymentId: payment.id });
  } catch (err: any) {
    console.error('[verify] Error:', err);
    return NextResponse.json({ error: 'Payment verification error' }, { status: 500 });
  }
}
