import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRawAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get('search') || '';
  const role = req.nextUrl.searchParams.get('role') || '';

  const users = await prisma.user.findMany({
    where: {
      ...(role && role !== 'ALL' ? { role: role as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      role: { not: 'SUPER_ADMIN' },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          documents: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}
