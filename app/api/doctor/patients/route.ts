import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// List patients who have had at least one appointment with the logged-in doctor.
// Used by the doctor's document upload form to populate the 'Assign to patient' dropdown.
export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctorProfile) return NextResponse.json({ patients: [] });

  const appts = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile.id },
    select: {
      patient: {
        select: {
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    distinct: ['patientId'],
  });

  const patients = appts.map((a) => ({
    userId: a.patient.userId,
    name: a.patient.user.name,
    email: a.patient.user.email,
  }));
  patients.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ patients });
}
