import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { PatientFormData } from '@/types/patient';

interface EmergencyContactFormProps {
  formData: PatientFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  formData,
  onChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <FiAlertCircle className='w-5 h-5 text-red-600' />
        Emergency Contact
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Contact Name
          </label>
          <input
            type='text'
            name='emergencyContact.name'
            value={formData.emergencyContact?.name || ''}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Phone Number
          </label>
          <input
            type='tel'
            name='emergencyContact.phone'
            value={formData.emergencyContact?.phone || ''}
            onChange={onChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Relationship
          </label>
          <input
            type='text'
            name='emergencyContact.relationship'
            value={formData.emergencyContact?.relationship || ''}
            onChange={onChange}
            placeholder='e.g., Spouse, Parent, Child'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EmergencyContactForm;
