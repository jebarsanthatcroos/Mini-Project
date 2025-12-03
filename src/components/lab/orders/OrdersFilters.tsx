import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { OrdersFiltersProps } from '../types';

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  filters,
  onFilterChange,
  onDateRangeChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Search */}
        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search orders...'
            value={filters.search}
            onChange={e => onFilterChange('search', e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={e => onFilterChange('status', e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value=''>All Statuses</option>
          <option value='REQUESTED'>Requested</option>
          <option value='SAMPLE_COLLECTED'>Sample Collected</option>
          <option value='IN_PROGRESS'>In Progress</option>
          <option value='COMPLETED'>Completed</option>
          <option value='VERIFIED'>Verified</option>
          <option value='CANCELLED'>Cancelled</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={e => onFilterChange('priority', e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value=''>All Priorities</option>
          <option value='LOW'>Low</option>
          <option value='NORMAL'>Normal</option>
          <option value='HIGH'>High</option>
          <option value='STAT'>STAT</option>
        </select>

        {/* Date Range */}
        <div className='flex space-x-2'>
          <input
            type='date'
            value={filters.dateRange.start}
            onChange={e => onDateRangeChange('start', e.target.value)}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
          <input
            type='date'
            value={filters.dateRange.end}
            onChange={e => onDateRangeChange('end', e.target.value)}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OrdersFilters;
