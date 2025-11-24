"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiBarChart, 
  FiCalendar,
  FiFileText,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";
import { useState } from "react";

export default function AdminNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard/admin", icon: FiHome },
    { name: "User Management", href: "/dashboard/admin/users", icon: FiUsers },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: FiBarChart },
    { name: "Appointments", href: "/dashboard/admin/appointments", icon: FiCalendar },
    { name: "Reports", href: "/dashboard/admin/reports", icon: FiFileText },
    { name: "System Settings", href: "/dashboard/admin/settings", icon: FiSettings },
    { name: "Security", href: "/dashboard/admin/security", icon: FiShield },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-800 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <Link href="/dashboard/admin" className="flex items-center">
              <FiShield className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-xl font-bold">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col mt-5">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive(item.href) ? "text-white" : "text-gray-400"
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {session?.user?.image ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || "Admin"}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {session?.user?.name}
                </p>
                <p className="text-xs font-medium text-gray-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between h-16 bg-gray-800 px-4">
          <div className="flex items-center">
            <FiShield className="h-8 w-8 text-white" />
            <span className="ml-2 text-white text-lg font-bold">Admin</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
          >
            {isMobileMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-gray-800 md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive(item.href) ? "text-white" : "text-gray-400"
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile User Section */}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || "Admin"}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">
                    {session?.user?.name}
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    Administrator
                  </p>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => signOut()}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FiLogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}