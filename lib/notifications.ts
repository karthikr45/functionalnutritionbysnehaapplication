import { prisma } from '@/lib/prisma';

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  return prisma.notification.createMany({ data: inputs });
}

export async function generateAppointmentReminders(userId: string) {
  const now = new Date();
  const soon = new Date(now.getTime() + 15 * 60 * 1000);

  const profile = await prisma.doctorProfile.findUnique({ where: { userId } })
    || await prisma.patientProfile.findUnique({ where: { userId } });

  if (!profile) return;

  const isDoctor = 'consultationFee' in profile;
  const idField = isDoctor ? 'doctorId' : 'patientId';

  const upcomingAppts = await prisma.appointment.findMany({
    where: {
      [idField]: profile.id,
      status: 'CONFIRMED',
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  });

  for (const appt of upcomingAppts) {
    const [hours, minutes] = appt.startTime.split(':').map(Number);
    const apptTime = new Date(appt.date);
    apptTime.setHours(hours, minutes, 0, 0);

    if (apptTime <= now || apptTime > soon) continue;

    const minutesUntil = Math.round((apptTime.getTime() - now.getTime()) / 60000);
    const reminderKey = `APPOINTMENT_REMINDER_${appt.id}`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'APPOINTMENT_REMINDER',
        message: { contains: appt.id },
        createdAt: { gte: new Date(now.getTime() - 20 * 60 * 1000) },
      },
    });

    if (existing) continue;

    const otherPerson = isDoctor ? appt.patient.user.name : `Dr. ${appt.doctor.user.name}`;
    await createNotification({
      userId,
      type: 'APPOINTMENT_REMINDER',
      title: `Appointment in ${minutesUntil} min`,
      message: `Your appointment with ${otherPerson} starts at ${appt.startTime}. ${appt.id}`,
      link: `/appointment/${appt.id}`,
    });
  }
}
