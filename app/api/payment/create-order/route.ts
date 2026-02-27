import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, appointmentId, packageId } = await req.json();

  let amount = 0;
  let receipt = '';

  if (type === 'appointment' && appointmentId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true },
    });
    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

    amount = appointment.type === 'FOLLOW_UP'
      ? appointment.doctor.followUpFee
      : appointment.doctor.consultationFee;
    receipt = `appt-${appointmentId.slice(-8)}`;
  } else if (type === 'package' && packageId) {
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    amount = pkg.price;
    receipt = `pkg-${packageId.slice(-8)}`;
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const order = await createRazorpayOrder(amount, receipt);

  // Store pending payment
  await prisma.payment.create({
    data: {
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      status: 'PENDING',
      ...(type === 'appointment' && { appointmentId }),
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
