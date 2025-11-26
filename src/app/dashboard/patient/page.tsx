'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'PATIENT') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Patient Portal</h1>
            <p className='text-gray-600'>Welcome, {session?.user?.name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded'
          >
            Sign Out
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-lg font-semibold mb-2'>
              Upcoming Appointments
            </h3>
            <p className='text-gray-600 mb-4'>
              Your next appointment is in 3 days
            </p>
            <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'>
              Book Appointment
            </button>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-lg font-semibold mb-2'>Medical Records</h3>
            <p className='text-gray-600 mb-4'>Access your health information</p>
            <button className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded'>
              View Records
            </button>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-lg font-semibold mb-2'>Prescriptions</h3>
            <p className='text-gray-600 mb-4'>
              View and manage your medications
            </p>
            <button className='bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded'>
              View Prescriptions
            </button>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-lg font-semibold mb-2'>Lab Results</h3>
            <p className='text-gray-600 mb-4'>Check your test results</p>
            <button className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded'>
              View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
