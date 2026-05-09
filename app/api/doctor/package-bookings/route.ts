import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// GET — list every patient's package booking. Single-doctor practice, so
// the doctor sees all bookings; superadmin can also access.
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || (session.user.role !== 'DOCTOR' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // ACTIVE | EXPIRED | COMPLETED | CANCELLED | null

    const where: any = {};
    if (status) where.status = status;

    const bookings = await prisma.packageBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        package: { select: { name: true, price: true, sessions: true, validity: true, serviceSlug: true } },
        patient: {
          select: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        payment: { select: { id: true, amount: true, status: true, mode: true, razorpayPaymentId: true, createdAt: true } },
      },
    });

    return NextResponse.json({ bookings });
  } catch (e) {
    console.error('GET /api/doctor/package-bookings failed:', e);
    return NextResponse.json({ bookings: [], error: 'Failed to load bookings' }, { status: 200 });
  }
}
