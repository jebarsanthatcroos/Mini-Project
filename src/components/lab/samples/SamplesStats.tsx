import { motion } from 'framer-motion';
import {
  FiPackage,
  FiSearch,
  FiPlus,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';

interface EmptySamplesStateProps {
  hasSamples: boolean;
  searchTerm: string;
  onClearFilters: () => void;
  onCreateSample: () => void;
  onRefresh?: () => void;
  filtersActive?: boolean;
}

export default function EmptySamplesState({
  hasSamples,
  searchTerm,
  onClearFilters,
  onCreateSample,
  onRefresh,
  filtersActive = false,
}: EmptySamplesStateProps) {
  // No samples at all in the system
  if (!hasSamples && !searchTerm && !filtersActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'
      >
        <div className='max-w-md mx-auto'>
          <FiPackage className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No samples yet
          </h3>
          <p className='text-gray-500 mb-6'>
            Get started by creating your first lab sample. Track samples from
            collection to analysis and results.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              onClick={onCreateSample}
              className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
            >
              <FiPlus className='w-5 h-5' />
              Create First Sample
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className='flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
              >
                <FiRefreshCw className='w-5 h-5' />
                Refresh
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // No samples due to search
  if (searchTerm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'
      >
        <div className='max-w-md mx-auto'>
          <FiSearch className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No samples found
          </h3>
          <p className='text-gray-500 mb-4'>
            No samples match your search criteria{' '}
            <span className='font-medium'>&quot;{searchTerm}&quot;</span>.
          </p>
          <p className='text-sm text-gray-400 mb-6'>
            Try adjusting your search term or filters to see more results.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              onClick={onClearFilters}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
            >
              Clear Search
            </button>
            <button
              onClick={onCreateSample}
              className='px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
            >
              Create New Sample
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // No samples due to filters
  if (filtersActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'
      >
        <div className='max-w-md mx-auto'>
          <FiFilter className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No matching samples
          </h3>
          <p className='text-gray-500 mb-4'>
            No samples match your current filter criteria.
          </p>
          <p className='text-sm text-gray-400 mb-6'>
            Try adjusting your filters to see different samples.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              onClick={onClearFilters}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
            >
              Clear All Filters
            </button>
            <button
              onClick={onCreateSample}
              className='px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
            >
              Create New Sample
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback empty state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'
    >
      <div className='max-w-md mx-auto'>
        <FiPackage className='w-16 h-16 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No samples to display
        </h3>
        <p className='text-gray-500 mb-6'>
          There are currently no samples available to display.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <button
            onClick={onCreateSample}
            className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
          >
            <FiPlus className='w-5 h-5' />
            Create Sample
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className='flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
            >
              <FiRefreshCw className='w-5 h-5' />
              Refresh
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
