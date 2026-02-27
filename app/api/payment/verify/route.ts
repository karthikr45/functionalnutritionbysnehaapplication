import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = await req.json();

  // Verify signature
  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValid) {
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: 'FAILED' },
    });
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
  }

  // Update payment record
  const payment = await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'SUCCESS',
    },
  });

  // Confirm the appointment if linked
  if (payment.appointmentId) {
    await prisma.appointment.update({
      where: { id: payment.appointmentId },
      data: { status: 'CONFIRMED' },
    });
  }

  // Create package booking if packageId provided
  if (packageId) {
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (pkg) {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
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
      }
    }
  }

  return NextResponse.json({ success: true, paymentId: payment.id });
}
