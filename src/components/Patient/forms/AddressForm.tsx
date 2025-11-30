// components/Patient/forms/AddressForm.tsx
import React from 'react';
import { FiLoader, FiMapPin, FiHome, FiNavigation } from 'react-icons/fi';
import { PatientFormData } from '@/types/patient';

interface PatientAddressFormProps {
  formData: PatientFormData;
  formErrors?: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

const PatientAddressForm: React.FC<PatientAddressFormProps> = ({
  formData,
  formErrors = {},
  onChange,
  onBlur,
  isLoading = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    onChange(e.target.name, e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isLoading) return;
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className='space-y-6 relative'>
      {/* Loading overlay */}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10'>
          <FiLoader className='animate-spin text-blue-500 text-2xl' />
        </div>
      )}

      {/* Street Address */}
      <div>
        <label
          htmlFor='street'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Street Address *
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FiHome className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='text'
            id='street'
            name='street' // This should match your backend field name
            value={formData.address.street}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.street || formErrors['address.street']
                ? 'border-red-300'
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter street address (e.g., Vanniyar Road Kaluthavalai)'
          />
        </div>
        {(formErrors.street || formErrors['address.street']) && (
          <p className='mt-1 text-sm text-red-600'>
            {formErrors.street || formErrors['address.street']}
          </p>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* City */}
        <div>
          <label
            htmlFor='city'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            City *
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiMapPin className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              id='city'
              name='city' // This should match your backend field name
              value={formData.address.city}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors.city || formErrors['address.city']
                  ? 'border-red-300'
                  : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder='Enter city'
            />
          </div>
          {(formErrors.city || formErrors['address.city']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.city || formErrors['address.city']}
            </p>
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
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiNavigation className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              id='state'
              name='state' // This should match your backend field name
              value={formData.address.state}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors.state || formErrors['address.state']
                  ? 'border-red-300'
                  : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder='Enter state or province'
            />
          </div>
          {(formErrors.state || formErrors['address.state']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.state || formErrors['address.state']}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* ZIP/Postal Code */}
        <div>
          <label
            htmlFor='zipCode'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            ZIP/Postal Code *
          </label>
          <input
            type='text'
            id='zipCode'
            name='zipCode' // This should match your backend field name
            value={formData.address.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.zipCode || formErrors['address.zipCode']
                ? 'border-red-300'
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter ZIP code'
          />
          {(formErrors.zipCode || formErrors['address.zipCode']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.zipCode || formErrors['address.zipCode']}
            </p>
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
          <input
            type='text'
            id='country'
            name='country' // This should match your backend field name
            value={formData.address.country}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.country || formErrors['address.country']
                ? 'border-red-300'
                : 'border-gray-300'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='Enter country'
          />
          {(formErrors.country || formErrors['address.country']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.country || formErrors['address.country']}
            </p>
          )}
        </div>
      </div>

      {/* Address Preview */}
      {(formData.address.street || formData.address.city) && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-blue-900 mb-3 flex items-center gap-2'>
            <FiMapPin className='h-4 w-4' />
            Address Preview
          </h4>
          <div className='text-sm text-blue-800'>
            {formData.address.street && <div>{formData.address.street}</div>}
            {(formData.address.city || formData.address.state) && (
              <div>
                {formData.address.city}
                {formData.address.city && formData.address.state && ', '}
                {formData.address.state}
              </div>
            )}
            {(formData.address.zipCode || formData.address.country) && (
              <div>
                {formData.address.zipCode}
                {formData.address.zipCode && formData.address.country && ', '}
                {formData.address.country}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
        <h4 className='text-sm font-medium text-green-800 mb-2'>
          Address Guidelines
        </h4>
        <ul className='text-sm text-green-700 space-y-1'>
          <li>• Use the patient&apos;s current residential address</li>
          <li>• Include street number and name in the street address field</li>
          <li>
            • Ensure the ZIP/postal code format is correct for the country
          </li>
          <li>
            • Use full country name (e.g., &quot;Sri Lanka&quot; instead of
            &quot;SL&quot;)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatientAddressForm;
