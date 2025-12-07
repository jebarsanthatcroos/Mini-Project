'use client';

import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { IPatientFormData } from '@/app/(page)/patients/new/page';

interface PatientAddressFormProps {
  formData: IPatientFormData;
  formErrors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const PatientAddressForm: React.FC<PatientAddressFormProps> = ({
  formData,
  formErrors,
  onChange,
  onBlur,
}) => {
  // Country options
  const countryOptions = [
    { value: 'LK', label: 'Sri Lanka' },
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' },
    { value: 'CN', label: 'China' },
    { value: 'other', label: 'Other' },
  ];

  // Sri Lankan provinces
  const sriLankanProvinces = [
    { value: 'Western', label: 'Western Province' },
    { value: 'Central', label: 'Central Province' },
    { value: 'Southern', label: 'Southern Province' },
    { value: 'Northern', label: 'Northern Province' },
    { value: 'Eastern', label: 'Eastern Province' },
    { value: 'North Western', label: 'North Western Province' },
    { value: 'North Central', label: 'North Central Province' },
    { value: 'Uva', label: 'Uva Province' },
    { value: 'Sabaragamuwa', label: 'Sabaragamuwa Province' },
  ];

  // Other countries states/provinces
  const otherStates = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ];

  // Get state options based on selected country
  const getStateOptions = () => {
    if (formData.address?.country === 'LK') {
      return sriLankanProvinces;
    }
    return otherStates;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: `address.${e.target.name}`,
      },
    } as React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >;

    onBlur(syntheticEvent);
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Street Address */}
        <div className='md:col-span-2'>
          <label
            htmlFor='street'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Street Address *
          </label>
          <input
            type='text'
            id='street'
            name='street'
            value={formData.address?.street || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['address.street'] || formErrors.street
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='123 Main Street, Colombo 05'
            required
          />
          {(formErrors['address.street'] || formErrors.street) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors['address.street'] || formErrors.street}</span>
            </div>
          )}
        </div>

        {/* City */}
        <div>
          <label
            htmlFor='city'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            City *
          </label>
          <input
            type='text'
            id='city'
            name='city'
            value={formData.address?.city || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['address.city'] || formErrors.city
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Colombo'
            required
          />
          {(formErrors['address.city'] || formErrors.city) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors['address.city'] || formErrors.city}</span>
            </div>
          )}
        </div>

        {/* State/Province */}
        <div>
          <label
            htmlFor='state'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            State/Province *
          </label>
          <select
            id='state'
            name='state'
            value={formData.address?.state || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['address.state'] || formErrors.state
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            required
          >
            <option value=''>Select state/province</option>
            {getStateOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(formErrors['address.state'] || formErrors.state) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors['address.state'] || formErrors.state}</span>
            </div>
          )}
        </div>

        {/* Zip/Postal Code */}
        <div>
          <label
            htmlFor='zipCode'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            ZIP/Postal Code
          </label>
          <input
            type='text'
            id='zipCode'
            name='zipCode'
            value={formData.address?.zipCode || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['address.zipCode'] || formErrors.zipCode
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='00500'
          />
          {(formErrors['address.zipCode'] || formErrors.zipCode) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors['address.zipCode'] || formErrors.zipCode}</span>
            </div>
          )}
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor='country'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Country *
          </label>
          <select
            id='country'
            name='country'
            value={formData.address?.country || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['address.country'] || formErrors.country
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            required
          >
            <option value=''>Select country</option>
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(formErrors['address.country'] || formErrors.country) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>{formErrors['address.country'] || formErrors.country}</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className='mt-6'>
        <label
          htmlFor='addressNotes'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Address Notes (Optional)
        </label>
        <textarea
          id='addressNotes'
          name='addressNotes'
          rows={3}
          className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          placeholder='Any additional address information, landmarks, or delivery instructions...'
          onChange={e => {
            // You can store this in a separate field if needed
            console.log('Address notes:', e.target.value);
          }}
        />
        <p className='mt-1 text-xs text-gray-500'>
          Add any special instructions or additional location details
        </p>
      </div>

      {/* Country-specific information */}
      {formData.address?.country === 'LK' && (
        <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <div className='flex items-center'>
            <div className='shrink-0'>
              <svg
                className='h-5 w-5 text-blue-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h4 className='text-sm font-medium text-blue-800'>
                Sri Lankan Address Format
              </h4>
              <div className='mt-1 text-sm text-blue-700'>
                <p>• Use province names for State/Province field</p>
                <p>• ZIP codes are optional but recommended for major cities</p>
                <p>• Include GN Division if known in street address</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Type (Optional) */}
      <div className='mt-6'>
        <fieldset>
          <legend className='text-sm font-medium text-gray-700 mb-2'>
            Address Type (Optional)
          </legend>
          <div className='space-y-2'>
            <div className='flex items-center'>
              <input
                type='radio'
                id='homeAddress'
                name='addressType'
                value='home'
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                defaultChecked
              />
              <label
                htmlFor='homeAddress'
                className='ml-2 text-sm text-gray-700'
              >
                Home Address
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='radio'
                id='workAddress'
                name='addressType'
                value='work'
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <label
                htmlFor='workAddress'
                className='ml-2 text-sm text-gray-700'
              >
                Work Address
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='radio'
                id='otherAddress'
                name='addressType'
                value='other'
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <label
                htmlFor='otherAddress'
                className='ml-2 text-sm text-gray-700'
              >
                Other
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default PatientAddressForm;
