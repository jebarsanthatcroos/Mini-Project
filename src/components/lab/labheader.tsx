'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { FiBell, FiSearch, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { UserRole } from '@/models/User';

interface DoctorSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    phone?: string;
    department?: string;
    specialization?: string;
    licenseNumber?: string;
  };
}

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const doctorSession = session as DoctorSession | null;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  if (!doctorSession?.user) {
    return null;
  }

  const { user } = doctorSession;

  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='flex items-center justify-between h-16 px-6'>
        {/* Search Bar */}
        <div className='flex-1 max-w-2xl'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiSearch className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Search patients, appointments...'
            />
          </div>
        </div>

        {/* Right side items */}
        <div className='flex items-center space-x-4'>
          {/* Notifications */}
          <button className='relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'>
            <FiBell className='h-6 w-6' />
            <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
          </button>

          {/* Profile dropdown */}
          <div className='relative'>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className='flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100'
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'Profile'}
                  width={32}
                  height={32}
                  className='w-8 h-8 rounded-full'
                />
              ) : (
                <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>
                    {user.name?.charAt(0) || 'D'}
                  </span>
                </div>
              )}
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-gray-900'>
                  Dr. {user.name}
                </p>
                <p className='text-xs text-gray-500'>{user.specialization}</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
                <div className='px-4 py-2 text-xs text-gray-500 border-b border-gray-100'>
                  Signed in as {user.email}
                </div>
                <button className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                  <FiUser className='mr-3 h-4 w-4' />
                  Your Profile
                </button>
                <button className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                  <FiSettings className='mr-3 h-4 w-4' />
                  Settings
                </button>
                <div className='border-t border-gray-100 my-1'></div>
                <button
                  onClick={handleSignOut}
                  className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                >
                  <FiLogOut className='mr-3 h-4 w-4' />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
