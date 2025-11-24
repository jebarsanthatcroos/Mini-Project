"use client";

import { useSession, signOut } from "next-auth/react";
import { FiBell, FiLogOut, FiUser, FiSearch } from "react-icons/fi";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiBell className="h-6 w-6" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="h-8 w-8 rounded-full"
                  src={session.user.image}
                  alt={session.user.name || "Admin"}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
            
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-700">
                {session?.user?.name}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="hidden md:flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}