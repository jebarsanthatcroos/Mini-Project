'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiUser,
  FiBarChart2,
  FiMessageSquare,
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/doctor', icon: FiHome },
  { name: 'Appointments', href: '/doctor/appointments', icon: FiCalendar },
  { name: 'Patients', href: '/doctor/patients', icon: FiUsers },
  { name: 'Medical Records', href: '/doctor/records', icon: FiFileText },
  { name: 'Billing', href: '/doctor/billing', icon: FiDollarSign },
  { name: 'Messages', href: '/doctor/messages', icon: FiMessageSquare },
  { name: 'Analytics', href: '/doctor/analytics', icon: FiBarChart2 },
  { name: 'Profile', href: '/doctor/profile', icon: FiUser },
];

export function DoctorSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200'>
          <div className='flex items-center'>
            <div className='shrink-0 w-8 h-8 bg-blue-600 rounded-lg'></div>
            <span className='ml-3 text-xl font-bold text-gray-900'>
              MediCare
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500'
          >
            <FiX className='h-6 w-6' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='mt-8 px-4'>
          <div className='space-y-2'>
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`
                    mr-3 h-5 w-5 shrink-0
                    ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Settings */}
          <div className='mt-12 pt-8 border-t border-gray-200'>
            <Link
              href='/doctor/settings'
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  pathname === '/doctor/settings'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <FiSettings className='mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500' />
              Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg'
      >
        <FiMenu className='h-6 w-6 text-gray-600' />
      </button>
    </>
  );
}
