import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

const EMPTY_STATS = {
  totalRevenue: 0,
  totalTransactions: 0,
  monthlyRevenue: 0,
  monthlyTransactions: 0,
  weeklyRevenue: 0,
  totalRefunded: 0,
  refundCount: 0,
};

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'all';
  // Default: only LIVE payments count as revenue. ?include=test shows everything.
  const includeTest = searchParams.get('include') === 'test';
  const modeFilter = includeTest ? undefined : 'LIVE';

  let dateFilter: any = {};
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    dateFilter = { gte: start };
  } else if (period === 'week') {
    const start = new Date(now); start.setDate(start.getDate() - 7);
    dateFilter = { gte: start };
  } else if (period === 'month') {
    const start = new Date(now); start.setDate(1); start.setHours(0, 0, 0, 0);
    dateFilter = { gte: start };
  } else if (period === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    dateFilter = { gte: start };
  }

  const buildScope = (withMode: boolean): any => ({
    appointment: { doctorId: doctorProfile.id },
    ...(withMode && modeFilter && { mode: modeFilter }),
  });

  const buildWhere = (withMode: boolean): any => ({
    ...buildScope(withMode),
    status: { in: ['SUCCESS', 'REFUNDED'] },
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  });

  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now); thisWeek.setDate(thisWeek.getDate() - 7);

  const runQueries = (withMode: boolean) => {
    const where = buildWhere(withMode);
    const baseScope = buildScope(withMode);
    return Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            select: {
              type: true,
              date: true,
              patient: { include: { user: { select: { name: true, email: true } } } },
            },
          },
          packageBooking: {
            select: {
              package: { select: { name: true } },
              patient: { include: { user: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.payment.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { ...baseScope, status: 'SUCCESS', createdAt: { gte: thisMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { ...baseScope, status: 'SUCCESS', createdAt: { gte: thisWeek } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { ...baseScope, status: 'REFUNDED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);
  };

  let payments: any[];
  let totals: any;
  let monthlyRevenue: any;
  let weeklyRevenue: any;
  let refundedTotal: any;
  let migrationPending = false;
  try {
    [payments, totals, monthlyRevenue, weeklyRevenue, refundedTotal] = await runQueries(true);
  } catch (e) {
    // If the Payment.mode column / PaymentMode enum hasn't been migrated
    // yet, return ZERO revenue rather than fall back to all payments
    // (which would show test transactions as live revenue and mislead
    // the doctor). Set a flag so the UI can surface a clear admin notice.
    console.warn('[revenue] mode column missing — returning zero revenue. Run prisma migrate deploy.');
    migrationPending = true;
    payments = [];
    const empty = { _sum: { amount: 0 }, _count: 0 };
    totals = empty;
    monthlyRevenue = empty;
    weeklyRevenue = empty;
    refundedTotal = empty;
  }

  return NextResponse.json({
    includeTest,
    migrationPending,
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      mode: p.mode ?? null,
      razorpayPaymentId: p.razorpayPaymentId,
      createdAt: p.createdAt,
      type: p.appointment?.type || (p.packageBookingId ? 'PACKAGE' : 'OTHER'),
      patientName: p.appointment?.patient?.user?.name || p.packageBooking?.patient?.user?.name || 'N/A',
      patientEmail: p.appointment?.patient?.user?.email || '',
      packageName: p.packageBooking?.package?.name || null,
      appointmentDate: p.appointment?.date || null,
    })),
    stats: {
      totalRevenue: totals._sum.amount || 0,
      totalTransactions: totals._count,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      monthlyTransactions: monthlyRevenue._count,
      weeklyRevenue: weeklyRevenue._sum.amount || 0,
      totalRefunded: refundedTotal._sum.amount || 0,
      refundCount: refundedTotal._count,
    },
  });
  } catch (e) {
    console.error('GET /api/doctor/revenue failed:', e);
    return NextResponse.json({ payments: [], stats: EMPTY_STATS, includeTest: false, error: 'Failed to load revenue' }, { status: 200 });
  }
}
