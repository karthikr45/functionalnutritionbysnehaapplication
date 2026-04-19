'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { STATUS_COLORS, formatTime, formatDate } from '@/lib/utils';
import BookingCalendar from '@/components/BookingCalendar';
import toast from 'react-hot-toast';

interface TimeSlot { startTime: string; endTime: string; isAvailable: boolean; }

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [reschedule, setReschedule] = useState<{ id: string; doctorId: string; date: string; startTime: string } | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState<TimeSlot | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchAppointments = async () => {
    setLoading(true);
    const url = filter === 'ALL' ? '/api/appointments' : `/api/appointments?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleCancel = async (appt: any) => {
    const paid = appt.payment?.status === 'SUCCESS' && !appt.packageBookingId;
    const msg = paid
      ? 'Cancel this appointment? Your payment will be refunded within 5-7 business days.'
      : appt.packageBookingId
      ? 'Cancel this session? The session will remain available in your package.'
      : 'Cancel this appointment?';
    if (!confirm(msg)) return;

    const res = await fetch(`/api/appointments/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    if (res.ok) {
      const { refundAmount } = await res.json();
      toast.success(refundAmount > 0 ? `Cancelled. Refund of ₹${refundAmount} initiated.` : 'Appointment cancelled');
      fetchAppointments();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Could not cancel appointment');
    }
  };

  const openReschedule = (appt: any) => {
    setReschedule({ id: appt.id, doctorId: appt.doctor.id, date: appt.date, startTime: appt.startTime });
    setNewDate('');
    setNewSlot(undefined);
  };

  const confirmReschedule = async () => {
    if (!reschedule || !newDate || !newSlot) return;
    setSubmitting(true);
    const res = await fetch(`/api/appointments/${reschedule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: newDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success('Appointment rescheduled');
      setReschedule(null);
      fetchAppointments();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Could not reschedule');
    }
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
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-xl leading-none">{format(new Date(appt.date), 'd')}</span>
                  <span className="text-primary-500 text-xs">{format(new Date(appt.date), 'MMM yyyy')}</span>
                </div>

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

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/appointment/${appt.id}`)}
                    className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors text-center"
                  >
                    View
                  </button>
                  {appt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => router.push(`/consultation/${appt.id}`)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-xl hover:bg-indigo-100 transition-colors text-center"
                    >
                      📹 Join Call
                    </button>
                  )}
                  {appt.dietPlanUrl && (
                    <a
                      href={appt.dietPlanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors text-center"
                    >
                      🥗 Diet Plan
                    </a>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                    <>
                      <button
                        onClick={() => openReschedule(appt)}
                        className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(appt)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
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

      {/* Reschedule modal */}
      {reschedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Reschedule Appointment</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Currently on {formatDate(reschedule.date)} at {formatTime(reschedule.startTime)}
                </p>
              </div>
              <button onClick={() => setReschedule(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6">
              <BookingCalendar
                doctorId={reschedule.doctorId}
                onSelect={(d, s) => { setNewDate(d); setNewSlot(s); }}
                selectedDate={newDate}
                selectedSlot={newSlot}
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setReschedule(null)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium">
                  Cancel
                </button>
                <button
                  onClick={confirmReschedule}
                  disabled={!newDate || !newSlot || submitting}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl"
                >
                  {submitting ? 'Rescheduling...' : 'Confirm New Time'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
