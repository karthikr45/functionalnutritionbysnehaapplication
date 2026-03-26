import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const category = await prisma.productCategory.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json({ category });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const hasProducts = await prisma.product.count({ where: { categoryId: params.id } });
  if (hasProducts > 0) {
    await prisma.productCategory.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ message: 'Category deactivated (has products)' });
  }
  await prisma.productCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Category deleted' });
}
