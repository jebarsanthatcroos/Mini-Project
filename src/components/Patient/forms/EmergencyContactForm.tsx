import React from 'react';
import { PatientFormData } from '@/types/patient';
import { FiUser, FiPhone, FiMail, FiHeart, FiLoader } from 'react-icons/fi';
import { z } from 'zod';

// Zod schema for emergency contact validation
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required'),
  phone: z.string().min(1, 'Emergency contact phone number is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

interface PatientEmergencyContactFormProps {
  formData: PatientFormData;
  formErrors?: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void; // Added onBlur prop
  isLoading?: boolean;
}

const PatientEmergencyContactForm: React.FC<
  PatientEmergencyContactFormProps
> = ({ formData, formErrors = {}, onChange, onBlur, isLoading = false }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (isLoading) return; // Prevent changes when loading
    onChange(e.target.name, e.target.value);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (isLoading) return; // Prevent blur handling when loading
    if (onBlur) {
      onBlur(e);
    }
  };

  // Common relationship types
  const relationshipTypes = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Colleague',
    'Neighbor',
    'Other Relative',
    'Other',
  ];

  return (
    <div className='space-y-6 relative'>
      {/* Loading overlay */}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10'>
          <FiLoader className='animate-spin text-blue-500 text-2xl' />
        </div>
      )}

      {/* Header */}
      <div className='flex items-center gap-3 mb-2'>
        <div className='h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center'>
          <FiHeart className='h-4 w-4 text-red-600' />
        </div>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Emergency Contact
          </h3>
          <p className='text-sm text-gray-600'>
            Person to contact in case of emergency
          </p>
        </div>
      </div>

      {/* Contact Name */}
      <div>
        <label
          htmlFor='emergencyName'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Full Name *
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FiUser className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='text'
            id='emergencyName'
            name='name'
            value={formData.emergencyContact.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.name || formErrors['emergencyContact.name']
                ? 'border-red-300'
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter full name of emergency contact'
          />
        </div>
        {(formErrors.name || formErrors['emergencyContact.name']) && (
          <p className='mt-1 text-sm text-red-600'>
            {formErrors.name || formErrors['emergencyContact.name']}
          </p>
        )}
      </div>

      {/* Contact Phone and Relationship */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='emergencyPhone'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Phone Number *
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiPhone className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='tel'
              id='emergencyPhone'
              name='phone'
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors.phone || formErrors['emergencyContact.phone']
                  ? 'border-red-300'
                  : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder='e.g., 077 123 4567'
              pattern='[0-9+\-\s()]{10,}'
              maxLength={15}
            />
          </div>
          {(formErrors.phone || formErrors['emergencyContact.phone']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.phone || formErrors['emergencyContact.phone']}
            </p>
          )}
          <p className='mt-1 text-xs text-gray-500'>
            Include country code if outside Sri Lanka
          </p>
        </div>

        <div>
          <label
            htmlFor='relationship'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Relationship *
          </label>
          <select
            id='relationship'
            name='relationship'
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.relationship ||
              formErrors['emergencyContact.relationship']
                ? 'border-red-300'
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value=''>Select Relationship</option>
            {relationshipTypes.map(relationship => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
          {(formErrors.relationship ||
            formErrors['emergencyContact.relationship']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.relationship ||
                formErrors['emergencyContact.relationship']}
            </p>
          )}
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label
          htmlFor='emergencyEmail'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Email Address (Optional)
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FiMail className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='email'
            id='emergencyEmail'
            name='email'
            value={formData.emergencyContact.email || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.email || formErrors['emergencyContact.email']
                ? 'border-red-300'
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter email address'
          />
        </div>
        {(formErrors.email || formErrors['emergencyContact.email']) && (
          <p className='mt-1 text-sm text-red-600'>
            {formErrors.email || formErrors['emergencyContact.email']}
          </p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          Optional, but recommended for important communications
        </p>
      </div>

      {/* Contact Information Preview */}
      {(formData.emergencyContact.name || formData.emergencyContact.phone) && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-blue-900 mb-3 flex items-center gap-2'>
            <FiUser className='h-4 w-4' />
            Emergency Contact Preview
          </h4>
          <div className='space-y-2 text-sm'>
            {formData.emergencyContact.name && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Name:</span>
                <span className='text-blue-900'>
                  {formData.emergencyContact.name}
                </span>
              </div>
            )}
            {formData.emergencyContact.phone && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Phone:</span>
                <span className='text-blue-900'>
                  {formData.emergencyContact.phone}
                </span>
              </div>
            )}
            {formData.emergencyContact.relationship && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Relationship:</span>
                <span className='text-blue-900'>
                  {formData.emergencyContact.relationship}
                </span>
              </div>
            )}
            {formData.emergencyContact.email && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Email:</span>
                <span className='text-blue-900'>
                  {formData.emergencyContact.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Relationship Buttons */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Quick Relationship Selection
        </label>
        <div className='flex flex-wrap gap-2'>
          {relationshipTypes.slice(0, 6).map(relationship => (
            <button
              key={relationship}
              type='button'
              onClick={() => onChange('relationship', relationship)}
              disabled={isLoading}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                formData.emergencyContact.relationship === relationship
                  ? 'bg-blue-100 text-blue-700 border-blue-300 font-medium'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {relationship}
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <h4 className='text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2'>
          <FiHeart className='h-4 w-4' />
          Emergency Contact Guidelines
        </h4>
        <ul className='text-sm text-yellow-700 space-y-1'>
          <li>
            • Choose someone who is readily available and local if possible
          </li>
          <li>
            • Ensure the contact person is aware they are listed as emergency
            contact
          </li>
          <li>• Provide at least one phone number that is always accessible</li>
          <li>
            • Update this information if the contact person or their details
            change
          </li>
          <li>• Consider having a secondary emergency contact if possible</li>
        </ul>
      </div>

      {/* Important Notice */}
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <div className='shrink-0'>
            <div className='h-6 w-6 bg-red-100 rounded-full flex items-center justify-center'>
              <span className='text-red-600 text-sm font-bold'>!</span>
            </div>
          </div>
          <div>
            <h4 className='text-sm font-medium text-red-800 mb-1'>
              Important Notice
            </h4>
            <p className='text-sm text-red-700'>
              This information will be used in emergency situations. Please
              ensure all details are accurate and up-to-date. In case of
              life-threatening emergencies, medical staff will attempt to
              contact this person immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientEmergencyContactForm;
