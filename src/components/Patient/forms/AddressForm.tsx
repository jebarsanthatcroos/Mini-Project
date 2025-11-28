import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';
import { PatientFormData } from '@/types/patient';

interface AddressFormProps {
  formData: PatientFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ formData, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <FiMapPin className='w-5 h-5 text-green-600' />
        Address Information
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Street Address
          </label>
          <input
            type='text'
            name='address.street'
            value={formData.address.street}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='123 Main St'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            City
          </label>
          <input
            type='text'
            name='address.city'
            value={formData.address.city}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='New York'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            State
          </label>
          <input
            type='text'
            name='address.state'
            value={formData.address.state}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='NY'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            ZIP Code
          </label>
          <input
            type='text'
            name='address.zipCode'
            value={formData.address.zipCode}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='10001'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Country
          </label>
          <input
            type='text'
            name='address.country'
            value={formData.address.country}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='United States'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AddressForm;
