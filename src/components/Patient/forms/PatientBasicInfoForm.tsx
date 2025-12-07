'use client';

import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import {
  Gender,
  MaritalStatus,
  IPatientFormData,
} from '@/app/(page)/patients/new/page';

interface PatientBasicInfoFormProps {
  formData: IPatientFormData;
  formErrors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const PatientBasicInfoForm: React.FC<PatientBasicInfoFormProps> = ({
  formData,
  formErrors,
  onChange,
  onBlur,
}) => {
  const genderOptions: { value: Gender; label: string }[] = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'si', label: 'Sinhala' },
    { value: 'ta', label: 'Tamil' },
    { value: 'hi', label: 'Hindi' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* First Name */}
        <div>
          <label
            htmlFor='firstName'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            First Name *
          </label>
          <input
            type='text'
            id='firstName'
            name='firstName'
            value={formData.firstName}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.firstName
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='John'
            required
          />
          {formErrors.firstName && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.firstName}</span>
            </div>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor='lastName'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Last Name *
          </label>
          <input
            type='text'
            id='lastName'
            name='lastName'
            value={formData.lastName}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.lastName
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Doe'
            required
          />
          {formErrors.lastName && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.lastName}</span>
            </div>
          )}
        </div>

        {/* NIC */}
        <div>
          <label
            htmlFor='nic'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            NIC/Passport Number *
          </label>
          <input
            type='text'
            id='nic'
            name='nic'
            value={formData.nic}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.nic
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='123456789V'
            required
          />
          {formErrors.nic && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.nic}</span>
            </div>
          )}
          <p className='mt-1 text-xs text-gray-500'>
            National Identity Card or Passport number
          </p>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Email Address
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.email
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='john.doe@example.com'
          />
          {formErrors.email && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.email}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor='phone'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Phone Number *
          </label>
          <input
            type='tel'
            id='phone'
            name='phone'
            value={formData.phone}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.phone
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='+94 77 123 4567'
            required
          />
          {formErrors.phone && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.phone}</span>
            </div>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label
            htmlFor='dateOfBirth'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Date of Birth *
          </label>
          <input
            type='date'
            id='dateOfBirth'
            name='dateOfBirth'
            value={formData.dateOfBirth}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.dateOfBirth
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            required
          />
          {formErrors.dateOfBirth && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.dateOfBirth}</span>
            </div>
          )}
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor='gender'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Gender *
          </label>
          <select
            id='gender'
            name='gender'
            value={formData.gender}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.gender
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            required
          >
            <option value=''>Select gender</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.gender && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.gender}</span>
            </div>
          )}
        </div>

        {/* Marital Status */}
        <div>
          <label
            htmlFor='maritalStatus'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Marital Status
          </label>
          <select
            id='maritalStatus'
            name='maritalStatus'
            value={formData.maritalStatus || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.maritalStatus
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value=''>Select marital status</option>
            {maritalStatusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.maritalStatus && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.maritalStatus}</span>
            </div>
          )}
        </div>

        {/* Occupation */}
        <div>
          <label
            htmlFor='occupation'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Occupation
          </label>
          <input
            type='text'
            id='occupation'
            name='occupation'
            value={formData.occupation || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.occupation
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Software Engineer'
          />
          {formErrors.occupation && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.occupation}</span>
            </div>
          )}
        </div>

        {/* Preferred Language */}
        <div>
          <label
            htmlFor='preferredLanguage'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Preferred Language
          </label>
          <select
            id='preferredLanguage'
            name='preferredLanguage'
            value={formData.preferredLanguage || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.preferredLanguage
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value=''>Select preferred language</option>
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.preferredLanguage && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors.preferredLanguage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className='flex items-center mt-4'>
        <input
          type='checkbox'
          id='isActive'
          name='isActive'
          checked={formData.isActive !== undefined ? formData.isActive : true}
          onChange={onChange}
          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
        />
        <label htmlFor='isActive' className='ml-2 block text-sm text-gray-900'>
          Patient is active
        </label>
        <p className='ml-2 text-xs text-gray-500'>
          Uncheck if patient is inactive (e.g., moved, deceased)
        </p>
      </div>

      {/* Last Visit (optional) */}
      <div className='mt-4'>
        <label
          htmlFor='lastVisit'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Last Visit Date (Optional)
        </label>
        <input
          type='date'
          id='lastVisit'
          name='lastVisit'
          value={formData.lastVisit || ''}
          onChange={onChange}
          onBlur={onBlur}
          className={`block w-full max-w-xs px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            formErrors.lastVisit
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          }`}
        />
        {formErrors.lastVisit && (
          <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
            <FiAlertCircle className='w-4 h-4' />
            <span>{formErrors.lastVisit}</span>
          </div>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          Leave blank if this is the patient&apos;s first visit
        </p>
      </div>
    </div>
  );
};

export default PatientBasicInfoForm;
