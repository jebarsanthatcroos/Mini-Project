'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiMenu,
  FiX,
  FiUser,
  FiBarChart2,
  FiMessageSquare,
  FiDroplet,
  FiClipboard,
  FiArchive,
  FiTrendingUp
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/lab', icon: FiHome },
  { name: 'Test Orders', href: '/lab/orders', icon: FiClipboard },
  { name: 'Samples', href: '/lab/samples', icon: FiDroplet },
  { name: 'Test Results', href: '/lab/results', icon: FiFileText },
  { name: 'Patients', href: '/lab/patients', icon: FiUsers },
  { name: 'Inventory', href: '/lab/inventory', icon: FiArchive },
  { name: 'Quality Control', href: '/lab/quality-control', icon: FiTrendingUp },
  { name: 'Messages', href: '/lab/messages', icon: FiMessageSquare },
  { name: 'Analytics', href: '/lab/analytics', icon: FiBarChart2 },
  { name: 'Profile', href: '/lab/profile', icon: FiUser },
];

export function LabSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/lab" className="flex items-center">
            <div className="shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiDroplet className="text-white text-sm" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Lab Portal</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Lab Technician</p>
              <p className="text-xs text-gray-500">Medical Laboratory</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 shrink-0 transition-colors
                    ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                  {isActive && (
                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Today&apos;s Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending Tests</span>
                <span className="font-semibold text-blue-600">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Critical Results</span>
                <span className="font-semibold text-red-600">2</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/lab/settings"
              className={`
                group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all mb-2
                ${pathname === '/lab/settings' || pathname?.startsWith('/lab/settings/')
                  ? 'bg-gray-100 text-gray-900 border border-gray-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }
              `}
            >
              <FiSettings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Settings
              {(pathname === '/lab/settings' || pathname?.startsWith('/lab/settings/')) && (
                <span className="ml-auto w-2 h-2 bg-gray-500 rounded-full"></span>
              )}
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Open sidebar"
      >
        <FiMenu className="h-6 w-6 text-gray-600" />
      </button>
    </>
  );
}