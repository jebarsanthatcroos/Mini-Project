/* eslint-disable no-undef */
import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import PharmacistSidebar from '@/components/Pharmacis/Sidebar/Sidebar';

export const metadata: Metadata = {
  title: 'Pharmacy Management System',
  description:
    'Manage your pharmacy operations, inventory, and patient services efficiently',
};

export default function PharmacistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Client-side sidebar will mount after hydration */}
      <PharmacistSidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <main className='flex-1 overflow-auto p-6'>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
