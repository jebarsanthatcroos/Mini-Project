'use client';

import React, { useState } from 'react';
import { FiAlertCircle, FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { BloodType, IPatientFormData } from '@/app/(page)/patients/new/page';

interface PatientMedicalInfoFormProps {
  formData: IPatientFormData;
  formErrors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onArrayChange: (field: 'allergies' | 'medications', value: string[]) => void;
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const PatientMedicalInfoForm: React.FC<PatientMedicalInfoFormProps> = ({
  formData,
  formErrors,
  onChange,
  onArrayChange,
  onBlur,
}) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [showMedicalGuidelines, setShowMedicalGuidelines] = useState(false);

  // Blood type options
  const bloodTypeOptions: { value: BloodType; label: string }[] = [
    { value: 'A+', label: 'A Positive (A+)' },
    { value: 'A-', label: 'A Negative (A-)' },
    { value: 'B+', label: 'B Positive (B+)' },
    { value: 'B-', label: 'B Negative (B-)' },
    { value: 'AB+', label: 'AB Positive (AB+)' },
    { value: 'AB-', label: 'AB Negative (AB-)' },
    { value: 'O+', label: 'O Positive (O+)' },
    { value: 'O-', label: 'O Negative (O-)' },
  ];

  // Common allergies for suggestions
  const commonAllergies = [
    'Penicillin',
    'Sulfa drugs',
    'Aspirin',
    'Ibuprofen',
    'Naproxen',
    'Codeine',
    'Latex',
    'Insect stings',
    'Peanuts',
    'Tree nuts',
    'Shellfish',
    'Eggs',
    'Milk',
    'Soy',
    'Wheat',
    'Fish',
    'Pollen',
    'Dust mites',
    'Mold',
    'Pet dander',
  ];

  // Common medications for suggestions
  const commonMedications = [
    'Metformin',
    'Lisinopril',
    'Atorvastatin',
    'Levothyroxine',
    'Amlodipine',
    'Metoprolol',
    'Albuterol',
    'Omeprazole',
    'Losartan',
    'Gabapentin',
    'Hydrochlorothiazide',
    'Sertraline',
    'Simvastatin',
    'Montelukast',
    'Escitalopram',
    'Fluticasone',
    'Rosuvastatin',
    'Bupropion',
    'Trazodone',
    'Duloxetine',
  ];

  // Medical conditions
  const medicalConditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Arthritis',
    'Cancer',
    'Stroke',
    'Chronic Kidney Disease',
    'COPD',
    'Depression',
    'Anxiety',
    'Epilepsy',
    'HIV/AIDS',
    'Hepatitis',
    'Thyroid Disorders',
    'Migraine',
    'Osteoporosis',
    'Autoimmune Diseases',
  ];

  // Handle adding allergy
  const handleAddAllergy = () => {
    if (newAllergy.trim() === '') return;

    const updatedAllergies = [...(formData.allergies || []), newAllergy.trim()];
    onArrayChange('allergies', updatedAllergies);
    setNewAllergy('');
  };

  // Handle removing allergy
  const handleRemoveAllergy = (index: number) => {
    const updatedAllergies = (formData.allergies || []).filter(
      (_, i) => i !== index
    );
    onArrayChange('allergies', updatedAllergies);
  };

  // Handle adding medication
  const handleAddMedication = () => {
    if (newMedication.trim() === '') return;

    const updatedMedications = [
      ...(formData.medications || []),
      newMedication.trim(),
    ];
    onArrayChange('medications', updatedMedications);
    setNewMedication('');
  };

  // Handle removing medication
  const handleRemoveMedication = (index: number) => {
    const updatedMedications = (formData.medications || []).filter(
      (_, i) => i !== index
    );
    onArrayChange('medications', updatedMedications);
  };

  // Handle allergy suggestion click
  const handleAllergySuggestionClick = (allergy: string) => {
    const updatedAllergies = [...(formData.allergies || []), allergy];
    onArrayChange('allergies', updatedAllergies);
  };

  // Handle medication suggestion click
  const handleMedicationSuggestionClick = (medication: string) => {
    const updatedMedications = [...(formData.medications || []), medication];
    onArrayChange('medications', updatedMedications);
  };

  // Handle medical condition click
  const handleMedicalConditionClick = (condition: string) => {
    const currentHistory = formData.medicalHistory || '';
    const updatedHistory = currentHistory
      ? `${currentHistory}, ${condition}`
      : condition;

    const syntheticEvent = {
      target: {
        name: 'medicalHistory',
        value: updatedHistory,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(syntheticEvent);
  };

  return (
    <div className='space-y-8'>
      {/* Medical Information Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Medical Information
          </h3>
          <p className='text-sm text-gray-600'>
            Provide medical history, allergies, and current medications
          </p>
        </div>
        <button
          type='button'
          onClick={() => setShowMedicalGuidelines(!showMedicalGuidelines)}
          className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800'
        >
          <FiInfo className='w-4 h-4' />
          {showMedicalGuidelines ? 'Hide Guidelines' : 'Show Guidelines'}
        </button>
      </div>

      {/* Medical Guidelines Card */}
      {showMedicalGuidelines && (
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <div className='flex items-start'>
            <div className='shrink-0'>
              <FiInfo className='w-5 h-5 text-blue-400 mt-0.5' />
            </div>
            <div className='ml-3'>
              <h4 className='text-sm font-medium text-blue-800'>
                Medical Information Guidelines
              </h4>
              <ul className='mt-2 text-sm text-blue-700 list-disc list-inside space-y-1'>
                <li>
                  Be specific about medication names, dosages, and frequencies
                </li>
                <li>
                  Include both prescription and over-the-counter medications
                </li>
                <li>
                  Note all known allergies, including drug, food, and
                  environmental
                </li>
                <li>
                  Include major surgeries, hospitalizations, and chronic
                  conditions
                </li>
                <li>Update this information during each visit</li>
              </ul>
            </div>
          </div>
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
          rows={4}
          value={formData.medicalHistory || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            formErrors.medicalHistory
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          }`}
          placeholder='Previous illnesses, surgeries, chronic conditions, family medical history...'
        />
        {formErrors.medicalHistory && (
          <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
            <FiAlertCircle className='w-4 h-4' />
            <span>{formErrors.medicalHistory}</span>
          </div>
        )}

        {/* Common Medical Conditions */}
        <div className='mt-3'>
          <p className='text-sm text-gray-600 mb-2'>
            Common conditions (click to add):
          </p>
          <div className='flex flex-wrap gap-2'>
            {medicalConditions.map(condition => (
              <button
                key={condition}
                type='button'
                onClick={() => handleMedicalConditionClick(condition)}
                className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors'
              >
                {condition}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Allergies Section */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Allergies
        </label>

        {/* Add Allergy Input */}
        <div className='flex gap-2 mb-3'>
          <input
            type='text'
            value={newAllergy}
            onChange={e => setNewAllergy(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAllergy();
              }
            }}
            className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Add an allergy (e.g., Penicillin)'
          />
          <button
            type='button'
            onClick={handleAddAllergy}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <FiPlus className='w-4 h-4 mr-1' />
            Add
          </button>
        </div>

        {/* Common Allergies Suggestions */}
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-2'>
            Common allergies (click to add):
          </p>
          <div className='flex flex-wrap gap-2'>
            {commonAllergies.map(allergy => (
              <button
                key={allergy}
                type='button'
                onClick={() => handleAllergySuggestionClick(allergy)}
                className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors'
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>

        {/* Current Allergies List */}
        <div className='mt-4'>
          {!formData.allergies || formData.allergies.length === 0 ? (
            <div className='text-sm text-gray-500 italic'>
              No allergies recorded. Click &quot;Add&quot; or select from common
              allergies above.
            </div>
          ) : (
            <div className='space-y-2'>
              {formData.allergies.map((allergy, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-md'
                >
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-red-800'>
                      {allergy}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveAllergy(index)}
                    className='text-red-400 hover:text-red-600 transition-colors'
                  >
                    <FiTrash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Medications */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Current Medications
        </label>

        {/* Add Medication Input */}
        <div className='flex gap-2 mb-3'>
          <input
            type='text'
            value={newMedication}
            onChange={e => setNewMedication(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMedication();
              }
            }}
            className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            placeholder='Add a medication (e.g., Metformin 500mg)'
          />
          <button
            type='button'
            onClick={handleAddMedication}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            <FiPlus className='w-4 h-4 mr-1' />
            Add
          </button>
        </div>

        {/* Common Medications Suggestions */}
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-2'>
            Common medications (click to add):
          </p>
          <div className='flex flex-wrap gap-2'>
            {commonMedications.map(medication => (
              <button
                key={medication}
                type='button'
                onClick={() => handleMedicationSuggestionClick(medication)}
                className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors'
              >
                {medication}
              </button>
            ))}
          </div>
        </div>

        {/* Current Medications List */}
        <div className='mt-4'>
          {!formData.medications || formData.medications.length === 0 ? (
            <div className='text-sm text-gray-500 italic'>
              No medications recorded. Click &quot;Add&quot; or select from
              common medications above.
            </div>
          ) : (
            <div className='space-y-2'>
              {formData.medications.map((medication, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-md'
                >
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-green-800'>
                      {medication}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveMedication(index)}
                    className='text-green-400 hover:text-green-600 transition-colors'
                  >
                    <FiTrash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vital Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Blood Type */}
        <div>
          <label
            htmlFor='bloodType'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Blood Type
          </label>
          <select
            id='bloodType'
            name='bloodType'
            value={formData.bloodType || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.bloodType
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value=''>Select blood type</option>
            {bloodTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.bloodType && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.bloodType}</span>
            </div>
          )}
        </div>

        {/* Height */}
        <div>
          <label
            htmlFor='height'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Height (cm)
          </label>
          <input
            type='number'
            id='height'
            name='height'
            min='0'
            max='300'
            step='0.1'
            value={formData.height || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.height
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='170'
          />
          {formErrors.height && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.height}</span>
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <label
            htmlFor='weight'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Weight (kg)
          </label>
          <input
            type='number'
            id='weight'
            name='weight'
            min='0'
            max='300'
            step='0.1'
            value={formData.weight || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.weight
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='65'
          />
          {formErrors.weight && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.weight}</span>
            </div>
          )}
        </div>
      </div>

      {/* BMI Calculation */}
      {formData.height && formData.weight && (
        <div className='p-4 bg-gray-50 border border-gray-200 rounded-md'>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>
            Body Mass Index (BMI)
          </h4>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-sm text-gray-600'>
                Height: {formData.height} cm | Weight: {formData.weight} kg
              </div>
              <div className='mt-1'>
                <span className='text-lg font-semibold'>
                  BMI:{' '}
                  {(
                    formData.weight /
                    ((formData.height / 100) * (formData.height / 100))
                  ).toFixed(1)}
                </span>
              </div>
            </div>
            <div className='text-right'>
              {(() => {
                const bmi =
                  formData.weight /
                  ((formData.height / 100) * (formData.height / 100));
                let status = '';
                let color = '';

                if (bmi < 18.5) {
                  status = 'Underweight';
                  color = 'text-yellow-600 bg-yellow-100';
                } else if (bmi < 25) {
                  status = 'Normal weight';
                  color = 'text-green-600 bg-green-100';
                } else if (bmi < 30) {
                  status = 'Overweight';
                  color = 'text-orange-600 bg-orange-100';
                } else {
                  status = 'Obese';
                  color = 'text-red-600 bg-red-100';
                }

                return (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}
                  >
                    {status}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Additional Medical Information */}
      <div>
        <label
          htmlFor='additionalMedicalInfo'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Additional Medical Information (Optional)
        </label>
        <textarea
          id='additionalMedicalInfo'
          name='additionalMedicalInfo'
          rows={3}
          className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          placeholder='Any other relevant medical information, lifestyle factors, or health concerns...'
        />
        <p className='mt-1 text-xs text-gray-500'>
          Include information about smoking, alcohol consumption, exercise
          habits, diet, etc.
        </p>
      </div>

      {/* No Known Medical Issues */}
      <div className='pt-6 border-t border-gray-200'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='noMedicalIssues'
            name='noMedicalIssues'
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            onChange={e => {
              if (e.target.checked) {
                // Clear all medical information
                const syntheticEvent = {
                  target: {
                    name: 'medicalHistory',
                    value: '',
                  },
                } as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(syntheticEvent);

                onArrayChange('allergies', []);
                onArrayChange('medications', []);

                const bloodTypeEvent = {
                  target: {
                    name: 'bloodType',
                    value: '',
                  },
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(bloodTypeEvent);

                const heightEvent = {
                  target: {
                    name: 'height',
                    value: '',
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(heightEvent);

                const weightEvent = {
                  target: {
                    name: 'weight',
                    value: '',
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(weightEvent);
              }
            }}
          />
          <label
            htmlFor='noMedicalIssues'
            className='ml-2 block text-sm text-gray-900'
          >
            No known medical issues, allergies, or medications
          </label>
        </div>
        <p className='mt-1 text-xs text-gray-500 ml-6'>
          Check this if the patient has no medical history to report
        </p>
      </div>
    </div>
  );
};

export default PatientMedicalInfoForm;
