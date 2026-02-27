'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';
import { formatTime } from '@/lib/utils';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BookingCalendarProps {
  doctorId: string;
  onSelect: (date: string, slot: TimeSlot) => void;
  selectedDate?: string;
  selectedSlot?: TimeSlot;
}

export default function BookingCalendar({ doctorId, onSelect, selectedDate, selectedSlot }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const monthStr = format(currentMonth, 'yyyy-MM');

  const fetchAvailableDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const res = await fetch(`/api/availability?doctorId=${doctorId}&month=${monthStr}`);
      const data = await res.json();
      setAvailableDates(new Set(data.availableDates || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDates(false);
    }
  }, [doctorId, monthStr]);

  useEffect(() => {
    fetchAvailableDates();
  }, [fetchAvailableDates]);

  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    fetch(`/api/availability?doctorId=${doctorId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, doctorId]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = getDay(startOfMonth(currentMonth));
  const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (dateStr: string) => {
    if (availableDates.has(dateStr)) {
      // Reset slot selection when date changes
      if (selectedDate !== dateStr) {
        onSelect(dateStr, undefined as any);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between p-4 bg-primary-50 border-b border-primary-100">
          <button
            onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            ‹
          </button>
          <h3 className="font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            ›
          </button>
        </div>

        {/* Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
            ))}
          </div>

          {loadingDates ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading availability...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isAvailable = availableDates.has(dateStr);
                const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                const isSelected = selectedDate === dateStr;
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    disabled={!isAvailable || isPast}
                    className={`
                      relative h-10 w-full rounded-lg text-sm font-medium transition-all
                      ${isSelected ? 'bg-primary-600 text-white shadow-sm' : ''}
                      ${isAvailable && !isSelected ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 cursor-pointer' : ''}
                      ${!isAvailable && !isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                      ${isPast ? 'text-gray-200 cursor-not-allowed' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {isTodayDate && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-100 rounded-sm" />Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-600 rounded-sm" />Selected</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 rounded-sm" />Unavailable</span>
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            Available Slots — {format(parseISO(selectedDate), 'EEEE, dd MMM yyyy')}
          </h4>
          {loadingSlots ? (
            <div className="text-center py-6 text-gray-400 text-sm">Loading slots...</div>
          ) : slots.filter((s) => s.isAvailable).length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-500 text-sm">
              No slots available for this date. Please select another date.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => slot.isAvailable && onSelect(selectedDate, slot)}
                  disabled={!slot.isAvailable}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedSlot?.startTime === slot.startTime
                      ? 'bg-primary-600 text-white border-primary-600'
                      : slot.isAvailable
                      ? 'bg-white border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600'
                      : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through'
                  }`}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
