import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { STATUS_COLORS, formatDate, formatTime } from '@/lib/utils';


export default async function PatientDashboard() {
  const session = await getAuthSession();
  if (!session) redirect('/login');

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        orderBy: { date: 'asc' },
        where: { status: { in: ['PENDING', 'CONFIRMED'] }, date: { gte: new Date() } },
        take: 5,
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          payment: true,
        },
      },
      packageBookings: {
        where: { status: 'ACTIVE' },
        include: { package: true },
      },
    },
  });

  // Count 'real' consultations only — exclude CANCELLED, NO_SHOW, and
  // expired PENDING ghosts (abandoned checkouts older than 15 min).
  // Mirrors the filter used by /patient/appointments so dashboard numbers
  // match what the patient sees on the list page.
  const PENDING_TTL_MS = 15 * 60 * 1000;
  const staleThreshold = new Date(Date.now() - PENDING_TTL_MS);
  const totalAppointments = await prisma.appointment.count({
    where: {
      patient: { userId: session.user.id },
      OR: [
        { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        { status: 'PENDING', createdAt: { gte: staleThreshold } },
        { status: 'PENDING', packageBookingId: { not: null } },
      ],
    },
  });

  const completedAppointments = await prisma.appointment.count({
    where: { patient: { userId: session.user.id }, status: 'COMPLETED' },
  });

  const recentDocs = await prisma.document.findMany({
    where: { uploadedById: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const totalDocs = await prisma.document.count({
    where: { uploadedById: session.user.id },
  });

  const stats = [
    { label: 'Total Consultations', value: totalAppointments, icon: '🗓', color: 'bg-blue-50 text-blue-700', href: '/patient/appointments' },
    { label: 'Completed Sessions', value: completedAppointments, icon: '✅', color: 'bg-primary-50 text-primary-700', href: '/patient/appointments?status=COMPLETED' },
    { label: 'Active Packages', value: patientProfile?.packageBookings.length || 0, icon: '📦', color: 'bg-purple-50 text-purple-700', href: '/patient/packages' },
    { label: 'Documents Uploaded', value: totalDocs, icon: '📄', color: 'bg-amber-50 text-amber-700', href: '/patient/documents' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
            Good day, {session.user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Here&apos;s your health journey overview.</p>
        </div>
        <Link
          href="/patient/book"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm whitespace-nowrap self-start"
        >
          + Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Upcoming Appointments</h2>
            <Link href="/patient/appointments" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {patientProfile?.appointments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-gray-500 text-sm mb-4">No upcoming appointments</p>
              <Link href="/patient/book" className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
                Book your first consultation →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {patientProfile?.appointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-lg leading-none">{format(appt.date, 'd')}</span>
                    <span className="text-primary-500 text-xs">{format(appt.date, 'MMM')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {appt.doctor.user.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {appt.status === 'CONFIRMED' && (
                      <Link
                        href={`/consultation/${appt.id}`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        📹 Join
                      </Link>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Active Packages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Active Packages</h2>
            {patientProfile?.packageBookings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-3">No active packages</p>
                <Link href="/patient/packages" className="text-xs text-primary-600 hover:underline">Browse packages →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {patientProfile?.packageBookings.map((booking) => (
                  <div key={booking.id} className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <p className="font-semibold text-gray-800 text-sm">{booking.package.name}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{booking.usedSessions}/{booking.totalSessions} sessions</span>
                        <span>Expires {formatDate(booking.expiryDate)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div
                          className="h-1.5 bg-primary-600 rounded-full"
                          style={{ width: `${booking.totalSessions > 0 ? (booking.usedSessions / booking.totalSessions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Documents</h2>
              <Link href="/patient/documents" className="text-xs text-primary-600 hover:underline">View all</Link>
            </div>
            {recentDocs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No documents uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-600">{doc.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
