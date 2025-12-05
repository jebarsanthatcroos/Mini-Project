import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiClock,
  FiPhoneCall,
  FiFileText,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';

export const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard/Receptionist',
    icon: FiHome,
  },
  {
    name: 'Appointments',
    href: '/Receptionist/appointments',
    icon: FiCalendar,
  },
  {
    name: 'Patients',
    href: '/Receptionist/patients',
    icon: FiUsers,
  },
  {
    name: 'Check-In',
    href: '/Receptionist/check-in',
    icon: FiClipboard,
  },
  {
    name: 'Queue',
    href: '/Receptionist/queue',
    icon: FiClock,
  },
  {
    name: 'Calls',
    href: '/Receptionist/calls',
    icon: FiPhoneCall,
  },
  {
    name: 'Reports',
    href: '/Receptionist/reports',
    icon: FiFileText,
  },
  {
    name: 'Analytics',
    href: '/Receptionist/analytics',
    icon: FiBarChart2,
  },
  {
    name: 'Settings',
    href: '/Receptionist/settings',
    icon: FiSettings,
  },
];
