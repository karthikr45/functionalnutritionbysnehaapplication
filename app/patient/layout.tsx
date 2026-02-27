import PatientSidebar from '@/components/PatientSidebar';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <PatientSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
