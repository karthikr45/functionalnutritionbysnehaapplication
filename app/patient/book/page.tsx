'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingCalendar from '@/components/BookingCalendar';
import RazorpayPayment from '@/components/RazorpayPayment';
import DoctorProfileCard from '@/components/DoctorProfileCard';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TimeSlot { startTime: string; endTime: string; isAvailable: boolean; }
interface Doctor {
  id: string;
  consultationFee: number;
  followUpFee: number;
  bio: string | null;
  shortBio: string | null;
  specialization: string | null;
  qualifications: string | null;
  experience: number | null;
  profileImage: string | null;
  isAcceptingPatients: boolean;
  user: { name: string };
}
interface PackageBooking { id: string; totalSessions: number; usedSessions: number; package: { name: string }; }

type BookingType = 'consultation' | 'follow_up' | 'package_session';

const STEPS = ['Select Type', 'Pick Date & Time', 'Your Details', 'Payment'];

export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [packageBookings, setPackageBookings] = useState<PackageBooking[]>([]);
  const [selectedType, setSelectedType] = useState<BookingType>('consultation');
  const [selectedPackageBookingId, setSelectedPackageBookingId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [healthConcerns, setHealthConcerns] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/doctor/profile').then((r) => r.json()).then((d) => setDoctor(d.doctor));
    fetch('/api/patient/packages').then((r) => r.json()).then((d) =>
      setPackageBookings((d.bookings || []).filter((b: any) => b.status === 'ACTIVE' && b.usedSessions < b.totalSessions))
    );
  }, []);

  const amount =
    selectedType === 'consultation' ? doctor?.consultationFee || 0
    : selectedType === 'follow_up' ? doctor?.followUpFee || 0
    : 0; // package sessions are pre-paid

  const handleCalendarSelect = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const handleCreateAppointment = async () => {
    if (!doctor || !selectedDate || !selectedSlot) return;
    setCreating(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          type: selectedType === 'package_session' ? 'PACKAGE_SESSION' : selectedType === 'follow_up' ? 'FOLLOW_UP' : 'CONSULTATION',
          healthConcerns,
          packageBookingId: selectedType === 'package_session' ? selectedPackageBookingId : undefined,
        }),
      });

      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Failed to create appointment'); return; }

      const { appointment } = await res.json();
      setAppointmentId(appointment.id);
      setStep(3); // Go to payment (or confirmation for package)
    } catch {
      toast.error('Failed to create appointment');
    } finally {
      setCreating(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('🎉 Appointment confirmed!');
    router.push('/patient/appointments');
  };

  const handlePackageSessionConfirm = async () => {
    // Package sessions are pre-paid — just confirm
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    if (res.ok) {
      toast.success('Session booked!');
      router.push('/patient/appointments');
    }
  };

  if (!doctor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">⏳</div>
          <p>Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Book an Appointment</h1>
        <p className="text-gray-500 mt-1 text-sm">Review your doctor&apos;s profile below and pick a time that works.</p>
      </div>

      <div className="mb-6">
        <DoctorProfileCard doctor={doctor} />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
              i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-100 text-primary-700 border-2 border-primary-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Step 0: Select Type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-lg mb-4">What type of consultation?</h2>

            {[
              { type: 'consultation' as BookingType, label: 'Initial Consultation', desc: 'First time? Start with a comprehensive assessment.', price: doctor.consultationFee, icon: '🩺' },
              { type: 'follow_up' as BookingType, label: 'Follow-up Consultation', desc: 'Continue your progress with a follow-up session.', price: doctor.followUpFee, icon: '🔄' },
            ].map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                  selectedType === opt.type ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-4xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </div>
                <p className="font-bold text-primary-600">{formatCurrency(opt.price)}</p>
              </button>
            ))}

            {packageBookings.length > 0 && (
              <div>
                <button
                  onClick={() => setSelectedType('package_session')}
                  className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                    selectedType === 'package_session' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-4xl">📦</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Use Package Session</p>
                    <p className="text-sm text-gray-500">Book a session from your active package (pre-paid)</p>
                  </div>
                  <p className="font-bold text-primary-600">Included</p>
                </button>

                {selectedType === 'package_session' && (
                  <div className="mt-3 space-y-2">
                    {packageBookings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedPackageBookingId(b.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          selectedPackageBookingId === b.id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{b.package.name}</p>
                          <p className="text-xs text-gray-500">{b.usedSessions}/{b.totalSessions} sessions used</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPackageBookingId === b.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                          {selectedPackageBookingId === b.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              disabled={selectedType === 'package_session' && !selectedPackageBookingId}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl mt-4"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-5">Select Date & Time</h2>
            <BookingCalendar
              doctorId={doctor.id}
              onSelect={handleCalendarSelect}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium">← Back</button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedDate || !selectedSlot}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Health Concerns */}
        {step === 2 && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Your Health Concerns</h2>
            <p className="text-gray-500 text-sm mb-5">Help the doctor prepare for your consultation.</p>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800">{selectedDate ? formatDate(selectedDate) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-800">{selectedSlot ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-800 capitalize">{selectedType.replace('_', ' ')}</span>
              </div>
              {amount > 0 && (
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-bold text-primary-600">{formatCurrency(amount)}</span>
                </div>
              )}
            </div>

            <textarea
              value={healthConcerns}
              onChange={(e) => setHealthConcerns(e.target.value)}
              placeholder="Describe your health goals, current symptoms, medical history, allergies, or any specific questions you have for the doctor..."
              rows={5}
              className="input resize-none"
            />

            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium">← Back</button>
              <button
                onClick={handleCreateAppointment}
                disabled={creating}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl"
              >
                {creating ? 'Creating...' : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment / Confirmation */}
        {step === 3 && appointmentId && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-5">
              {selectedType === 'package_session' ? 'Confirm Booking' : 'Complete Payment'}
            </h2>

            {/* Order summary */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-6 space-y-3 text-sm">
              <h3 className="font-semibold text-gray-800">Booking Summary</h3>
              <div className="flex justify-between"><span className="text-gray-500">Doctor</span><span>Dr. {doctor.user.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{selectedSlot ? formatTime(selectedSlot.startTime) : ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{selectedType.replace('_', ' ')}</span></div>
              {amount > 0 && (
                <div className="flex justify-between border-t border-primary-200 pt-3 font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary-600">{formatCurrency(amount)}</span>
                </div>
              )}
            </div>

            {selectedType === 'package_session' ? (
              <button
                onClick={handlePackageSessionConfirm}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl"
              >
                ✅ Confirm Booking (Included in Package)
              </button>
            ) : (
              <RazorpayPayment
                type="appointment"
                itemId={appointmentId}
                amount={amount}
                onSuccess={handlePaymentSuccess}
                label={`Pay ${formatCurrency(amount)} & Confirm`}
              />
            )}

            <button onClick={() => setStep(2)} className="w-full mt-3 py-3 text-gray-500 text-sm hover:underline">
              ← Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
