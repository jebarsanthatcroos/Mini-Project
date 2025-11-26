'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiActivity,
  FiCalendar,
  FiFileText,
} from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut, isAuthenticated, hasRole } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navbar on admin routes (admin has its own navbar)
  if (pathname?.startsWith('/dashboard/admin')) {
    return null;
  }

  const getDashboardLink = () => {
    if (!user?.role) return '/dashboard';

    switch (user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'DOCTOR':
        return '/dashboard/doctor';
      case 'NURSE':
        return '/dashboard/nurse';
      case 'RECEPTIONIST':
        return '/dashboard/receptionist';
      case 'LABTECH':
        return '/dashboard/lab';
      case 'PHARMACIST':
        return '/dashboard/pharmacy';
      case 'STAFF':
        return '/dashboard/staff';
      case 'PATIENT':
        return '/dashboard/patient';
      default:
        return '/dashboard/user';
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      ADMIN: 'bg-red-100 text-red-800',
      DOCTOR: 'bg-blue-100 text-blue-800',
      NURSE: 'bg-green-100 text-green-800',
      PATIENT: 'bg-purple-100 text-purple-800',
      RECEPTIONIST: 'bg-yellow-100 text-yellow-800',
      LABTECH: 'bg-indigo-100 text-indigo-800',
      PHARMACIST: 'bg-pink-100 text-pink-800',
      STAFF: 'bg-gray-100 text-gray-800',
      USER: 'bg-gray-100 text-gray-800',
    };

    const roleNames = {
      ADMIN: 'Admin',
      DOCTOR: 'Doctor',
      NURSE: 'Nurse',
      PATIENT: 'Patient',
      RECEPTIONIST: 'Receptionist',
      LABTECH: 'Lab Tech',
      PHARMACIST: 'Pharmacist',
      STAFF: 'Staff',
      USER: 'User',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors] || roleColors.USER}`}
      >
        {roleNames[role as keyof typeof roleNames] || role}
      </span>
    );
  };

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Dashboard', href: getDashboardLink(), icon: FiActivity },
    ...(isAuthenticated && hasRole('ADMIN')
      ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: FiShield }]
      : []),
  ];

  return (
    <nav className='bg-white shadow-lg border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <FiActivity className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold text-gray-900'>
                HealthCare
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className='h-4 w-4' />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className='hidden md:flex items-center space-x-4'>
            {isAuthenticated ? (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/profile'
                  className='flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors'
                >
                  <FiUser className='h-4 w-4' />
                  <span className='text-sm font-medium'>Profile</span>
                </Link>

                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-2'>
                    {user?.image ? (
                      <img
                        className='h-8 w-8 rounded-full'
                        src={user.image}
                        alt={user.name || 'User'}
                      />
                    ) : (
                      <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                        <FiUser className='h-4 w-4 text-gray-600' />
                      </div>
                    )}
                    <div className='text-right'>
                      <div className='text-sm font-medium text-gray-900'>
                        {user?.name}
                      </div>
                      {user?.role && getRoleBadge(user.role)}
                    </div>
                  </div>

                  <button
                    onClick={() => signOut()}
                    className='flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors'
                  >
                    <FiLogOut className='h-4 w-4' />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  href='/auth/signin'
                  className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  Sign In
                </Link>
                <Link
                  href='/auth/signup'
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
            >
              {isMobileMenuOpen ? (
                <FiX className='h-6 w-6' />
              ) : (
                <FiMenu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className='h-5 w-5' />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile User Section */}
            <div className='pt-4 pb-3 border-t border-gray-200'>
              {isAuthenticated ? (
                <div className='space-y-3'>
                  <div className='flex items-center px-3'>
                    <div className='flex-shrink-0'>
                      {user?.image ? (
                        <img
                          className='h-10 w-10 rounded-full'
                          src={user.image}
                          alt={user.name || 'User'}
                        />
                      ) : (
                        <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                          <FiUser className='h-5 w-5 text-gray-600' />
                        </div>
                      )}
                    </div>
                    <div className='ml-3'>
                      <div className='text-base font-medium text-gray-800'>
                        {user?.name}
                      </div>
                      <div className='text-sm text-gray-500'>{user?.email}</div>
                      {user?.role && getRoleBadge(user.role)}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <Link
                      href='/profile'
                      className='flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiUser className='h-5 w-5' />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className='flex items-center space-x-2 w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors'
                    >
                      <FiLogOut className='h-5 w-5' />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Link
                    href='/auth/signin'
                    className='flex items-center justify-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href='/auth/signup'
                    className='flex items-center justify-center w-full px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
