import type { Metadata } from 'next';
import { Header } from '@/components/lab/labheader';
import { LabSidebar } from '@/components/lab/labSidebar';

export const metadata: Metadata = {
  title: 'Laboratory Technician Dashboard - MediCare',
  description: 'Laboratory Technician management dashboard',
};

export default function DoctorLayout({
  children,
}: {
  // eslint-disable-next-line no-undef
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-gray-50'>
      <LabSidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header />
        <main className='flex-1 overflow-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
