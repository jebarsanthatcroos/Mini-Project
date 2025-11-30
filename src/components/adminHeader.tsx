'use client';

import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell,
  FiLogOut,
  FiUser,
  FiSearch,
  FiMenu,
  FiMessageSquare,
  FiSettings,
} from 'react-icons/fi';
import { useState } from 'react';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30'>
      <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
        {/* Left Section - Menu Button */}
        <button
          onClick={onMenuToggle}
          className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden'
        >
          <FiMenu className='h-6 w-6' />
        </button>

        {/* Search Bar */}
        <div className='flex-1 max-w-lg mx-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className='relative'
          >
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiSearch className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search...'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors'
            />
          </motion.div>
        </div>

        {/* Right Section */}
        <div className='flex items-center space-x-3'>
          {/* Notifications */}
          <div className='relative'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className='p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <FiBell className='h-5 w-5' />
              <span className='absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center'>
                3
              </span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50'
                >
                  <div className='p-4'>
                    <h3 className='text-sm font-semibold text-gray-900'>
                      Notifications
                    </h3>
                    <div className='mt-2 space-y-2'>
                      {/* Notification items */}
                      <div className='p-3 bg-blue-50 rounded-lg'>
                        <p className='text-sm text-gray-700'>
                          New user registered
                        </p>
                        <p className='text-xs text-gray-500'>2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Messages */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            <FiMessageSquare className='h-5 w-5' />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            <FiSettings className='h-5 w-5' />
          </motion.button>

          {/* User Menu */}
          <div className='relative'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <div className='shrink-0'>
                  {session?.user?.image ? (
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      className='h-8 w-8 rounded-full border-2 border-gray-200'
                      src={session.user.image}
                      alt={session.user.name || 'Admin'}
                    />
                  ) : (
                    <div className='h-8 w-8 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200'>
                      <FiUser className='h-4 w-4 text-white' />
                    </div>
                  )}
                </div>
                <div className='hidden md:block text-left'>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='text-sm font-medium text-gray-700'
                  >
                    {session?.user?.name || 'Admin User'}
                  </motion.div>
                  <div className='text-xs text-gray-500'>Administrator</div>
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50'
                >
                  <div className='py-1'>
                    <button className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'>
                      <FiUser className='mr-3 h-4 w-4' />
                      Profile
                    </button>
                    <button className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'>
                      <FiSettings className='mr-3 h-4 w-4' />
                      Settings
                    </button>
                    <div className='border-t border-gray-100 my-1'></div>
                    <motion.button
                      whileHover={{ backgroundColor: '#fef2f2' }}
                      onClick={() => signOut()}
                      className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors'
                    >
                      <FiLogOut className='mr-3 h-4 w-4' />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
