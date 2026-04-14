import PatientSidebar from '@/components/PatientSidebar';
import ImpersonationBanner from '@/components/ImpersonationBanner';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveSidebarLayout
      sidebar={<PatientSidebar />}
      topBar={<ImpersonationBanner />}
    >
      {children}
    </ResponsiveSidebarLayout>
  );
}
