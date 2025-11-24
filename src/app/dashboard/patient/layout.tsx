import type { Metadata } from 'next';
import { PatientSidebar } from '@/components/Patient/PatientSidebar';
import  PatientHeader  from '@/components/Patient/PatientHeader';

export const metadata: Metadata = {
  title: 'Patient Portal - Medical System',
  description: 'Patient management dashboard',
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <PatientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}