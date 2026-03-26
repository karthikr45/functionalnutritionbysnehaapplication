import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  const session = await getAuthSession();
  const showAll = session?.user?.role === 'DOCTOR' || session?.user?.role === 'SUPER_ADMIN';
  const categories = await prisma.productCategory.findMany({
    where: showAll ? {} : { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || !['DOCTOR', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, description, image, sortOrder } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const category = await prisma.productCategory.create({
    data: { name, slug: slugify(name), description, image, sortOrder: sortOrder || 0 },
  });
  return NextResponse.json({ category }, { status: 201 });
}
