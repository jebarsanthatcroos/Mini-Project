/* eslint-disable no-undef */
import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import Header from '@/components/Pharmacis/Header/Header';

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
    <>
      <Header />
      <main className='flex-1 overflow-auto p-6'>
        {children}
        <Footer />
      </main>
    </>
  );
}
