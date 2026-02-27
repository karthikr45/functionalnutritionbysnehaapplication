'use client';

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySlot {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

const DEFAULT_SLOTS: DaySlot[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  enabled: i >= 1 && i <= 6, // Mon-Sat by default
  startTime: '09:00',
  endTime: '18:00',
  slotDuration: 45,
}));

export default function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState<DaySlot[]>(DEFAULT_SLOTS);
  const [saving, setSaving] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    // Fetch existing availability
    fetch('/api/doctor/profile')
      .then((r) => r.json())
      .then(async () => {
        // Load availability for next month to show current settings
        const res = await fetch(`/api/availability?doctorId=SELF&month=${format(new Date(), 'yyyy-MM')}`);
        // Note: In production, add a dedicated endpoint for doctor's own availability settings
      });
  }, []);

  const updateSlot = (dayOfWeek: number, field: keyof DaySlot, value: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const activeSlots = slots.filter((s) => s.enabled);
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: activeSlots }),
    });
    setSaving(false);
    if (res.ok) toast.success('Availability updated!');
    else toast.error('Failed to save availability');
  };

  const handleBlockDate = async () => {
    if (!blockDate) { toast.error('Select a date to block'); return; }
    setBlocking(true);
    const res = await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: blockDate, reason: blockReason, action: 'block' }),
    });
    setBlocking(false);
    if (res.ok) { toast.success(`${blockDate} blocked`); setBlockDate(''); setBlockReason(''); }
    else toast.error('Failed to block date');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Manage Availability</h1>
        <p className="text-gray-500 mt-1 text-sm">Set your weekly schedule and block specific dates.</p>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-5">Weekly Schedule</h2>
        <div className="space-y-4">
          {slots.map((slot) => (
            <div key={slot.dayOfWeek} className={`p-4 rounded-xl border transition-all ${slot.enabled ? 'border-primary-100 bg-primary-50/30' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Day toggle */}
                <div className="flex items-center gap-3 w-32 flex-shrink-0">
                  <button
                    onClick={() => updateSlot(slot.dayOfWeek, 'enabled', !slot.enabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${slot.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${slot.enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                  <span className={`font-medium text-sm ${slot.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                    {DAYS[slot.dayOfWeek].slice(0, 3)}
                  </span>
                </div>

                {slot.enabled && (
                  <>
                    {/* Time range */}
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(slot.dayOfWeek, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(slot.dayOfWeek, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
                      />
                    </div>

                    {/* Slot duration */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">Slot:</span>
                      <select
                        value={slot.slotDuration}
                        onChange={(e) => updateSlot(slot.dayOfWeek, 'slotDuration', parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none bg-white"
                      >
                        {[30, 45, 60, 90].map((d) => (
                          <option key={d} value={d}>{d} min</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {!slot.enabled && (
                  <span className="text-sm text-gray-400 italic">Not available</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Saving...' : 'Save Weekly Schedule'}
        </button>
      </div>

      {/* Block Specific Dates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-2">Block Specific Dates</h2>
        <p className="text-gray-500 text-sm mb-5">Block specific dates for holidays, personal leave, or other unavailability.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="date"
            value={blockDate}
            min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
            onChange={(e) => setBlockDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Reason (optional)"
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary-400 outline-none"
          />
          <button
            onClick={handleBlockDate}
            disabled={blocking}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition-colors text-sm"
          >
            {blocking ? 'Blocking...' : '🚫 Block Date'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-800">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="space-y-1 list-disc list-inside text-amber-700">
          <li>Changes take effect immediately — existing bookings are not affected.</li>
          <li>Patients can see your availability in real-time when booking.</li>
          <li>Slot duration controls how long each appointment slot is.</li>
          <li>Block future dates for planned leaves or holidays.</li>
        </ul>
      </div>
    </div>
  );
}
