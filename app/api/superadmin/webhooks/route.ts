import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // 'processed' | 'failed' | 'unprocessed' | null
  const limit = Math.min(200, parseInt(searchParams.get('limit') || '50'));

  const where: any = {};
  if (status === 'processed') where.processed = true;
  if (status === 'unprocessed') where.processed = false;
  if (status === 'failed') where.errorMessage = { not: null };

  try {
    const events = await prisma.webhookEvent.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });
    return NextResponse.json({ events });
  } catch (e) {
    console.error('GET /api/superadmin/webhooks failed:', e);
    return NextResponse.json({ events: [], error: 'WebhookEvent table not available — run prisma migrate deploy' }, { status: 200 });
  }
}
