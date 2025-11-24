import type { Metadata } from 'next';
import PharmacistHeader from '@/components/Pharmacis/Header';
import Footer from '@/components/Footer';


export const metadata: Metadata = {
  title: 'Pharmacy Management System',
  description: 'Manage your pharmacy operations, inventory, and patient services efficiently',
};

export default function PharmacistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PharmacistHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}