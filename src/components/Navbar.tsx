'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import { usePathname } from 'next/navigation';
import Logo from './Logo.static';
import Image from 'next/image';
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiActivity,
  FiCalendar,
  FiPackage,
  FiDroplet,
  FiChevronDown,
  FiBell,
  FiMessageSquare,
  FiSettings,
} from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, signOut, isAuthenticated, hasRole } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const scrollYSpring = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  // Enhanced background with glass morphism
  const navbarBackground = useTransform(
    scrollYSpring,
    [0, 100],
    ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.95)']
  );

  const navbarBorder = useTransform(
    scrollYSpring,
    [0, 100],
    ['rgba(255, 255, 255, 0.1)', 'rgba(229, 231, 235, 0.8)']
  );

  const navbarShadow = useTransform(
    scrollYSpring,
    [0, 100],
    ['0 1px 2px rgba(0, 0, 0, 0.02)', '0 8px 25px rgba(0, 0, 0, 0.1)']
  );

  useEffect(() => {
    const unsubscribe = scrollY.on('change', latest => {
      setIsScrolled(latest > 50);
    });

    return () => unsubscribe();
  }, [scrollY]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show navbar on admin routes
  if (pathname?.startsWith('/dashboard/admin')) {
    return null;
  }

  const getDashboardLink = () => {
    if (!user?.role) return '/dashboard';
    const roleMap: { [key: string]: string } = {
      ADMIN: '/dashboard/admin',
      DOCTOR: '/dashboard/doctor',
      NURSE: '/dashboard/nurse',
      RECEPTIONIST: '/dashboard/receptionist',
      LABTECH: '/dashboard/lab',
      PHARMACIST: '/dashboard/pharmacy',
      STAFF: '/dashboard/staff',
      PATIENT: '/dashboard/patient',
    };
    return roleMap[user.role] || '/dashboard';
  };

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      ADMIN: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
      DOCTOR: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
      NURSE: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      PATIENT: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
      RECEPTIONIST: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      LABTECH: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
      PHARMACIST: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white',
      STAFF: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
    };

    const roleNames: { [key: string]: string } = {
      ADMIN: 'Admin',
      DOCTOR: 'Doctor',
      NURSE: 'Nurse',
      PATIENT: 'Patient',
      RECEPTIONIST: 'Receptionist',
      LABTECH: 'Lab Tech',
      PHARMACIST: 'Pharmacist',
      STAFF: 'Staff',
    };

    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[role] || 'bg-linear-to-r from-gray-500 to-slate-600 text-white'}`}
      >
        {roleNames[role] || role}
      </motion.span>
    );
  };

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Services', href: '/services', icon: FiActivity },
    { name: 'Appointments', href: '/booking', icon: FiCalendar },

    ...(isAuthenticated
      ? [{ name: 'Dashboard', href: getDashboardLink(), icon: FiActivity }]
      : []),
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: FiUser },
    { name: 'Messages', href: '/messages', icon: FiMessageSquare },
    { name: 'Notifications', href: '/notifications', icon: FiBell },
    { name: 'Pharmacy', href: '/pharmacy', icon: FiPackage },
    { name: 'Lab Tests', href: '/laboratory', icon: FiDroplet },
    { name: 'Settings', href: '/settings', icon: FiSettings },
    ...(isAuthenticated && hasRole('ADMIN')
      ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: FiShield }]
      : []),
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Fixed animation variants with proper TypeScript types
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const navItemVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const userMenuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.nav
      ref={navRef}
      style={{
        background: navbarBackground,
        borderColor: navbarBorder,
        boxShadow: navbarShadow,
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(10px)',
      }}
      className='sticky top-0 z-50 border-b transition-all duration-300'
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          className='flex justify-between items-center h-16 lg:h-20'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          {/* Logo with enhanced styling */}
          <motion.div variants={itemVariants} className='flex items-center'>
            <motion.div
              className='flex items-center space-x-3 hover:opacity-90 transition-opacity cursor-pointer'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Logo />
            </motion.div>
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <motion.div
            className='hidden lg:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2'
            variants={containerVariants}
          >
            {navigation.map(item => (
              <motion.div
                key={item.name}
                variants={navItemVariants}
                initial='rest'
                whileHover='hover'
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    pathname === item.href
                      ? 'text-white bg-linear-to-r from-blue-600 to-purple-600 shadow-lg'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${pathname === item.href ? 'text-white' : ''}`}
                  />
                  <span>{item.name}</span>

                  {/* Hover effect */}
                  {hoveredItem === item.name && pathname !== item.href && (
                    <motion.div
                      className='absolute inset-0 bg-white/30 rounded-2xl -z-10'
                      layoutId='hoverBackground'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: 'spring' as const,
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Desktop User Menu */}
          <motion.div
            className='hidden lg:flex items-center space-x-4'
            variants={containerVariants}
          >
            {isAuthenticated ? (
              <motion.div
                className='flex items-center space-x-4'
                ref={userMenuRef}
              >
                {/* Notification Bell */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className='relative p-2 text-gray-600 hover:text-blue-600 transition-colors'
                >
                  <FiBell className='h-5 w-5' />
                  <motion.span
                    className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>

                {/* User Avatar & Menu */}
                <motion.div className='relative'>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300'
                  >
                    <div className='flex items-center space-x-3'>
                      {user?.image ? (
                        <motion.div
                          className='relative h-10 w-10 rounded-full border-2 border-white shadow-md overflow-hidden'
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            fill
                            sizes='40px'
                            className='object-cover'
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          className='h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md'
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <FiUser className='h-5 w-5 text-white' />
                        </motion.div>
                      )}
                      <div className='text-left'>
                        <div className='text-sm font-semibold text-gray-900'>
                          {user?.name || 'User'}
                        </div>
                        {user?.role && (
                          <div className='text-xs text-gray-500'>
                            {user.role.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown className='h-4 w-4 text-gray-400' />
                    </motion.div>
                  </motion.button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        variants={userMenuVariants}
                        initial='closed'
                        animate='open'
                        exit='closed'
                        className='absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden'
                      >
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
                              <div className='text-xs text-gray-600 truncate'>
                                {user?.email}
                              </div>
                              {user?.role && getRoleBadge(user.role)}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className='p-2'>
                          {userMenuItems.map(item => (
                            <motion.div
                              key={item.name}
                              whileHover={{ x: 5 }}
                              transition={{
                                type: 'spring' as const,
                                stiffness: 400,
                                damping: 10,
                              }}
                            >
                              <Link
                                href={item.href}
                                className='flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200'
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <item.icon className='h-4 w-4' />
                                <span>{item.name}</span>
                              </Link>
                            </motion.div>
                          ))}

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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className='flex items-center space-x-3'
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href='/auth/signin'
                    className='px-6 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors'
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href='/auth/signup'
                    className='bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 block'
                  >
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <motion.div className='lg:hidden' variants={itemVariants}>
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='inline-flex items-center justify-center p-3 rounded-2xl text-gray-700 hover:text-blue-600 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm'
              aria-label='Toggle menu'
            >
              <AnimatePresence mode='wait'>
                {isMobileMenuOpen ? (
                  <motion.div
                    key='close'
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <FiX className='h-6 w-6' />
                  </motion.div>
                ) : (
                  <motion.div
                    key='menu'
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <FiMenu className='h-6 w-6' />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial='closed'
              animate='open'
              exit='closed'
              className='lg:hidden border-t border-white/20 overflow-hidden bg-white/95 backdrop-blur-xl'
            >
              <motion.div className='px-2 pt-2 pb-3 space-y-1'>
                {navigation.map(item => (
                  <motion.div
                    key={item.name}
                    whileHover={{ x: 5 }}
                    transition={{
                      type: 'spring' as const,
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
                        pathname === item.href
                          ? 'text-white bg-linear-to-r from-blue-600 to-purple-600 shadow-lg'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        className={`h-5 w-5 ${pathname === item.href ? 'text-white' : ''}`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mobile User Section */}
              <motion.div className='pt-4 pb-3 border-t border-white/20'>
                {isAuthenticated ? (
                  <div className='space-y-4'>
                    {/* User Info */}
                    <div className='flex items-center px-4'>
                      {user?.image ? (
                        <div className='relative h-14 w-14 rounded-full border-2 border-white shadow-md overflow-hidden'>
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            fill
                            sizes='56px'
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='h-14 w-14 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md'>
                          <FiUser className='h-7 w-7 text-white' />
                        </div>
                      )}
                      <div className='ml-4 flex-1'>
                        <div className='text-base font-semibold text-gray-900'>
                          {user?.name || 'User'}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {user?.email}
                        </div>
                        {user?.role && (
                          <div className='mt-1'>{getRoleBadge(user.role)}</div>
                        )}
                      </div>
                    </div>

                    {/* User Actions */}
                    <div className='space-y-1'>
                      {userMenuItems.map(item => (
                        <motion.div key={item.name} whileHover={{ x: 5 }}>
                          <Link
                            href={item.href}
                            className='flex items-center space-x-3 px-4 py-4 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors'
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className='h-5 w-5' />
                            <span>{item.name}</span>
                          </Link>
                        </motion.div>
                      ))}

                      <motion.button
                        onClick={handleSignOut}
                        whileHover={{ x: 5 }}
                        className='flex items-center space-x-3 w-full px-4 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-left'
                      >
                        <FiLogOut className='h-5 w-5' />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3 px-2'>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Link
                        href='/auth/signin'
                        className='flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-2xl transition-colors'
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href='/auth/signup'
                        className='flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl'
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
