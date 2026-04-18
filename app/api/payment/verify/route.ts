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

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Find existing payment record
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update payment record to SUCCESS
    const payment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'SUCCESS',
      },
    });

    // Handle appointment confirmation
    if (payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });
    }

    // Handle package booking creation
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

    // Handle product order confirmation
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
