// components/Patient/Form/PatientMedicalInfoForm.tsx
import React, { useState } from 'react';
import { PatientFormData } from '@/types/patient';
import { FiPlus, FiX, FiAlertTriangle, FiInfo, FiLoader } from 'react-icons/fi';

interface PatientMedicalInfoFormProps {
  formData: PatientFormData;
  formErrors?: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onArrayChange: (field: 'allergies' | 'medications', value: string[]) => void;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  isLoading?: boolean;
}

const PatientMedicalInfoForm: React.FC<PatientMedicalInfoFormProps> = ({
  formData,
  formErrors = {},
  onChange,
  onArrayChange,
  onBlur,
  isLoading = false,
}) => {
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const addAllergy = () => {
    if (allergyInput.trim() && !isLoading) {
      onArrayChange('allergies', [...formData.allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    if (!isLoading) {
      onArrayChange(
        'allergies',
        formData.allergies.filter((_, i) => i !== index)
      );
    }
  };

  const addMedication = () => {
    if (medicationInput.trim() && !isLoading) {
      onArrayChange('medications', [
        ...formData.medications,
        medicationInput.trim(),
      ]);
      setMedicationInput('');
    }
  };

  const removeMedication = (index: number) => {
    if (!isLoading) {
      onArrayChange(
        'medications',
        formData.medications.filter((_, i) => i !== index)
      );
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'allergy' | 'medication'
  ) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      if (type === 'allergy') {
        addAllergy();
      } else {
        addMedication();
      }
    }
  };

  // Handle blur for the allergy and medication input fields
  const handleInputBlur = (field: 'allergy' | 'medication') => {
    if (isLoading) return;
    if (field === 'allergy' && allergyInput.trim()) {
      addAllergy();
    } else if (field === 'medication' && medicationInput.trim()) {
      addMedication();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (isLoading) return;
    onChange(e);
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (isLoading) return;
    if (onBlur) {
      onBlur(e);
    }
  };

  // Calculate BMI if height and weight are provided
  const calculateBMI = (): number | null => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      return Number(
        (formData.weight / (heightInMeters * heightInMeters)).toFixed(1)
      );
    }
    return null;
  };

  const bmi = calculateBMI();
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (bmi < 25) return 'text-green-600 bg-green-50 border-green-200';
    if (bmi < 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className='space-y-6 relative'>
      {/* Loading overlay */}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg'>
          <FiLoader className='animate-spin text-blue-500 text-2xl' />
        </div>
      )}

      {/* Medical History */}
      <div>
        <label
          htmlFor='medicalHistory'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Medical History
        </label>
        <textarea
          id='medicalHistory'
          name='medicalHistory'
          value={formData.medicalHistory}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          rows={4}
          className={`block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            formErrors.medicalHistory ? 'border-red-300' : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Enter patient's medical history, past conditions, surgeries, chronic illnesses, etc."
        />
        {formErrors.medicalHistory && (
          <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
            <FiAlertTriangle className='w-3 h-3' />
            {formErrors.medicalHistory}
          </p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          Include relevant medical history that could impact current treatment
        </p>
      </div>

      {/* Allergies Section */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Allergies
        </label>
        <div className='flex gap-2 mb-2'>
          <input
            type='text'
            value={allergyInput}
            onChange={e => setAllergyInput(e.target.value)}
            onKeyPress={e => handleKeyPress(e, 'allergy')}
            onBlur={() => handleInputBlur('allergy')}
            disabled={isLoading}
            className={`flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder='Add an allergy (e.g., Penicillin, Peanuts, Latex)'
          />
          <button
            type='button'
            onClick={addAllergy}
            disabled={!allergyInput.trim() || isLoading}
            className='px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <FiPlus className='w-4 h-4' />
          </button>
        </div>
        <div className='flex flex-wrap gap-2 min-h-8'>
          {formData.allergies.map((allergy, index) => (
            <span
              key={index}
              className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-200'
            >
              {allergy}
              <button
                type='button'
                onClick={() => removeAllergy(index)}
                disabled={isLoading}
                className='ml-1 hover:text-red-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FiX className='w-3 h-3' />
              </button>
            </span>
          ))}
          {formData.allergies.length === 0 && (
            <span className='text-sm text-gray-500 italic'>
              No allergies recorded
            </span>
          )}
        </div>
        {formErrors.allergies && (
          <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
            <FiAlertTriangle className='w-3 h-3' />
            {formErrors.allergies}
          </p>
        )}
      </div>

      {/* Medications Section */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Current Medications
        </label>
        <div className='flex gap-2 mb-2'>
          <input
            type='text'
            value={medicationInput}
            onChange={e => setMedicationInput(e.target.value)}
            onKeyPress={e => handleKeyPress(e, 'medication')}
            onBlur={() => handleInputBlur('medication')}
            disabled={isLoading}
            className={`flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder='Add a medication (e.g., Metformin, Lisinopril, Aspirin)'
          />
          <button
            type='button'
            onClick={addMedication}
            disabled={!medicationInput.trim() || isLoading}
            className='px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <FiPlus className='w-4 h-4' />
          </button>
        </div>
        <div className='flex flex-wrap gap-2 min-h-8'>
          {formData.medications.map((medication, index) => (
            <span
              key={index}
              className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200'
            >
              {medication}
              <button
                type='button'
                onClick={() => removeMedication(index)}
                disabled={isLoading}
                className='ml-1 hover:text-green-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FiX className='w-3 h-3' />
              </button>
            </span>
          ))}
          {formData.medications.length === 0 && (
            <span className='text-sm text-gray-500 italic'>
              No medications recorded
            </span>
          )}
        </div>
        {formErrors.medications && (
          <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
            <FiAlertTriangle className='w-3 h-3' />
            {formErrors.medications}
          </p>
        )}
      </div>

      {/* Blood Type and Height */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='bloodType'
            className='block text-sm font-medium text-gray-700'
          >
            Blood Type
          </label>
          <select
            id='bloodType'
            name='bloodType'
            value={formData.bloodType || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.bloodType ? 'border-red-300' : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value=''>Select Blood Type</option>
            <option value='A+'>A+</option>
            <option value='A-'>A-</option>
            <option value='B+'>B+</option>
            <option value='B-'>B-</option>
            <option value='AB+'>AB+</option>
            <option value='AB-'>AB-</option>
            <option value='O+'>O+</option>
            <option value='O-'>O-</option>
          </select>
          {formErrors.bloodType && (
            <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
              <FiAlertTriangle className='w-3 h-3' />
              {formErrors.bloodType}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='height'
            className='block text-sm font-medium text-gray-700'
          >
            Height (cm)
          </label>
          <input
            type='number'
            id='height'
            name='height'
            value={formData.height || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            min='0'
            max='300'
            step='0.1'
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.height ? 'border-red-300' : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter height in cm'
          />
          {formErrors.height && (
            <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
              <FiAlertTriangle className='w-3 h-3' />
              {formErrors.height}
            </p>
          )}
        </div>
      </div>

      {/* Weight and BMI */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='weight'
            className='block text-sm font-medium text-gray-700'
          >
            Weight (kg)
          </label>
          <input
            type='number'
            id='weight'
            name='weight'
            value={formData.weight || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            min='0'
            max='500'
            step='0.1'
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.weight ? 'border-red-300' : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter weight in kg'
          />
          {formErrors.weight && (
            <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
              <FiAlertTriangle className='w-3 h-3' />
              {formErrors.weight}
            </p>
          )}
        </div>

        {/* BMI Display */}
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            BMI Calculation
          </label>
          <div className='mt-1'>
            {bmi ? (
              <div
                className={`border rounded-md p-3 text-center ${getBMIColor(bmi)}`}
              >
                <div className='text-lg font-semibold'>{bmi}</div>
                <div className='text-sm'>{getBMICategory(bmi)}</div>
              </div>
            ) : (
              <div className='border border-gray-300 rounded-md p-3 text-center text-gray-500 bg-gray-50'>
                <div className='text-sm'>
                  Enter height and weight to calculate BMI
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Information Alert */}
      {(formData.allergies.length > 0 || formData.bloodType) && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2'>
            <FiInfo className='h-4 w-4' />
            Critical Medical Information
          </h4>
          <div className='space-y-2 text-sm text-yellow-700'>
            {formData.allergies.length > 0 && (
              <div>
                <span className='font-medium'>Allergies:</span>{' '}
                {formData.allergies.join(', ')}
              </div>
            )}
            {formData.bloodType && (
              <div>
                <span className='font-medium'>Blood Type:</span>{' '}
                {formData.bloodType}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='text-sm font-medium text-blue-800 mb-2 flex items-center gap-2'>
          <FiInfo className='h-4 w-4' />
          Medical Information Guidelines
        </h4>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>
            • Include past surgeries, chronic conditions, and major illnesses
          </li>
          <li>
            • List all known allergies including drug, food, and environmental
          </li>
          <li>• Include both prescription and over-the-counter medications</li>
          <li>• Update this information during each patient visit</li>
          <li>• Blood type and BMI help in emergency situations</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientMedicalInfoForm;
