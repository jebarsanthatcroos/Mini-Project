import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiUser, FiMail } from 'react-icons/fi';
import { OrdersStatsProps } from '../types';

const OrdersStats: React.FC<OrdersStatsProps> = ({ orders }) => {
  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: FiUsers,
      color: 'blue',
    },
    {
      label: 'Pending',
      value: orders.filter(o =>
        ['REQUESTED', 'SAMPLE_COLLECTED'].includes(o.status)
      ).length,
      icon: FiCalendar,
      color: 'yellow',
    },
    {
      label: 'Overdue',
      value: orders.filter(o => o.isOverdue).length,
      icon: FiUser,
      color: 'red',
    },
    {
      label: 'Completed Today',
      value: orders.filter(
        o =>
          o.status === 'COMPLETED' &&
          new Date(o.completedDate!).toDateString() ===
            new Date().toDateString()
      ).length,
      icon: FiMail,
      color: 'green',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      green: 'bg-green-100 text-green-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'
        >
          <div className='flex items-center'>
            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
              <stat.icon className='text-xl' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>{stat.label}</p>
              <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OrdersStats;
