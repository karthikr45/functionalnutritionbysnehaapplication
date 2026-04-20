'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ConsultationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const setupDone = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }
    if (setupDone.current) return;
    setupDone.current = true;

    const setup = async () => {
      try {
        const res = await fetch(`/api/appointments/${id}`);
        if (!res.ok) { setError('Appointment not found.'); setLoading(false); return; }
        const data = await res.json();
        if (data.appointment.status !== 'CONFIRMED') {
          setError('Video call is only available for confirmed appointments.');
          setLoading(false);
          return;
        }

        // Load Jitsi
        const loadJitsi = () => {
          if (apiRef.current || !containerRef.current) return;

          const roomName = `GutShell-${id}`;
          const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
            roomName,
            parentNode: containerRef.current,
            width: '100%',
            height: '100%',
            configOverwrite: {
              prejoinPageEnabled: false,
              disableDeepLinking: true,
              requireDisplayName: false,
              enableInsecureRoomNameWarning: false,
              disableModeratorIndicator: true,
              hideLobbyButton: true,
              enableLobbyChat: false,
              disableProfile: true,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              MOBILE_APP_PROMO: false,
              HIDE_INVITE_MORE_HEADER: true,
            },
            userInfo: {
              displayName: session?.user?.name || 'User',
              email: session?.user?.email || '',
            },
          });

          apiRef.current = api;
          let joined = false;

          api.addEventListener('videoConferenceJoined', () => {
            joined = true;
            setInCall(true);
            setLoading(false);
          });

          api.addEventListener('readyToClose', () => {
            if (!joined) {
              setLoading(false);
              return;
            }
            if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
            const role = session?.user?.role;
            router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
          });

          // Timeout fallback — hide loading after 10s even if not joined
          setTimeout(() => setLoading(false), 10000);
        };

        if (!(window as any).JitsiMeetExternalAPI) {
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          script.onload = loadJitsi;
          document.body.appendChild(script);
        } else {
          loadJitsi();
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to setup video call.');
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
    };
  }, [id, session, status, router]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary-700 font-serif">Gut Shell</span>
          <span className="hidden sm:inline text-sm text-gray-400">|</span>
          <span className="hidden sm:inline text-sm text-gray-500">Video Consultation</span>
        </div>
        <div className="flex items-center gap-3">
          {inCall && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Connected
            </span>
          )}
          <button
            onClick={() => {
              if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
              const role = session?.user?.role;
              router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
            }}
            className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 top-14 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
            <p className="text-gray-300">Connecting to video call...</p>
            <p className="text-xs text-gray-500 mt-2">If prompted to login, the doctor can create a free Jitsi account to remove time limits.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Join Call</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => router.back()} className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Jitsi container — always rendered */}
      <div ref={containerRef} className={`flex-1 ${error ? 'hidden' : ''}`} />
    </div>
  );
}
