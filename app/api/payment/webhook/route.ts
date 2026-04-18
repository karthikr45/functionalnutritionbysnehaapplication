import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature (skip in development if no secret set)
    if (WEBHOOK_SECRET && !verifyWebhookSignature(body, signature)) {
      console.error('[webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`[webhook] Received event: ${eventType}`);

    if (eventType === 'payment.captured' || eventType === 'payment.authorized') {
      const razorpayPaymentId = event.payload.payment?.entity?.id;
      const razorpayOrderId = event.payload.payment?.entity?.order_id;
      const amount = event.payload.payment?.entity?.amount; // in paise

      if (!razorpayOrderId) {
        console.error('[webhook] No order_id in payload');
        return NextResponse.json({ status: 'ignored' });
      }

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
      });

      if (!payment) {
        console.error(`[webhook] Payment not found for order: ${razorpayOrderId}`);
        return NextResponse.json({ status: 'not_found' });
      }

      // Already processed
      if (payment.status === 'SUCCESS') {
        return NextResponse.json({ status: 'already_processed' });
      }

      // Update payment to SUCCESS
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          status: 'SUCCESS',
        },
      });

      // Confirm appointment if linked
      if (updatedPayment.appointmentId) {
        await prisma.appointment.update({
          where: { id: updatedPayment.appointmentId },
          data: { status: 'CONFIRMED' },
        });
      }

      // Confirm product order if linked
      if (updatedPayment.orderId) {
        const order = await prisma.order.findUnique({ where: { id: updatedPayment.orderId } });
        if (order && order.status === 'PENDING') {
          await prisma.order.update({
            where: { id: updatedPayment.orderId },
            data: { status: 'CONFIRMED' },
          });
          await prisma.orderStatusHistory.create({
            data: {
              orderId: updatedPayment.orderId,
              status: 'CONFIRMED',
              note: 'Payment confirmed via webhook',
              updatedById: order.userId,
            },
          });
        }
      }

      console.log(`[webhook] Payment ${razorpayPaymentId} processed successfully`);
    }

    if (eventType === 'payment.failed') {
      const razorpayOrderId = event.payload.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await prisma.payment.updateMany({
          where: { razorpayOrderId, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
      }
    }

    if (eventType === 'refund.created' || eventType === 'refund.processed') {
      const razorpayPaymentId = event.payload.refund?.entity?.payment_id;
      if (razorpayPaymentId) {
        await prisma.payment.updateMany({
          where: { razorpayPaymentId },
          data: { status: 'REFUNDED' },
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
