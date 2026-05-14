import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// GET /api/doctor/reviews?status=pending|approved|rejected
// 'rejected' = isApproved=false AND approvedAt is not null (acted on)
// 'pending'  = isApproved=false AND approvedAt is null (never acted on)
// 'approved' = isApproved=true
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || (session.user.role !== 'DOCTOR' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = req.nextUrl.searchParams.get('status') || 'pending';
    const where: any = {};
    if (status === 'pending') {
      where.isApproved = false;
      where.approvedAt = null;
    } else if (status === 'approved') {
      where.isApproved = true;
    } else if (status === 'rejected') {
      where.isApproved = false;
      where.approvedAt = { not: null };
    }

    const reviews = await prisma.productReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });
    const counts = await prisma.$transaction([
      prisma.productReview.count({ where: { isApproved: false, approvedAt: null } }),
      prisma.productReview.count({ where: { isApproved: true } }),
      prisma.productReview.count({ where: { isApproved: false, approvedAt: { not: null } } }),
    ]);
    return NextResponse.json({
      reviews,
      counts: { pending: counts[0], approved: counts[1], rejected: counts[2] },
    });
  } catch (e) {
    console.error('GET /api/doctor/reviews failed:', e);
    return NextResponse.json({ reviews: [], counts: { pending: 0, approved: 0, rejected: 0 }, error: 'Failed to load reviews' }, { status: 200 });
  }
}
