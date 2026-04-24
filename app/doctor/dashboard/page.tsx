import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { STATUS_COLORS, formatTime } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries';

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

  // Fetch blog posts from Sanity
  let blogPosts: any[] = [];
  try {
    blogPosts = await client.fetch(ALL_POSTS_QUERY) || [];
  } catch {}

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: '📅', color: 'bg-blue-50 text-blue-700', href: '/doctor/appointments' },
    { label: 'Total Patients', value: totalPatients.length, icon: '👥', color: 'bg-purple-50 text-purple-700', href: '/doctor/appointments' },
    { label: 'Completed Sessions', value: completedTotal, icon: '✅', color: 'bg-primary-50 text-primary-700', href: '/doctor/appointments' },
    { label: 'Total Revenue', value: `₹${(pendingPayments._sum.amount || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-amber-50 text-amber-700', href: '/doctor/appointments' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">Good day, Dr. {session.user.name?.split(' ').slice(1).join(' ')}! 👋</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <Link href="/doctor/availability" className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors whitespace-nowrap self-start">
          Manage Availability
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {appt.status === 'CONFIRMED' && (
                      <Link
                        href={`/consultation/${appt.id}`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        📹 Start Call
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

      {/* Blog Posts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Blog Posts</h2>
            <p className="text-xs text-gray-400 mt-0.5">Manage your content from Sanity Studio</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/studio/structure/post"
              className="px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              + New Post
            </Link>
          </div>
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">✍️</p>
            <p className="text-gray-500 text-sm mb-3">No blog posts yet.</p>
            <Link
              href="/studio/structure/post"
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              Create your first post in Sanity Studio →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {blogPosts.slice(0, 5).map((post: any) => (
              <div key={post._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-50 flex-shrink-0">
                  {post.mainImage ? (
                    <img src={post.mainImage} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    {post.publishedAt && <span>{format(new Date(post.publishedAt), 'dd MMM yyyy')}</span>}
                    {post.readTime && <span>{post.readTime} min read</span>}
                    {post.categories?.[0] && (
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs">
                        {post.categories[0].title}
                      </span>
                    )}
                    {post.isFeatured && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs">Featured</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/blog/${post.slug?.current}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/studio/structure/post;${post._id}`}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {blogPosts.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/studio/structure/post" className="text-primary-600 text-sm font-medium hover:underline">
                  View all {blogPosts.length} posts in Studio →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
