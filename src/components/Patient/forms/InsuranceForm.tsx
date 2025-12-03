import React from 'react';
import { motion } from 'framer-motion';
import { PatientFormData } from '@/types/patient';

interface InsuranceFormProps {
  formData: PatientFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InsuranceForm: React.FC<InsuranceFormProps> = ({
  formData,
  onChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        Insurance Information
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Insurance Provider
          </label>
          <input
            type='text'
            name='insurance.provider'
            value={formData.insurance?.provider}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Policy Number
          </label>
          <input
            type='text'
            name='insurance.policyNumber'
            value={formData.insurance?.policyNumber}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Group Number
          </label>
          <input
            type='text'
            name='insurance.groupNumber'
            value={formData.insurance?.groupNumber}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default InsuranceForm;
