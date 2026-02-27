import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { generateTimeSlots, getEndTime } from '@/lib/utils';
import { format, parseISO, isSunday, getDay } from 'date-fns';

// GET /api/availability?doctorId=xxx&month=2024-03  → returns available dates
// GET /api/availability?doctorId=xxx&date=2024-03-15 → returns time slots for that date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId');
  const date = searchParams.get('date');
  const month = searchParams.get('month');

  if (!doctorId) return NextResponse.json({ error: 'doctorId required' }, { status: 400 });

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: {
      availability: { where: { isActive: true } },
      blockedDates: true,
    },
  });

  if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

  // Return time slots for a specific date
  if (date) {
    const parsedDate = parseISO(date);
    const dayOfWeek = getDay(parsedDate);

    const avail = doctor.availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!avail) return NextResponse.json({ slots: [] });

    const isBlocked = doctor.blockedDates.some(
      (b) => format(b.date, 'yyyy-MM-dd') === date
    );
    if (isBlocked) return NextResponse.json({ slots: [] });

    // Get existing appointments for that date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: parsedDate,
        status: { notIn: ['CANCELLED'] },
      },
      select: { startTime: true },
    });

    const bookedTimes = existingAppointments.map((a) => a.startTime);
    const allSlots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration);

    const slots = allSlots.map((startTime) => ({
      startTime,
      endTime: getEndTime(startTime, avail.slotDuration),
      isAvailable: !bookedTimes.includes(startTime),
    }));

    return NextResponse.json({ slots });
  }

  // Return available dates for a month
  if (month) {
    const [year, monthNum] = month.split('-').map(Number);
    const availableDays = new Set(doctor.availability.map((a) => a.dayOfWeek));
    const blockedDates = new Set(doctor.blockedDates.map((b) => format(b.date, 'yyyy-MM-dd')));

    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const availableDates: string[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = getDay(parseISO(dateStr));
      const today = format(new Date(), 'yyyy-MM-dd');

      if (dateStr <= today) continue;
      if (!availableDays.has(dayOfWeek)) continue;
      if (blockedDates.has(dateStr)) continue;

      availableDates.push(dateStr);
    }

    return NextResponse.json({ availableDates });
  }

  return NextResponse.json({ error: 'Provide date or month param' }, { status: 400 });
}

// POST /api/availability - doctor sets availability
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slots } = await req.json();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

  // Delete existing and recreate
  await prisma.availability.deleteMany({ where: { doctorId: doctorProfile.id } });

  if (slots && slots.length > 0) {
    await prisma.availability.createMany({
      data: slots.map((s: any) => ({
        doctorId: doctorProfile.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration || 45,
        isActive: true,
      })),
    });
  }

  return NextResponse.json({ success: true });
}

// POST /api/availability/block - block specific dates
export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { date, reason, action } = await req.json();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

  if (action === 'block') {
    await prisma.blockedDate.create({
      data: { doctorId: doctorProfile.id, date: parseISO(date), reason },
    });
  } else if (action === 'unblock') {
    await prisma.blockedDate.deleteMany({
      where: { doctorId: doctorProfile.id, date: parseISO(date) },
    });
  }

  return NextResponse.json({ success: true });
}
