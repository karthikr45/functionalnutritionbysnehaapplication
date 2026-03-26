import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status, note, trackingNumber, trackingUrl } = await req.json();
  if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(trackingUrl && { trackingUrl }),
      statusHistory: {
        create: { status, note, updatedById: session.user.id },
      },
    },
    include: { items: true },
  });

  // If delivered, update totalSold on products
  if (status === 'DELIVERED') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { totalSold: { increment: item.quantity } },
      });
    }
  }

  // If cancelled, restore stock
  if (status === 'CANCELLED') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  return NextResponse.json({ order });
}
