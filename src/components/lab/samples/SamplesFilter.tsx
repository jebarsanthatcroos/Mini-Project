import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiSearch, FiCalendar } from 'react-icons/fi';
import { SampleStatus, SamplePriority } from '@/types/lab';

type StatusFilter = SampleStatus | 'ALL';
type PriorityFilter = SamplePriority | 'ALL';
type DateFilter = 'ALL' | 'TODAY' | 'THIS_WEEK';

interface SamplesFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (priority: PriorityFilter) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (date: DateFilter) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export default function SamplesFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  showFilters,
  onShowFiltersChange,
  onClearFilters,
}: SamplesFilterProps) {
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'COLLECTED', label: 'Collected' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const priorityOptions: { value: PriorityFilter; label: string }[] = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HIGH', label: 'High' },
    { value: 'STAT', label: 'STAT' },
  ];

  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: 'ALL', label: 'All Dates' },
    { value: 'TODAY', label: 'Today' },
    { value: 'THIS_WEEK', label: 'This Week' },
  ];

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    dateFilter !== 'ALL';

  const activeFilterCount = [
    searchTerm ? 1 : 0,
    statusFilter !== 'ALL' ? 1 : 0,
    priorityFilter !== 'ALL' ? 1 : 0,
    dateFilter !== 'ALL' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Type-safe handler functions
  const handleStatusChange = (value: string) => {
    onStatusFilterChange(value as StatusFilter);
  };

  const handlePriorityChange = (value: string) => {
    onPriorityFilterChange(value as PriorityFilter);
  };

  const handleDateChange = (value: string) => {
    onDateFilterChange(value as DateFilter);
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
      {/* Main Filter Bar */}
      <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
        {/* Search */}
        <div className='flex-1 relative'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search samples by patient, test, or ID...'
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => onShowFiltersChange(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all duration-200 ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <FiFilter className='w-4 h-4' />
          Filters
          {activeFilterCount > 0 && (
            <span className='bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className='flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200'
          >
            <FiX className='w-4 h-4' />
            Clear All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='mt-6 pt-6 border-t border-gray-200'
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* Status Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Status
                </label>
                <div className='space-y-2'>
                  {statusOptions.map(option => (
                    <label key={option.value} className='flex items-center'>
                      <input
                        type='radio'
                        name='status'
                        value={option.value}
                        checked={statusFilter === option.value}
                        onChange={e => handleStatusChange(e.target.value)}
                        className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Priority
                </label>
                <div className='space-y-2'>
                  {priorityOptions.map(option => (
                    <label key={option.value} className='flex items-center'>
                      <input
                        type='radio'
                        name='priority'
                        value={option.value}
                        checked={priorityFilter === option.value}
                        onChange={e => handlePriorityChange(e.target.value)}
                        className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3 items-center gap-2'>
                  <FiCalendar className='w-4 h-4' />
                  Collection Date
                </label>
                <div className='space-y-2'>
                  {dateOptions.map(option => (
                    <label key={option.value} className='flex items-center'>
                      <input
                        type='radio'
                        name='date'
                        value={option.value}
                        checked={dateFilter === option.value}
                        onChange={e => handleDateChange(e.target.value)}
                        className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-4 flex flex-wrap gap-2'
        >
          {searchTerm && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200'>
              Search: &quot;{searchTerm}&quot;
              <button
                onClick={() => onSearchChange('')}
                className='ml-1 hover:text-blue-600'
              >
                <FiX className='w-3 h-3' />
              </button>
            </span>
          )}
          {statusFilter !== 'ALL' && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200'>
              Status: {statusOptions.find(o => o.value === statusFilter)?.label}
              <button
                onClick={() => onStatusFilterChange('ALL')}
                className='ml-1 hover:text-green-600'
              >
                <FiX className='w-3 h-3' />
              </button>
            </span>
          )}
          {priorityFilter !== 'ALL' && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-200'>
              Priority:{' '}
              {priorityOptions.find(o => o.value === priorityFilter)?.label}
              <button
                onClick={() => onPriorityFilterChange('ALL')}
                className='ml-1 hover:text-orange-600'
              >
                <FiX className='w-3 h-3' />
              </button>
            </span>
          )}
          {dateFilter !== 'ALL' && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200'>
              Date: {dateOptions.find(o => o.value === dateFilter)?.label}
              <button
                onClick={() => onDateFilterChange('ALL')}
                className='ml-1 hover:text-purple-600'
              >
                <FiX className='w-3 h-3' />
              </button>
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
