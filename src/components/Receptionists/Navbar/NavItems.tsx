'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FiActivity, FiPackage, FiFileText, FiUsers } from 'react-icons/fi';

interface NavItemsProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

export default function NavItems({
  mobile = false,
  onItemClick,
}: NavItemsProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

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

  const navigation = [
    {
      name: 'Appointments',
      href: '/appointments',
      icon: FiPackage,
    },
    { name: 'Records', href: '/records', icon: FiFileText },
    { name: 'Patient', href: '/Receptionist/patients', icon: FiUsers },

    ...(isAuthenticated
      ? [{ name: 'Dashboard', href: getDashboardLink(), icon: FiActivity }]
      : []),
  ];

  const itemVariants: Variants = {
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const mobileItemVariants: Variants = {
    hover: {
      x: 5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const currentVariants = mobile ? mobileItemVariants : itemVariants;

  return (
    <>
      {navigation.map(item => (
        <motion.div
          key={item.name}
          variants={!mobile ? currentVariants : undefined}
          initial='rest'
          whileHover={!mobile ? 'hover' : undefined}
        >
          <Link
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center space-x-3 ${
              mobile
                ? 'px-4 py-4 rounded-2xl text-base font-semibold'
                : 'px-6 py-3 rounded-2xl text-sm font-semibold'
            } transition-all duration-300 ${
              pathname === item.href
                ? 'text-white bg-linear-to-r from-blue-600 to-purple-600 shadow-lg'
                : mobile
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
            }`}
          >
            <item.icon className={mobile ? 'h-5 w-5' : 'h-4 w-4'} />
            <span>{item.name}</span>
          </Link>
        </motion.div>
      ))}
    </>
  );
}
