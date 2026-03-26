import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRawAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const theme = await prisma.themeSettings.findUnique({ where: { id: 'global' } });
    return NextResponse.json({ theme: theme || { primaryColor: '#636B2F' } });
  } catch {
    return NextResponse.json({ theme: { primaryColor: '#636B2F' } });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getRawAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { primaryColor } = await req.json();
  if (!primaryColor || !/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
    return NextResponse.json({ error: 'Invalid color format' }, { status: 400 });
  }

  const theme = await prisma.themeSettings.upsert({
    where: { id: 'global' },
    update: { primaryColor },
    create: { id: 'global', primaryColor },
  });

  return NextResponse.json({ theme });
}
