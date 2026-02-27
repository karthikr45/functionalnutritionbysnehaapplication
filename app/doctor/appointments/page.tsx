'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { STATUS_COLORS, formatTime, formatDate } from '@/lib/utils';
import DocumentUpload from '@/components/DocumentUpload';
import toast from 'react-hot-toast';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [dietPlanUrl, setDietPlanUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showDietUpload, setShowDietUpload] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    const url = filter === 'ALL' ? '/api/appointments' : `/api/appointments?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleUpdate = async (id: string, status?: string) => {
    setUpdating(true);
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(status && { status }),
        ...(notes && { doctorNotes: notes }),
        ...(videoLink && { videoCallLink: videoLink }),
        ...(dietPlanUrl && { dietPlanUrl }),
      }),
    });
    setUpdating(false);
    if (res.ok) {
      toast.success('Appointment updated!');
      setSelectedAppt(null);
      setNotes(''); setVideoLink(''); setDietPlanUrl('');
      fetchAppointments();
    } else {
      toast.error('Update failed');
    }
  };

  const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Appointments</h1>

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
        <div className="flex justify-center py-12 text-gray-400">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold text-xl leading-none">{format(new Date(appt.date), 'd')}</span>
                  <span className="text-primary-500 text-xs">{format(new Date(appt.date), 'MMM')}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-800">{appt.patient?.user?.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatTime(appt.startTime)} – {formatTime(appt.endTime)} &bull; {appt.type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {appt.patient?.user?.email} &bull; {appt.patient?.user?.phone}
                  </p>
                  {appt.healthConcerns && (
                    <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">
                      📝 {appt.healthConcerns}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {appt.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdate(appt.id, 'CONFIRMED')}
                      className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-xl hover:bg-blue-100"
                    >
                      ✓ Confirm
                    </button>
                  )}
                  {appt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdate(appt.id, 'COMPLETED')}
                      className="px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-xl hover:bg-green-100"
                    >
                      ✅ Complete
                    </button>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                    <button
                      onClick={() => handleUpdate(appt.id, 'CANCELLED')}
                      className="px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-xl hover:bg-red-100"
                    >
                      ✕ Cancel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAppt(selectedAppt?.id === appt.id ? null : appt);
                      setNotes(appt.doctorNotes || '');
                      setVideoLink(appt.videoCallLink || '');
                      setDietPlanUrl(appt.dietPlanUrl || '');
                    }}
                    className="px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-xl hover:bg-primary-100"
                  >
                    {selectedAppt?.id === appt.id ? '✕ Close' : '✏️ Edit'}
                  </button>
                </div>
              </div>

              {/* Edit panel */}
              {selectedAppt?.id === appt.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 rounded-b-2xl space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Doctor&apos;s Notes / Prescription</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add clinical notes, dietary advice, or prescription details..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Video Call Link</label>
                      <input
                        type="url"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Diet Plan URL</label>
                      <input
                        type="url"
                        value={dietPlanUrl}
                        onChange={(e) => setDietPlanUrl(e.target.value)}
                        placeholder="Link to diet plan PDF/doc..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Upload diet plan directly */}
                  <div>
                    <button
                      onClick={() => setShowDietUpload(!showDietUpload)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {showDietUpload ? '▲ Hide' : '▼ Upload Diet Plan File'}
                    </button>
                    {showDietUpload && (
                      <div className="mt-3">
                        <DocumentUpload
                          appointmentId={appt.id}
                          allowedTypes={['DIET_PLAN', 'PRESCRIPTION']}
                          onUploadSuccess={(doc) => {
                            setDietPlanUrl(doc.fileUrl);
                            setShowDietUpload(false);
                            toast.success('Diet plan uploaded!');
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdate(appt.id)}
                    disabled={updating}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
