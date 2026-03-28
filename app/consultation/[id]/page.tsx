'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ConsultationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState('');
  const apiRef = useRef<any>(null);

  // Fetch appointment to validate access
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointments/${id}`);
        if (!res.ok) {
          setError('Appointment not found or access denied.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.appointment.status !== 'CONFIRMED') {
          setError('Video call is only available for confirmed appointments.');
          setLoading(false);
          return;
        }
        setAppointment(data.appointment);
        setLoading(false);
      } catch {
        setError('Failed to load appointment details.');
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, session, status, router]);

  // Initialize Jitsi Meet
  useEffect(() => {
    if (!appointment || !jitsiContainerRef.current) return;

    const domain = '8x8.vc';
    const roomName = `FNbySneha-${id}`;

    const loadJitsi = () => {
      if (apiRef.current) return;

      const options = {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
          enableLobbyChat: false,
          hideLobbyButton: true,
          requireDisplayName: false,
          enableInsecureRoomNameWarning: false,
          // Disable lobby/moderator requirement so anyone with the link can join
          'lobby.autoKnock': true,
          'lobby.enableChat': false,
          disableModeratorIndicator: true,
          enableNoAudioDetection: false,
          enableNoisyMicDetection: false,
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
      };

      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      const redirectToDashboard = () => {
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }
        const role = session?.user?.role;
        if (role === 'DOCTOR') {
          router.push('/doctor/dashboard');
        } else {
          router.push('/patient/dashboard');
        }
      };

      api.addEventListener('readyToClose', redirectToDashboard);
      api.addEventListener('videoConferenceLeft', redirectToDashboard);
    };

    // Load Jitsi external API script
    if (!(window as any).JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://8x8.vc/external_api.js';
      script.async = true;
      script.onload = loadJitsi;
      document.body.appendChild(script);
    } else {
      loadJitsi();
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [appointment, id, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Setting up your consultation...</p>
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
          <button
            onClick={() => {
              if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
              }
              const role = session?.user?.role;
              router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
            }}
            className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>

      {/* Jitsi container */}
      <div ref={jitsiContainerRef} className="flex-1" />
    </div>
  );
}
