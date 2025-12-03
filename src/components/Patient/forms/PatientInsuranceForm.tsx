// components/Patient/Form/PatientInsuranceForm.tsx
import React from 'react';
import { PatientFormData } from '@/types/patient';
import { FiCalendar, FiCreditCard, FiUsers, FiShield } from 'react-icons/fi';

interface PatientInsuranceFormProps {
  formData: PatientFormData;
  formErrors?: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onDateChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // Added onBlur prop
}

const PatientInsuranceForm: React.FC<PatientInsuranceFormProps> = ({
  formData,
  formErrors = {},
  onChange,
  onDateChange,
  onBlur,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Calculate if insurance is expiring soon (within 30 days)
  const isExpiringSoon = () => {
    const validUntil = new Date(formData.insurance.validUntil);
    const today = new Date();
    const timeDiff = validUntil.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  // Calculate if insurance is expired
  const isExpired = () => {
    const validUntil = new Date(formData.insurance.validUntil);
    const today = new Date();
    return validUntil < today;
  };

  const getInsuranceStatus = () => {
    if (isExpired())
      return {
        status: 'Expired',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    if (isExpiringSoon())
      return {
        status: 'Expiring Soon',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
    return {
      status: 'Active',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    };
  };

  const insuranceStatus = getInsuranceStatus();

  return (
    <div className='space-y-6'>
      {/* Insurance Status Banner */}
      {formData.insurance.provider && formData.insurance.validUntil && (
        <div
          className={`${insuranceStatus.bg} ${insuranceStatus.border} border rounded-lg p-4`}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <FiShield className={`h-5 w-5 ${insuranceStatus.color}`} />
              <div>
                <h4 className={`text-sm font-medium ${insuranceStatus.color}`}>
                  Insurance Status: {insuranceStatus.status}
                </h4>
                <p className='text-sm text-gray-600'>
                  {formData.insurance.provider} • Valid until{' '}
                  {formData.insurance.validUntil.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Provider */}
      <div>
        <label
          htmlFor='provider'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Insurance Provider *
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FiShield className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='text'
            id='provider'
            name='provider'
            value={formData.insurance.provider}
            onChange={handleChange}
            onBlur={handleInputBlur}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.provider || formErrors['insurance.provider']
                ? 'border-red-300'
                : 'border-gray-300'
            }`}
            placeholder='Enter insurance provider name'
          />
        </div>
        {(formErrors.provider || formErrors['insurance.provider']) && (
          <p className='mt-1 text-sm text-red-600'>
            {formErrors.provider || formErrors['insurance.provider']}
          </p>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Policy Number */}
        <div>
          <label
            htmlFor='policyNumber'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Policy Number *
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiCreditCard className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              id='policyNumber'
              name='policyNumber'
              value={formData.insurance.policyNumber}
              onChange={handleChange}
              onBlur={handleInputBlur}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors.policyNumber || formErrors['insurance.policyNumber']
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
              placeholder='Enter policy number'
            />
          </div>
          {(formErrors.policyNumber ||
            formErrors['insurance.policyNumber']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.policyNumber || formErrors['insurance.policyNumber']}
            </p>
          )}
        </div>

        {/* Group Number */}
        <div>
          <label
            htmlFor='groupNumber'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Group Number (Optional)
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiUsers className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              id='groupNumber'
              name='groupNumber'
              value={formData.insurance.groupNumber || ''}
              onChange={handleChange}
              onBlur={handleInputBlur}
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Enter group number'
            />
          </div>
          {(formErrors.groupNumber || formErrors['insurance.groupNumber']) && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.groupNumber || formErrors['insurance.groupNumber']}
            </p>
          )}
        </div>
      </div>

      {/* Valid Until Date */}
      <div>
        <label
          htmlFor='validUntil'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Insurance Valid Until *
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FiCalendar className='h-4 w-4 text-gray-400' />
          </div>
          <input
            type='date'
            id='validUntil'
            name='validUntil'
            value={formData.insurance.validUntil.toISOString().split('T')[0]}
            onChange={handleDateChange}
            onBlur={handleInputBlur}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.validUntil || formErrors['insurance.validUntil']
                ? 'border-red-300'
                : 'border-gray-300'
            }`}
          />
        </div>
        {(formErrors.validUntil || formErrors['insurance.validUntil']) && (
          <p className='mt-1 text-sm text-red-600'>
            {formErrors.validUntil || formErrors['insurance.validUntil']}
          </p>
        )}
        <p className='mt-1 text-xs text-gray-500'>
          Select the expiration date of the insurance policy
        </p>
      </div>

      {/* Insurance Information Preview */}
      {(formData.insurance.provider || formData.insurance.policyNumber) && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-blue-900 mb-3 flex items-center gap-2'>
            <FiShield className='h-4 w-4' />
            Insurance Information Preview
          </h4>
          <div className='space-y-2 text-sm'>
            {formData.insurance.provider && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Provider:</span>
                <span className='text-blue-900'>
                  {formData.insurance.provider}
                </span>
              </div>
            )}
            {formData.insurance.policyNumber && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Policy #:</span>
                <span className='text-blue-900'>
                  {formData.insurance.policyNumber}
                </span>
              </div>
            )}
            {formData.insurance.groupNumber && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Group #:</span>
                <span className='text-blue-900'>
                  {formData.insurance.groupNumber}
                </span>
              </div>
            )}
            {formData.insurance.validUntil && (
              <div className='flex justify-between'>
                <span className='text-blue-700 font-medium'>Valid Until:</span>
                <span className='text-blue-900'>
                  {formData.insurance.validUntil.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
        <h4 className='text-sm font-medium text-green-800 mb-2 flex items-center gap-2'>
          <FiShield className='h-4 w-4' />
          Insurance Information Guidelines
        </h4>
        <ul className='text-sm text-green-700 space-y-1'>
          <li>
            • Enter the exact policy number as shown on the insurance card
          </li>
          <li>
            • Include the group number if applicable for the insurance plan
          </li>
          <li>
            • Verify the expiration date matches the insurance documentation
          </li>
          <li>
            • Update this information when insurance is renewed or changed
          </li>
          <li>• Contact the insurance provider for any verification needs</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientInsuranceForm;
