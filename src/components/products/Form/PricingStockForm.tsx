'use client';

import { FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProductFormData } from '@/types/product';

interface PricingStockFormProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export default function PricingStockForm({
  register,
  errors,
}: PricingStockFormProps) {
  return (
    <motion.div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Pricing & Stock
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Selling Price (Rs.) *
          </label>
          <input
            type='number'
            {...register('price')}
            min='0'
            step='0.01'
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='0.00'
          />
          {errors.price && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.price.message}
            </motion.p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Cost Price (Rs.)
          </label>
          <input
            type='number'
            {...register('costPrice')}
            min='0'
            step='0.01'
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='0.00'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Stock Quantity *
          </label>
          <input
            type='number'
            {...register('stockQuantity')}
            min='0'
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='0'
          />
          {errors.stockQuantity && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.stockQuantity.message}
            </motion.p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Min Stock Level
          </label>
          <input
            type='number'
            {...register('minStockLevel')}
            min='0'
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='10'
          />
        </div>

        <div className='flex items-center space-x-3'>
          <input
            type='checkbox'
            {...register('inStock')}
            className='w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300/50'
          />
          <label className='text-sm font-medium text-gray-700'>
            Product is in stock
          </label>
        </div>
      </div>
    </motion.div>
  );
}
