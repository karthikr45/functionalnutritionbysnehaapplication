import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import ResponsiveSidebarLayout from '@/components/ResponsiveSidebarLayout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveSidebarLayout sidebar={<SuperAdminSidebar />}>
      {children}
    </ResponsiveSidebarLayout>
  );
}
