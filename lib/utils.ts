import { format, addMinutes, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';

// Generate time slots for a given day
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let current = new Date(2000, 0, 1, startHour, startMin);
  const end = new Date(2000, 0, 1, endHour, endMin);

  while (isBefore(addMinutes(current, slotDuration), end) ||
         addMinutes(current, slotDuration).getTime() === end.getTime()) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, slotDuration);
  }
  return slots;
}

// Get end time from start time and duration
export function getEndTime(startTime: string, duration: number): string {
  const [hour, min] = startTime.split(':').map(Number);
  const end = addMinutes(new Date(2000, 0, 1, hour, min), duration);
  return format(end, 'HH:mm');
}

// Format time for display (e.g., "09:00" → "9:00 AM")
export function formatTime(time: string): string {
  const [hour, min] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, hour, min);
  return format(d, 'h:mm a');
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date nicely
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

// Check if a date is in the past
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(startOfDay(d), startOfDay(new Date()));
}

// Day of week name
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Status badge colors
export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
