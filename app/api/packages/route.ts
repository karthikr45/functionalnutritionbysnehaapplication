import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
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
