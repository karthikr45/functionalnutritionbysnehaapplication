import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { STATUS_COLORS, formatTime } from '@/lib/utils';

export default async function DoctorDashboard() {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctorProfile) redirect('/login');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppts, upcomingAppts, totalPatients, completedTotal, pendingPayments] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id, date: { gte: today, lt: tomorrow }, status: { in: ['CONFIRMED', 'PENDING'] } },
      include: { patient: { include: { user: { select: { name: true, email: true, phone: true } } } } },
      orderBy: { startTime: 'asc' },
    }),
    prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id, date: { gte: tomorrow }, status: { in: ['CONFIRMED', 'PENDING'] } },
      take: 5,
      include: { patient: { include: { user: { select: { name: true } } } } },
      orderBy: { date: 'asc' },
    }),
    prisma.appointment.groupBy({
      by: ['patientId'],
      where: { doctorId: doctorProfile.id },
      _count: true,
    }),
    prisma.appointment.count({ where: { doctorId: doctorProfile.id, status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        appointment: { doctorId: doctorProfile.id },
      },
      _sum: { amount: true },
    }),
  ]);

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: '📅', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Patients', value: totalPatients.length, icon: '👥', color: 'bg-purple-50 text-purple-700' },
    { label: 'Completed Sessions', value: completedTotal, icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Total Revenue', value: `₹${((pendingPayments._sum.amount || 0) / 100).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Good day, Dr. {session.user.name?.split(' ').slice(1).join(' ')}! 👋</h1>
          <p className="text-gray-500 mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <Link href="/doctor/availability" className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors">
          Manage Availability
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Today&apos;s Schedule</h2>
            <span className="text-xs text-gray-400">{format(new Date(), 'dd MMM yyyy')}</span>
          </div>
          {todayAppts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🌿</p>
              <p className="text-gray-500 text-sm">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-16 text-center flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">{formatTime(appt.startTime)}</p>
                    <p className="text-xs text-gray-400">{formatTime(appt.endTime)}</p>
                  </div>
                  <div className="w-0.5 h-10 bg-primary-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{appt.patient.user.name}</p>
                    <p className="text-xs text-gray-500">{appt.patient.user.email}</p>
                    {appt.patient.user.phone && <p className="text-xs text-gray-400">{appt.patient.user.phone}</p>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Upcoming</h2>
            <Link href="/doctor/appointments" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {upcomingAppts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppts.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm leading-none">{format(appt.date, 'd')}</span>
                    <span className="text-primary-500 text-xs leading-none">{format(appt.date, 'MMM')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{appt.patient.user.name}</p>
                    <p className="text-xs text-gray-400">{formatTime(appt.startTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
