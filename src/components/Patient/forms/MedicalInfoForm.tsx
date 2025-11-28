import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiPlus, FiTrash2 } from 'react-icons/fi';
import { PatientFormData } from '@/types/patient';

interface MedicalInfoFormProps {
  formData: PatientFormData;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAddAllergy: (allergy: string) => void;
  onRemoveAllergy: (index: number) => void;
  onAddMedication: (medication: string) => void;
  onRemoveMedication: (index: number) => void;
}

const MedicalInfoForm: React.FC<MedicalInfoFormProps> = ({
  formData,
  onChange,
  onAddAllergy,
  onRemoveAllergy,
  onAddMedication,
  onRemoveMedication,
}) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !formData.allergies?.includes(newAllergy.trim())) {
      onAddAllergy(newAllergy.trim());
      setNewAllergy('');
    }
  };

  const handleAddMedication = () => {
    if (
      newMedication.trim() &&
      !formData.medications?.includes(newMedication.trim())
    ) {
      onAddMedication(newMedication.trim());
      setNewMedication('');
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: 'allergy' | 'medication'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'allergy') {
        handleAddAllergy();
      } else {
        handleAddMedication();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <FiHeart className='w-5 h-5 text-purple-600' />
        Medical Information
      </h2>

      <div className='space-y-6'>
        {/* Allergies */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Allergies
          </label>
          <div className='flex gap-2 mb-3'>
            <input
              type='text'
              value={newAllergy}
              onChange={e => setNewAllergy(e.target.value)}
              onKeyPress={e => handleKeyPress(e, 'allergy')}
              placeholder='Add an allergy...'
              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            <button
              type='button'
              onClick={handleAddAllergy}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <FiPlus className='w-4 h-4' />
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {formData.allergies?.map((allergy, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm'
              >
                {allergy}
                <button
                  type='button'
                  onClick={() => onRemoveAllergy(index)}
                  className='hover:text-red-900'
                >
                  <FiTrash2 className='w-3 h-3' />
                </button>
              </span>
            ))}
            {formData.allergies?.length === 0 && (
              <p className='text-gray-500 text-sm'>No allergies added</p>
            )}
          </div>
        </div>

        {/* Medications */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Current Medications
          </label>
          <div className='flex gap-2 mb-3'>
            <input
              type='text'
              value={newMedication}
              onChange={e => setNewMedication(e.target.value)}
              onKeyPress={e => handleKeyPress(e, 'medication')}
              placeholder='Add a medication...'
              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            <button
              type='button'
              onClick={handleAddMedication}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <FiPlus className='w-4 h-4' />
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {formData.medications?.map((medication, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
              >
                {medication}
                <button
                  type='button'
                  onClick={() => onRemoveMedication(index)}
                  className='hover:text-blue-900'
                >
                  <FiTrash2 className='w-3 h-3' />
                </button>
              </span>
            ))}
            {formData.medications?.length === 0 && (
              <p className='text-gray-500 text-sm'>No medications added</p>
            )}
          </div>
        </div>

        {/* Medical History */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Medical History
          </label>
          <textarea
            name='medicalHistory'
            value={formData.medicalHistory}
            onChange={onChange}
            rows={6}
            placeholder="Enter patient's medical history, including past conditions, surgeries, and relevant health information..."
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MedicalInfoForm;
