'use client';

import { FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProductFormData } from '@/types/product';

interface BasicInformationFormProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pharmacies: Array<{ _id: string; name: string; address: any }>;
  pharmaciesLoading: boolean;
  pharmaciesError: string;
  categories: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatAddress: (address: any) => string;
}

export default function BasicInformationForm({
  register,
  errors,
  pharmacies,
  pharmaciesLoading,
  pharmaciesError,
  categories,
  formatAddress,
}: BasicInformationFormProps) {
  return (
    <motion.div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Basic Information
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Product Name *
          </label>
          <input
            {...register('name')}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='Enter product name'
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.name.message}
            </motion.p>
          )}
        </div>

        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none'
            placeholder='Enter product description'
          />
          {errors.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.description.message}
            </motion.p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Manufacturer *
          </label>
          <input
            {...register('manufacturer')}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='Enter manufacturer name'
          />
          {errors.manufacturer && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.manufacturer.message}
            </motion.p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Category *
          </label>
          <select
            {...register('category')}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
          >
            <option value=''>Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.category.message}
            </motion.p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Pharmacy *
          </label>
          {pharmaciesLoading ? (
            <div className='w-full px-4 py-3 border border-gray-300/50 rounded-xl bg-gray-100/50 animate-pulse'>
              Loading pharmacies...
            </div>
          ) : pharmaciesError ? (
            <div className='flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50/50 p-3 rounded-xl border border-yellow-200'>
              <FiAlertCircle />
              <span>{pharmaciesError}</span>
            </div>
          ) : (
            <select
              {...register('pharmacy')}
              className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            >
              <option value=''>Select Pharmacy</option>
              {pharmacies.map(pharmacy => (
                <option key={pharmacy._id} value={pharmacy._id}>
                  {pharmacy.name} - {formatAddress(pharmacy.address)}
                </option>
              ))}
            </select>
          )}
          {errors.pharmacy && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.pharmacy.message}
            </motion.p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            SKU (Auto-generated)
          </label>
          <input
            {...register('sku')}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200'
            readOnly
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Barcode *
          </label>
          <input
            {...register('barcode')}
            className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
            placeholder='Enter product barcode'
          />
          {errors.barcode && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-red-500 text-sm mt-2 flex items-center gap-2'
            >
              <FiAlertCircle />
              {errors.barcode.message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
