/* eslint-disable no-undef */
import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import ReceptionistSidebar from '@/components/Receptionists/Sidebar/ReceptionistSidebar';
import Navbar from '@/components/Receptionists/Navbar/Navbar';

export const metadata: Metadata = {
  title: 'Receptionist Management System',
  description:
    'Manage patient appointments, records, and front desk operations efficiently',
};

export default function ReceptionistSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <div className='flex h-screen bg-gray-50'>
        <ReceptionistSidebar />

        <div className='flex-1 flex flex-col overflow-hidden'>
          <main className='flex-1 overflow-auto p-6'>{children}</main>

          {/* Footer stays fixed at bottom */}
          <Footer />
        </div>
      </div>
    </>
  );
}
