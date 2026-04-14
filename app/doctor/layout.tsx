import DoctorSidebar from '@/components/DoctorSidebar';
import ImpersonationBanner from '@/components/ImpersonationBanner';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveSidebarLayout
      sidebar={<DoctorSidebar />}
      topBar={<ImpersonationBanner />}
    >
      {children}
    </ResponsiveSidebarLayout>
  );
}
