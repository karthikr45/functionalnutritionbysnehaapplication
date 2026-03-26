import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: { select: { slug: true, images: true } } } },
      user: { select: { name: true, email: true, phone: true } },
      payment: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        include: { updatedBy: { select: { name: true } } },
      },
    },
  });

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isAdmin = ['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role);
  if (!isAdmin && order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ order });
}
