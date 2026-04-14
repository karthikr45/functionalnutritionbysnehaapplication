import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  const serviceSlug = req.nextUrl.searchParams.get('service');
  // Doctors see all packages (including inactive) for management
  const showAll = session?.user?.role === 'DOCTOR' || session?.user?.role === 'SUPER_ADMIN';

  const where: any = showAll ? {} : { isActive: true };
  if (serviceSlug) {
    where.serviceSlug = serviceSlug;
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role === 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const pkg = await prisma.package.create({ data });
  return NextResponse.json({ package: pkg }, { status: 201 });
}
