import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

/**
 * Try to persist a WebhookEvent audit row. If the WebhookEvent table
 * doesn't exist yet (migration not applied), log a warning and continue
 * — payment processing must never be blocked by audit-logging issues.
 * Returns:
 *   { logId, alreadyProcessed }
 *     logId: Prisma id of the created/found row, or null if logging is unavailable
 *     alreadyProcessed: true if this exact eventId was already marked processed
 */
async function persistEvent(args: {
  source: string;
  eventId: string;
  eventType: string;
  rawPayload: any;
  signatureOk: boolean;
}): Promise<{ logId: string | null; alreadyProcessed: boolean }> {
  try {
    // Idempotency: if we've already seen and processed this eventId, no-op.
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: args.eventId },
      select: { id: true, processed: true },
    });
    if (existing) {
      return { logId: existing.id, alreadyProcessed: existing.processed };
    }

    const created = await prisma.webhookEvent.create({
      data: {
        source: args.source,
        eventId: args.eventId,
        eventType: args.eventType,
        rawPayload: args.rawPayload,
        signatureOk: args.signatureOk,
      },
      select: { id: true },
    });
    return { logId: created.id, alreadyProcessed: false };
  } catch (err) {
    console.warn('[webhook] WebhookEvent table unavailable; continuing without audit log. Run prisma migrate deploy to enable.', err);
    return { logId: null, alreadyProcessed: false };
  }
}

async function markProcessed(logId: string | null, errorMessage?: string) {
  if (!logId) return;
  try {
    await prisma.webhookEvent.update({
      where: { id: logId },
      data: {
        processed: !errorMessage,
        errorMessage: errorMessage || null,
        processedAt: new Date(),
      },
    });
  } catch {
    /* ignore — audit log shouldn't fail the webhook */
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  // Parse early so we have eventId for the audit log even if signature fails.
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    console.error('[webhook] Invalid JSON body');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType: string = event?.event || 'unknown';
  // Razorpay's per-event id is at top-level: event.id (e.g. 'evt_NXXXX')
  // Fallback to a synthetic key if missing so we don't crash, but log a warning.
  const eventId: string = event?.id || `${eventType}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (!event?.id) {
    console.warn('[webhook] Payload missing top-level event.id; using synthetic key');
  }

  const signatureOk = !!WEBHOOK_SECRET && verifyWebhookSignature(body, signature);

  // Always audit log the inbound event, including signature-failed ones.
  const { logId, alreadyProcessed } = await persistEvent({
    source: 'razorpay',
    eventId,
    eventType,
    rawPayload: event,
    signatureOk,
  });

  // Reject if signature invalid (only if a secret is configured).
  if (WEBHOOK_SECRET && !signatureOk) {
    console.error('[webhook] Invalid signature for event', eventId);
    await markProcessed(logId, 'Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency: don't reprocess the same Razorpay event.
  if (alreadyProcessed) {
    console.log(`[webhook] Event ${eventId} (${eventType}) already processed; ignoring`);
    return NextResponse.json({ status: 'already_processed' });
  }

  console.log(`[webhook] Received event ${eventId}: ${eventType}`);

  try {
    if (eventType === 'payment.captured' || eventType === 'payment.authorized') {
      const razorpayPaymentId = event.payload.payment?.entity?.id;
      const razorpayOrderId = event.payload.payment?.entity?.order_id;

      if (!razorpayOrderId) {
        console.error('[webhook] No order_id in payload');
        await markProcessed(logId);
        return NextResponse.json({ status: 'ignored' });
      }

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
      });

      if (!payment) {
        console.error(`[webhook] Payment not found for order: ${razorpayOrderId}`);
        await markProcessed(logId, `Payment row not found for order ${razorpayOrderId}`);
        return NextResponse.json({ status: 'not_found' });
      }

      if (payment.status === 'SUCCESS') {
        await markProcessed(logId);
        return NextResponse.json({ status: 'already_processed' });
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { razorpayPaymentId, status: 'SUCCESS' },
      });

      if (updatedPayment.appointmentId) {
        await prisma.appointment.update({
          where: { id: updatedPayment.appointmentId },
          data: { status: 'CONFIRMED' },
        });
      }

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

    await markProcessed(logId);
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    await markProcessed(logId, err?.message || 'Unknown error');
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
