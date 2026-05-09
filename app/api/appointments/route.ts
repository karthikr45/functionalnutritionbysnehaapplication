import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// GET /api/appointments - list appointments for current user
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  let where: any = {};

  if (session.user.role === 'PATIENT') {
    const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ appointments: [] });
    where.patientId = profile.id;
  } else if (session.user.role === 'DOCTOR') {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ appointments: [] });
    where.doctorId = profile.id;
  }

  if (status) where.status = status;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true, image: true } } } },
        payment: true,
        packageBooking: { include: { package: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({ appointments, total, page, limit });
}

// POST /api/appointments - create new appointment
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { doctorId, date, startTime, endTime, type, healthConcerns, packageBookingId } = await req.json();

  if (!doctorId || !date || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!patientProfile) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });

  // Block new bookings if doctor is not accepting patients (except package sessions,
  // which are pre-paid and honored regardless)
  if (type !== 'PACKAGE_SESSION') {
    const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    if (!doctor.isAcceptingPatients) {
      return NextResponse.json(
        { error: 'Doctor is not currently accepting new appointments. Please try again later.' },
        { status: 403 }
      );
    }
  }

  // PENDING appointments older than this window are treated as abandoned —
  // their slot becomes bookable again. 15 minutes is generous for any
  // Razorpay checkout to complete.
  const PENDING_TTL_MS = 15 * 60 * 1000;
  const staleThreshold = new Date(Date.now() - PENDING_TTL_MS);

  // Clean up any stale PENDING appointments for this slot before the
  // conflict check, so abandoned-checkout rows don't permanently block
  // the slot.
  await prisma.appointment.deleteMany({
    where: {
      doctorId,
      date: new Date(date),
      startTime,
      status: 'PENDING',
      createdAt: { lt: staleThreshold },
    },
  });

  // Check slot not already booked. PENDING counts as blocking only if
  // it's within the TTL (active checkout).
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: new Date(date),
      startTime,
      OR: [
        { status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] } },
        { status: 'PENDING', createdAt: { gte: staleThreshold } },
      ],
    },
  });
  if (conflict) return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientProfile.id,
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      type: type || 'CONSULTATION',
      healthConcerns,
      packageBookingId: packageBookingId || null,
      status: 'PENDING',
    },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
    },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
