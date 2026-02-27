'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { STATUS_COLORS, formatTime, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const url = filter === 'ALL' ? '/api/appointments' : `/api/appointments?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    if (res.ok) { toast.success('Appointment cancelled'); fetchAppointments(); }
    else toast.error('Could not cancel appointment');
  };

  const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">My Appointments</h1>
        <Link href="/patient/book" className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors">
          + Book New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="text-gray-400">Loading appointments...</div></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📅</p>
          <h3 className="font-semibold text-gray-700 mb-2">No appointments found</h3>
          <p className="text-gray-400 text-sm mb-5">
            {filter === 'ALL' ? "You haven't booked any consultations yet." : `No ${filter.toLowerCase()} appointments.`}
          </p>
          <Link href="/patient/book" className="text-primary-600 font-medium text-sm hover:underline">
            Book your first consultation →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Date block */}
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-xl leading-none">{format(new Date(appt.date), 'd')}</span>
                  <span className="text-primary-500 text-xs">{format(new Date(appt.date), 'MMM yyyy')}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{appt.doctor?.user?.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatTime(appt.startTime)} – {formatTime(appt.endTime)} &bull; {appt.type.replace('_', ' ')}
                  </p>
                  {appt.packageBooking && (
                    <p className="text-xs text-purple-600 mt-1">📦 {appt.packageBooking.package?.name}</p>
                  )}
                  {appt.healthConcerns && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">📝 {appt.healthConcerns}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {appt.videoCallLink && (
                    <a
                      href={appt.videoCallLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors text-center"
                    >
                      📹 Join Call
                    </a>
                  )}
                  {appt.dietPlanUrl && (
                    <a
                      href={appt.dietPlanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-xl hover:bg-green-100 transition-colors text-center"
                    >
                      🥗 Diet Plan
                    </a>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {appt.doctorNotes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Doctor&apos;s Notes:</p>
                  <p className="text-sm text-gray-700">{appt.doctorNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
