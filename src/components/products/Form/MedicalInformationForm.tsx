'use client';

import { FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormRegister } from 'react-hook-form';
import { ProductFormData } from '@/types/product';

interface MedicalInformationFormProps {
  register: UseFormRegister<ProductFormData>;
  watchedRequiresPrescription: boolean;
}

export default function MedicalInformationForm({
  register,
  watchedRequiresPrescription,
}: MedicalInformationFormProps) {
  return (
    <motion.div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Medical Information
      </h2>
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Active Ingredients
          </label>
          <input
            {...register('activeIngredients')}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='e.g., Paracetamol 500mg'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Dosage Instructions
          </label>
          <textarea
            {...register('dosage')}
            rows={2}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none'
            placeholder='e.g., Take 1 tablet every 4-6 hours as needed'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Side Effects
          </label>
          <textarea
            {...register('sideEffects')}
            rows={2}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none'
            placeholder='e.g., May cause drowsiness, nausea'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              {...register('requiresPrescription')}
              className='w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300/50'
            />
            <label className='text-sm font-medium text-gray-700'>
              Requires prescription
            </label>
          </div>

          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              {...register('isControlledSubstance')}
              className='w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300/50'
            />
            <label className='text-sm font-medium text-gray-700'>
              Controlled substance
            </label>
          </div>
        </div>

        <AnimatePresence>
          {watchedRequiresPrescription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='bg-blue-50/50 border border-blue-200 rounded-xl p-4'
            >
              <p className='text-sm text-blue-700 flex items-center gap-2'>
                <FiAlertCircle />
                This product requires a valid prescription for purchase.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
