'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ImpersonationData {
  impersonatedUserId: string;
  impersonatedUserName: string;
  impersonatedUserRole: string;
  superAdminId: string;
}

export default function ImpersonationBanner() {
  const [data, setData] = useState<ImpersonationData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Read the impersonation cookie client-side
    const match = document.cookie.split('; ').find((c) => c.startsWith('impersonation='));
    if (match) {
      try {
        const raw = decodeURIComponent(match.split('=').slice(1).join('='));
        setData(JSON.parse(raw));
      } catch {}
    }
  }, []);

  if (!data) return null;

  const handleStop = async () => {
    await fetch('/api/superadmin/impersonate', { method: 'DELETE' });
    toast.success('Stopped impersonation');
    router.push('/superadmin/dashboard');
    router.refresh();
  };

  return (
    <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-sm sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <span className="font-bold bg-red-800 px-2 py-0.5 rounded text-xs">SUPER ADMIN</span>
        <span>
          Impersonating <strong>{data.impersonatedUserName}</strong> as{' '}
          <strong>{data.impersonatedUserRole}</strong>
        </span>
        <span className="text-red-200 text-xs ml-1">| All actions are being logged</span>
      </div>
      <button
        onClick={handleStop}
        className="px-4 py-1.5 bg-white text-red-600 font-semibold rounded-lg text-xs hover:bg-red-50 transition-colors"
      >
        Stop Impersonating
      </button>
    </div>
  );
}
