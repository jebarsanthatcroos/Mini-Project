'use client';

import React, { useState } from 'react';
import { FiAlertCircle, FiCalendar, FiInfo } from 'react-icons/fi';
import { IPatientFormData } from '@/app/(page)/Receptionist/patients/new/page';

interface PatientInsuranceFormProps {
  formData: IPatientFormData;
  formErrors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onDateChange: (value: string) => void;
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const PatientInsuranceForm: React.FC<PatientInsuranceFormProps> = ({
  formData,
  formErrors,
  onChange,
  onDateChange,
  onBlur,
}) => {
  const [showInsuranceInfo, setShowInsuranceInfo] = useState(false);

  // Insurance provider options
  const insuranceProviders = [
    { value: '', label: 'Select insurance provider' },
    { value: 'AIA', label: 'AIA Insurance' },
    { value: 'Ceylinco', label: 'Ceylinco Insurance' },
    { value: 'Allianz', label: 'Allianz Insurance' },
    { value: 'Janashakthi', label: 'Janashakthi Insurance' },
    { value: 'Union', label: 'Union Assurance' },
    { value: 'SLIC', label: 'Sri Lanka Insurance' },
    { value: 'HNB', label: 'HNB Assurance' },
    { value: 'BOC', label: 'BOC Insurance' },
    { value: 'Commercial', label: 'Commercial Insurance' },
    { value: 'Aetna', label: 'Aetna International' },
    { value: 'Cigna', label: 'Cigna Global' },
    { value: 'Bupa', label: 'Bupa Global' },
    { value: 'BlueCross', label: 'Blue Cross Blue Shield' },
    { value: 'UnitedHealth', label: 'UnitedHealthcare' },
    { value: 'Medicare', label: 'Medicare' },
    { value: 'Medicaid', label: 'Medicaid' },
    { value: 'other', label: 'Other Provider' },
  ];

  // Insurance types
  const insuranceTypes = [
    { value: 'health', label: 'Health Insurance' },
    { value: 'life', label: 'Life Insurance' },
    { value: 'travel', label: 'Travel Insurance' },
    { value: 'corporate', label: 'Corporate Insurance' },
    { value: 'government', label: 'Government Scheme' },
    { value: 'private', label: 'Private Insurance' },
    { value: 'other', label: 'Other' },
  ];

  // Coverage types
  const coverageTypes = [
    { value: 'basic', label: 'Basic Coverage' },
    { value: 'comprehensive', label: 'Comprehensive Coverage' },
    { value: 'premium', label: 'Premium Coverage' },
    { value: 'emergency', label: 'Emergency Only' },
    { value: 'inpatient', label: 'Inpatient Only' },
    { value: 'outpatient', label: 'Outpatient Only' },
    { value: 'dental', label: 'Dental Coverage' },
    { value: 'vision', label: 'Vision Coverage' },
    { value: 'other', label: 'Other Coverage' },
  ];

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
        name: `insurance.${e.target.name}`,
      },
    } as React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >;

    onBlur(syntheticEvent);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'insurance.validUntil',
      },
    } as React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >;

    onBlur(syntheticEvent);
  };

  // Format date for input field
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0];
  };

  // Calculate days until insurance expires
  const getDaysUntilExpiry = (): number | null => {
    if (!formData.insurance?.validUntil) return null;

    const expiryDate = new Date(formData.insurance.validUntil);
    const today = new Date();

    if (isNaN(expiryDate.getTime())) return null;

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  return (
    <div className='space-y-6'>
      {/* Insurance Information Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Insurance Information
          </h3>
          <p className='text-sm text-gray-600'>
            Provide insurance details for billing and claims processing
          </p>
        </div>
        <button
          type='button'
          onClick={() => setShowInsuranceInfo(!showInsuranceInfo)}
          className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800'
        >
          <FiInfo className='w-4 h-4' />
          {showInsuranceInfo ? 'Hide Info' : 'Show Info'}
        </button>
      </div>

      {/* Insurance Information Card */}
      {showInsuranceInfo && (
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-md'>
          <div className='flex items-start'>
            <div className='shrink-0'>
              <FiInfo className='w-5 h-5 text-blue-400 mt-0.5' />
            </div>
            <div className='ml-3'>
              <h4 className='text-sm font-medium text-blue-800'>
                Insurance Information Guidelines
              </h4>
              <ul className='mt-2 text-sm text-blue-700 list-disc list-inside space-y-1'>
                <li>Policy number is typically found on the insurance card</li>
                <li>Group number is for corporate or group insurance plans</li>
                <li>
                  Make sure the expiry date is valid for upcoming appointments
                </li>
                <li>Contact insurance provider for any verification needed</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Form Fields */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Insurance Provider */}
        <div>
          <label
            htmlFor='provider'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Insurance Provider
          </label>
          <select
            id='provider'
            name='provider'
            value={formData.insurance?.provider || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['insurance.provider'] || formErrors.provider
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
          >
            {insuranceProviders.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(formErrors['insurance.provider'] || formErrors.provider) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['insurance.provider'] || formErrors.provider}
              </span>
            </div>
          )}
        </div>

        {/* Insurance Type */}
        <div>
          <label
            htmlFor='insuranceType'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Insurance Type
          </label>
          <select
            id='insuranceType'
            name='insuranceType'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select insurance type</option>
            {insuranceTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Policy Number */}
        <div>
          <label
            htmlFor='policyNumber'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Policy Number
          </label>
          <input
            type='text'
            id='policyNumber'
            name='policyNumber'
            value={formData.insurance?.policyNumber || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['insurance.policyNumber'] || formErrors.policyNumber
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='POL-12345678'
          />
          {(formErrors['insurance.policyNumber'] ||
            formErrors.policyNumber) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['insurance.policyNumber'] ||
                  formErrors.policyNumber}
              </span>
            </div>
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
          <input
            type='text'
            id='groupNumber'
            name='groupNumber'
            value={formData.insurance?.groupNumber || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['insurance.groupNumber'] || formErrors.groupNumber
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder='GRP-7890'
          />
          {(formErrors['insurance.groupNumber'] || formErrors.groupNumber) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['insurance.groupNumber'] || formErrors.groupNumber}
              </span>
            </div>
          )}
          <p className='mt-1 text-xs text-gray-500'>
            Usually for corporate or group insurance plans
          </p>
        </div>

        {/* Valid Until Date */}
        <div>
          <label
            htmlFor='validUntil'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Valid Until
          </label>
          <div className='relative'>
            <input
              type='date'
              id='validUntil'
              name='validUntil'
              value={formatDateForInput(formData.insurance?.validUntil)}
              onChange={handleDateChange}
              onBlur={handleDateBlur}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors['insurance.validUntil'] || formErrors.validUntil
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              }`}
            />
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <FiCalendar className='h-5 w-5 text-gray-400' />
            </div>
          </div>
          {(formErrors['insurance.validUntil'] || formErrors.validUntil) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['insurance.validUntil'] || formErrors.validUntil}
              </span>
            </div>
          )}

          {/* Expiry Status Indicator */}
          {daysUntilExpiry !== null && (
            <div className='mt-2'>
              {isExpired ? (
                <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                  Expired {Math.abs(daysUntilExpiry)} days ago
                </div>
              ) : isExpiringSoon ? (
                <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                  Expires in {daysUntilExpiry} days
                </div>
              ) : (
                <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  Valid for {daysUntilExpiry} more days
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coverage Type */}
        <div>
          <label
            htmlFor='coverageType'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Coverage Type
          </label>
          <select
            id='coverageType'
            name='coverageType'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select coverage type</option>
            {coverageTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Insurance Card Holder Information */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <h4 className='text-sm font-medium text-gray-900 mb-4'>
          Card Holder Information
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='cardHolderName'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Card Holder Name
            </label>
            <input
              type='text'
              id='cardHolderName'
              name='cardHolderName'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='As shown on insurance card'
            />
          </div>

          <div>
            <label
              htmlFor='cardHolderRelationship'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Relationship to Patient
            </label>
            <select
              id='cardHolderRelationship'
              name='cardHolderRelationship'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select relationship</option>
              <option value='self'>Self</option>
              <option value='spouse'>Spouse</option>
              <option value='parent'>Parent</option>
              <option value='child'>Child</option>
              <option value='employer'>Employer</option>
              <option value='other'>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className='mt-6'>
        <label
          htmlFor='insuranceNotes'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Insurance Notes (Optional)
        </label>
        <textarea
          id='insuranceNotes'
          name='insuranceNotes'
          rows={3}
          className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          placeholder='Any special instructions, limitations, or additional coverage information...'
        />
        <p className='mt-1 text-xs text-gray-500'>
          Add notes about co-pay amounts, special authorizations, or claim
          procedures
        </p>
      </div>

      {/* Upload Insurance Card (Optional) */}
      <div className='mt-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Upload Insurance Card (Optional)
        </label>
        <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
          <div className='space-y-1 text-center'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              stroke='currentColor'
              fill='none'
              viewBox='0 0 48 48'
              aria-hidden='true'
            >
              <path
                d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <div className='flex text-sm text-gray-600'>
              <label
                htmlFor='file-upload'
                className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
              >
                <span>Upload a file</span>
                <input
                  id='file-upload'
                  name='file-upload'
                  type='file'
                  className='sr-only'
                  accept='.jpg,.jpeg,.png,.pdf'
                />
              </label>
              <p className='pl-1'>or drag and drop</p>
            </div>
            <p className='text-xs text-gray-500'>PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* No Insurance Option */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='noInsurance'
            name='noInsurance'
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
          <label
            htmlFor='noInsurance'
            className='ml-2 block text-sm text-gray-900'
          >
            Patient has no insurance coverage
          </label>
        </div>
        <p className='mt-1 text-xs text-gray-500'>
          Check this if the patient is paying out-of-pocket or using cash
          payments
        </p>
      </div>
    </div>
  );
};

export default PatientInsuranceForm;
