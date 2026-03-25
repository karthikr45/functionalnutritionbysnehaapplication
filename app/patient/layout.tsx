import PatientSidebar from '@/components/PatientSidebar';
import ImpersonationBanner from '@/components/ImpersonationBanner';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <PatientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ImpersonationBanner />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
