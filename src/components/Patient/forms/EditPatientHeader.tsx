import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

interface EditPatientHeaderProps {
  onBack: () => void;
}

const EditPatientHeader: React.FC<EditPatientHeaderProps> = ({ onBack }) => {
  return (
    <div className='mb-8'>
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
      >
        <FiArrowLeft className='w-5 h-5' />
        Back to Patient Details
      </button>

      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Edit Patient</h1>
          <p className='text-gray-600 mt-2'>
            Update patient information and medical records
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditPatientHeader;
