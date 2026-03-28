'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DailyIframe from '@daily-co/daily-js';

export default function ConsultationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }

    const setup = async () => {
      try {
        // Validate appointment
        const apptRes = await fetch(`/api/appointments/${id}`);
        if (!apptRes.ok) { setError('Appointment not found or access denied.'); setLoading(false); return; }
        const apptData = await apptRes.json();
        if (apptData.appointment.status !== 'CONFIRMED') {
          setError('Video call is only available for confirmed appointments.');
          setLoading(false);
          return;
        }

        // Get Daily.co room and token
        const dailyRes = await fetch('/api/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: id,
            userName: session.user.name,
          }),
        });

        if (!dailyRes.ok) {
          const errData = await dailyRes.json();
          setError(errData.error || 'Failed to setup video call.');
          setLoading(false);
          return;
        }

        const dailyData = await dailyRes.json();
        const { roomUrl, token } = dailyData;

        if (!roomUrl) {
          setError('Failed to get video room URL. Check Daily.co configuration.');
          setLoading(false);
          return;
        }

        if (!containerRef.current) return;

        // Create Daily call frame
        const callFrame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        callFrameRef.current = callFrame;

        callFrame.on('joined-meeting', () => setInCall(true));
        callFrame.on('left-meeting', () => {
          callFrame.destroy();
          callFrameRef.current = null;
          const role = session?.user?.role;
          router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
        });
        callFrame.on('error', (evt) => {
          console.error('[daily] Error:', evt);
          setError('Video call error. Please try again.');
        });

        await callFrame.join({ url: roomUrl, token });
        setLoading(false);
      } catch (err) {
        console.error('[consultation] Error:', err);
        setError('Failed to setup video call.');
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [id, session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Setting up your consultation...</p>
          <p className="text-xs text-gray-400 mt-2">Connecting to video service...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Join Call</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary-700 font-serif">Functional Nutrition by Sneha</span>
          <span className="hidden sm:inline text-sm text-gray-400">|</span>
          <span className="hidden sm:inline text-sm text-gray-500">Video Consultation</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Appointment #{(id as string)?.slice(0, 8)}
          </span>
          {inCall && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Connected
            </span>
          )}
          <button
            onClick={() => {
              if (callFrameRef.current) {
                callFrameRef.current.leave();
              } else {
                const role = session?.user?.role;
                router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
              }
            }}
            className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>

      {/* Daily.co container */}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
