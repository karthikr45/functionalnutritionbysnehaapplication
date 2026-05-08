import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, appointmentId, packageId, orderId } = await req.json();

    let amount = 0;
    let receipt = '';

    if (type === 'appointment' && appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true },
      });
      if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

      amount = appointment.doctor.consultationFee;
      receipt = `appt-${appointmentId.slice(-8)}`;
    } else if (type === 'package' && packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

      // Require patient profile to have at least the basic contact fields
      // before they can purchase a program package. Prevents anonymous /
      // half-onboarded buyers from completing checkout.
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
        include: { user: { select: { name: true, email: true, phone: true } } },
      });
      const phone = patient?.user?.phone || patient?.phone;
      const missing: string[] = [];
      if (!patient?.user?.name?.trim()) missing.push('name');
      if (!phone?.trim()) missing.push('phone');
      if (!patient?.dateOfBirth) missing.push('date of birth');
      if (!patient?.address?.trim() || !patient?.city?.trim() || !patient?.pincode?.trim()) missing.push('address');
      if (missing.length > 0) {
        return NextResponse.json(
          {
            error: `Please complete your profile before purchasing. Missing: ${missing.join(', ')}.`,
            missingFields: missing,
            redirect: '/patient/profile',
          },
          { status: 400 },
        );
      }

      amount = pkg.price;
      receipt = `pkg-${packageId.slice(-8)}`;
    } else if (type === 'order' && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      amount = order.totalAmount;
      receipt = `ord-${orderId.slice(-8)}`;
    } else {
      return NextResponse.json({ error: 'Invalid request. Provide type + appointmentId/packageId/orderId' }, { status: 400 });
    }

    if (amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const razorpayOrder = await createRazorpayOrder(amount, receipt);

    // Store pending payment
    await prisma.payment.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        status: 'PENDING',
        ...(type === 'appointment' && appointmentId && { appointmentId }),
        ...(type === 'order' && orderId && { orderId }),
      },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('[create-order] Error:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
