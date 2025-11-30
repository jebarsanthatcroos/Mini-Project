// components/Patient/NewPatientHeader.tsx
import React from 'react';
import { FiArrowLeft, FiUserPlus } from 'react-icons/fi';

interface NewPatientHeaderProps {
  onBack: () => void;
}

const NewPatientHeader: React.FC<NewPatientHeaderProps> = ({ onBack }) => {
  return (
    <div className='mb-8'>
      {/* Back Button */}
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group'
      >
        <FiArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
        <span className='text-sm font-medium'>Back to Patients</span>
      </button>

      {/* Main Header */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
        <div className='flex items-center gap-4'>
          {/* Icon */}
          <div className='hidden sm:flex h-12 w-12 bg-blue-100 rounded-lg items-center justify-center'>
            <FiUserPlus className='h-6 w-6 text-blue-600' />
          </div>

          {/* Title and Description */}
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
              New Patient
            </h1>
            <p className='text-gray-600 mt-1 sm:mt-2'>
              Create a new patient record in the system
            </p>
          </div>
        </div>

        {/* Progress Steps (Optional) */}
        <div className='flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200'>
          <div className='flex items-center justify-center h-6 w-6 bg-blue-600 text-white text-xs font-medium rounded-full'>
            1
          </div>
          <span className='text-sm font-medium text-blue-700'>
            New Patient Form
          </span>
        </div>
      </div>

      {/* Quick Tips */}
      <div className='mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <h3 className='text-sm font-medium text-gray-900 mb-2'>Quick Tips</h3>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li className='flex items-start gap-2'>
            <span className='text-blue-500 mt-0.5'>•</span>
            <span>Fill in all required fields marked with *</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-500 mt-0.5'>•</span>
            <span>Use the sidebar to navigate between sections</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-500 mt-0.5'>•</span>
            <span>Save your progress regularly</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NewPatientHeader;
