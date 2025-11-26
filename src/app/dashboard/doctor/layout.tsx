/* eslint-disable no-undef */
import type { Metadata } from 'next';
import { DoctorSidebar } from '@/components/Doctor/DoctorSidebar';
import { DoctorHeader } from '@/components/Doctor/DoctorHeader';

export const metadata: Metadata = {
  title: 'Doctor Dashboard - MediCare',
  description: 'Doctor management dashboard',
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-gray-50'>
      <DoctorSidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <DoctorHeader />
        <main className='flex-1 overflow-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
