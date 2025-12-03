import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiPlus } from 'react-icons/fi';

interface EmptySamplesStateProps {
  hasSamples: boolean;
  searchTerm: string;
  onClearFilters: () => void;
  onCreateSample: () => void;
}

export default function EmptySamplesState({
  hasSamples,
  searchTerm,
  onClearFilters,
  onCreateSample,
}: EmptySamplesStateProps) {
  if (hasSamples && searchTerm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'
      >
        <FiSearch className='w-16 h-16 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No samples found
        </h3>
        <p className='text-gray-500 mb-6 max-w-md mx-auto'>
          No samples match your search criteria &quot;{searchTerm}&quot;. Try
          adjusting your filters or search term.
        </p>
        <button
          onClick={onClearFilters}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
        >
          Clear Filters
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'
    >
      <FiPackage className='w-16 h-16 text-gray-300 mx-auto mb-4' />
      <h3 className='text-lg font-medium text-gray-900 mb-2'>No samples yet</h3>
      <p className='text-gray-500 mb-6 max-w-md mx-auto'>
        Get started by creating your first lab sample. Track samples from
        collection to analysis and results.
      </p>
      <button
        onClick={onCreateSample}
        className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-auto'
      >
        <FiPlus className='w-5 h-5' />
        Create First Sample
      </button>
    </motion.div>
  );
}
