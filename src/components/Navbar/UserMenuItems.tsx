/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  FiUser,
  FiMessageSquare,
  FiBell,
  FiPackage,
  FiDroplet,
  FiSettings,
  FiShield,
  FiLogOut,
} from 'react-icons/fi';
import Image from 'next/image';
import RoleBadge from './RoleBadge';

interface UserMenuItemsProps {
  user: any;
  onItemClick: () => void;
}

export default function UserMenuItems({
  user,
  onItemClick,
}: UserMenuItemsProps) {
  const { signOut } = useAuth();

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: FiUser },
    { name: 'Messages', href: '/messages', icon: FiMessageSquare },
    { name: 'Notifications', href: '/notifications', icon: FiBell },
    { name: 'Pharmacy', href: '/pharmacy', icon: FiPackage },
    { name: 'Lab Tests', href: '/laboratory', icon: FiDroplet },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      onItemClick();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* User Info Header */}
      <div className='p-4 bg-linear-to-r from-blue-50 to-purple-50 border-b border-white/20'>
        <div className='flex items-center space-x-3'>
          {user?.image ? (
            <div className='relative h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden'>
              <Image
                src={user.image}
                alt={user.name || 'User'}
                fill
                sizes='48px'
                className='object-cover'
              />
            </div>
          ) : (
            <div className='h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md'>
              <FiUser className='h-6 w-6 text-white' />
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-semibold text-gray-900 truncate'>
              {user?.name || 'User'}
            </div>
            <div className='text-xs text-gray-600 truncate'>{user?.email}</div>
            {user?.role && <RoleBadge role={user.role} />}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className='p-2'>
        {userMenuItems.map(item => (
          <motion.div
            key={item.name}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Link
              href={item.href}
              className='flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200'
              onClick={onItemClick}
            >
              <item.icon className='h-4 w-4' />
              <span>{item.name}</span>
            </Link>
          </motion.div>
        ))}

        {/* Admin Panel if admin */}
        {user?.role === 'ADMIN' && (
          <motion.div whileHover={{ x: 5 }}>
            <Link
              href='/dashboard/admin'
              className='flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200'
              onClick={onItemClick}
            >
              <FiShield className='h-4 w-4' />
              <span>Admin Panel</span>
            </Link>
          </motion.div>
        )}

        {/* Sign Out Button */}
        <motion.button
          onClick={handleSignOut}
          whileHover={{ x: 5, backgroundColor: '#fef2f2' }}
          className='flex items-center space-x-3 w-full px-3 py-3 text-sm text-red-600 hover:text-red-700 rounded-xl transition-all duration-200 text-left mt-2'
        >
          <FiLogOut className='h-4 w-4' />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </>
  );
}
