'use client';

import { FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface FormActionsProps {
  loading: boolean;
  isDirty: boolean;
  pharmaciesLoading: boolean;
  onSubmit: () => void;
}

export default function FormActions({
  loading,
  isDirty,
  pharmaciesLoading,
  onSubmit,
}: FormActionsProps) {
  const router = useRouter();

  return (
    <motion.div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'>
      <div className='flex flex-col sm:flex-row gap-4 justify-end items-center'>
        <motion.button
          type='button'
          onClick={() => router.push('/Pharmacist/shop')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='w-full sm:w-auto px-8 py-4 border border-gray-300/50 rounded-xl hover:bg-gray-50/50 transition-all duration-200 font-medium text-gray-700'
        >
          Cancel
        </motion.button>
        <motion.button
          type='button'
          onClick={onSubmit}
          disabled={loading || pharmaciesLoading || !isDirty}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className='w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl'
        >
          <div className='flex items-center justify-center gap-3'>
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className='w-5 h-5 border-2 border-white border-t-transparent rounded-full'
              />
            ) : (
              <FiSave className='text-lg' />
            )}
            {loading ? 'Adding Product...' : 'Add Product'}
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
