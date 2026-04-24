import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'all';

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

  const where: any = {
    status: { in: ['SUCCESS', 'REFUNDED'] },
    OR: [
      { appointment: { doctorId: doctorProfile.id } },
    ],
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  const [payments, totals] = await Promise.all([
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
  ]);

  // Stats for cards
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now); thisWeek.setDate(thisWeek.getDate() - 7);

  const [monthlyRevenue, weeklyRevenue, refundedTotal] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: thisMonth }, appointment: { doctorId: doctorProfile.id } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: thisWeek }, appointment: { doctorId: doctorProfile.id } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'REFUNDED', appointment: { doctorId: doctorProfile.id } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
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
}
