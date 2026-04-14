import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ package: pkg });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.package.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.sessions !== undefined && { sessions: body.sessions }),
      ...(body.validity !== undefined && { validity: body.validity }),
      ...(body.features !== undefined && { features: body.features }),
      ...(body.serviceSlug !== undefined && { serviceSlug: body.serviceSlug || null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isPopular !== undefined && { isPopular: body.isPopular }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });

  return NextResponse.json({ package: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pkg = await prisma.package.findUnique({
    where: { id: params.id },
    include: { bookings: { where: { status: 'ACTIVE' } } },
  });

  if (!pkg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If there are active bookings, deactivate instead of deleting
  if (pkg.bookings.length > 0) {
    await prisma.package.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ message: 'Package deactivated (has active bookings)' });
  }

  await prisma.package.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Package deleted' });
}
