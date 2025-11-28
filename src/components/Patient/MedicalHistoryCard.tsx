import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiEdit } from 'react-icons/fi';
import { Patient } from '@/types/patient';

interface MedicalHistoryCardProps {
  patient: Patient;
}

const MedicalHistoryCard: React.FC<MedicalHistoryCardProps> = ({ patient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
          <FiHeart className='w-5 h-5 text-green-600' />
          Medical History
        </h2>
        <button className='text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1'>
          <FiEdit className='w-4 h-4' />
          Edit History
        </button>
      </div>

      {patient.medicalHistory ? (
        <div className='prose max-w-none'>
          <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
            <p className='text-gray-900 whitespace-pre-wrap leading-relaxed'>
              {patient.medicalHistory}
            </p>
          </div>

          <div className='mt-4 flex gap-3 text-sm text-gray-500'>
            <div>
              <span className='font-medium'>Last Updated:</span>{' '}
              {new Date(patient.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className='text-center py-8'>
          <FiHeart className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No medical history
          </h3>
          <p className='text-gray-500 mb-4'>
            No medical history recorded for this patient yet.
          </p>
          <div className='flex gap-3 justify-center'>
            <button className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
              <FiEdit className='w-4 h-4' />
              Add Medical History
            </button>
            <button className='inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Upload Records
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MedicalHistoryCard;
