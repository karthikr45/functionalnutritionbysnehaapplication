import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Support both id and slug
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const product = await prisma.product.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ message: 'Product deactivated' });
}
