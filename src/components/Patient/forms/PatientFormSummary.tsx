'use client';

import React from 'react';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiHeart,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';
import { IPatientFormData } from '@/app/(page)/patients/new/page';

interface PatientFormSummaryProps {
  formData: IPatientFormData;
}

const PatientFormSummary: React.FC<PatientFormSummaryProps> = ({
  formData,
}) => {
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Calculate BMI
  const calculateBMI = (): number | null => {
    if (!formData.height || !formData.weight) return null;

    const heightInMeters = formData.height / 100;
    return parseFloat(
      (formData.weight / (heightInMeters * heightInMeters)).toFixed(1)
    );
  };

  // Get BMI category
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not provided';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get gender display text
  const getGenderDisplay = (): string => {
    switch (formData.gender) {
      case 'MALE':
        return 'Male';
      case 'FEMALE':
        return 'Female';
      case 'OTHER':
        return 'Other';
      default:
        return 'Not specified';
    }
  };

  // Get blood type display
  const getBloodTypeDisplay = (): string => {
    if (!formData.bloodType) return 'Not provided';
    return formData.bloodType;
  };

  // Get marital status display
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getMaritalStatusDisplay = (): string => {
    if (!formData.maritalStatus) return 'Not provided';

    switch (formData.maritalStatus) {
      case 'SINGLE':
        return 'Single';
      case 'MARRIED':
        return 'Married';
      case 'DIVORCED':
        return 'Divorced';
      case 'WIDOWED':
        return 'Widowed';
      default:
        return formData.maritalStatus;
    }
  };

  // Get insurance status
  const getInsuranceStatus = (): { hasInsurance: boolean; status: string } => {
    if (!formData.insurance)
      return { hasInsurance: false, status: 'No insurance' };

    const hasProvider = !!formData.insurance.provider;
    const hasPolicy = !!formData.insurance.policyNumber;

    if (hasProvider || hasPolicy) {
      return { hasInsurance: true, status: 'Insured' };
    }

    return { hasInsurance: false, status: 'No insurance' };
  };

  // Check if insurance is valid
  const isInsuranceValid = (): boolean => {
    if (!formData.insurance?.validUntil) return false;

    const expiryDate = new Date(formData.insurance.validUntil);
    const today = new Date();

    return !isNaN(expiryDate.getTime()) && expiryDate >= today;
  };

  const age = calculateAge(formData.dateOfBirth);
  const bmi = calculateBMI();
  const insuranceStatus = getInsuranceStatus();
  const insuranceValid = isInsuranceValid();

  // Check if basic info is complete
  const isBasicInfoComplete = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.nic &&
      formData.phone &&
      formData.dateOfBirth &&
      formData.gender
    );
  };

  // Count completed sections
  const getCompletionStats = () => {
    const sections = {
      basic: isBasicInfoComplete(),
      address:
        formData.address?.street &&
        formData.address?.city &&
        formData.address?.country,
      emergency:
        formData.emergencyContact?.name &&
        formData.emergencyContact?.phone &&
        formData.emergencyContact?.relationship,
      medical:
        formData.medicalHistory ||
        (formData.allergies && formData.allergies.length > 0) ||
        (formData.medications && formData.medications.length > 0),
      insurance: insuranceStatus.hasInsurance,
    };

    const completed = Object.values(sections).filter(Boolean).length;
    const total = Object.keys(sections).length;

    return { completed, total, sections };
  };

  const completionStats = getCompletionStats();

  return (
    <div className='space-y-4'>
      {/* Completion Progress */}
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-1'>
          <span className='text-sm font-medium text-gray-700'>
            Form Completion
          </span>
          <span className='text-sm text-gray-500'>
            {completionStats.completed}/{completionStats.total} sections
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-green-600 h-2 rounded-full transition-all duration-300'
            style={{
              width: `${(completionStats.completed / completionStats.total) * 100}%`,
            }}
          ></div>
        </div>
        <div className='mt-2 grid grid-cols-5 gap-1'>
          {Object.entries(completionStats.sections).map(([key, completed]) => (
            <div
              key={key}
              className={`h-1 rounded-sm ${
                completed ? 'bg-green-500' : 'bg-gray-300'
              }`}
              title={`${key.charAt(0).toUpperCase() + key.slice(1)} section: ${
                completed ? 'Complete' : 'Incomplete'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Patient Summary Card */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm font-semibold text-gray-900'>
            Patient Summary
          </h4>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              completionStats.completed === completionStats.total
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {completionStats.completed === completionStats.total
              ? 'Complete'
              : `${completionStats.completed}/${completionStats.total} sections`}
          </div>
        </div>

        <div className='space-y-3'>
          {/* Basic Information */}
          <div className='space-y-2'>
            <div className='flex items-center text-gray-600'>
              <FiUser className='w-4 h-4 mr-2 shrink-0' />
              <span className='text-sm truncate'>
                {formData.firstName || formData.lastName
                  ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
                  : 'No name provided'}
              </span>
            </div>

            {formData.nic && (
              <div className='flex items-center text-gray-600'>
                <span className='text-xs font-medium bg-gray-200 px-2 py-0.5 rounded mr-2'>
                  NIC
                </span>
                <span className='text-sm'>{formData.nic}</span>
              </div>
            )}

            {formData.dateOfBirth && (
              <div className='flex items-center text-gray-600'>
                <FiCalendar className='w-4 h-4 mr-2 shrink-0' />
                <span className='text-sm'>
                  {formatDate(formData.dateOfBirth)}
                  {age !== null && ` (${age} years)`}
                </span>
              </div>
            )}

            <div className='flex items-center text-gray-600'>
              <span className='text-xs font-medium bg-gray-200 px-2 py-0.5 rounded mr-2'>
                Gender
              </span>
              <span className='text-sm'>{getGenderDisplay()}</span>
            </div>
          </div>

          {/* Contact Information */}
          {(formData.phone || formData.email) && (
            <div className='pt-2 border-t border-gray-200'>
              <h5 className='text-xs font-medium text-gray-500 mb-2'>
                Contact
              </h5>
              <div className='space-y-1'>
                {formData.phone && (
                  <div className='flex items-center text-gray-600'>
                    <FiPhone className='w-4 h-4 mr-2 shrink-0' />
                    <span className='text-sm truncate'>{formData.phone}</span>
                  </div>
                )}
                {formData.email && (
                  <div className='flex items-center text-gray-600'>
                    <FiMail className='w-4 h-4 mr-2 shrink-0' />
                    <span className='text-sm truncate'>{formData.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address Information */}
          {formData.address?.city && (
            <div className='pt-2 border-t border-gray-200'>
              <h5 className='text-xs font-medium text-gray-500 mb-2'>
                Location
              </h5>
              <div className='flex items-center text-gray-600'>
                <FiMapPin className='w-4 h-4 mr-2 shrink-0' />
                <span className='text-sm truncate'>
                  {formData.address.city}
                  {formData.address.country && `, ${formData.address.country}`}
                </span>
              </div>
            </div>
          )}

          {/* Medical Summary */}
          {(formData.bloodType ||
            formData.height ||
            formData.weight ||
            bmi) && (
            <div className='pt-2 border-t border-gray-200'>
              <h5 className='text-xs font-medium text-gray-500 mb-2'>Health</h5>
              <div className='space-y-1'>
                {formData.bloodType && (
                  <div className='flex items-center text-gray-600'>
                    <FiHeart className='w-4 h-4 mr-2 shrink-0' />
                    <span className='text-sm'>
                      Blood type: {getBloodTypeDisplay()}
                    </span>
                  </div>
                )}
                {(formData.height || formData.weight) && (
                  <div className='flex items-center text-gray-600'>
                    <span className='text-xs font-medium bg-gray-200 px-2 py-0.5 rounded mr-2'>
                      BMI
                    </span>
                    <span className='text-sm'>
                      {bmi
                        ? `${bmi} (${getBMICategory(bmi)})`
                        : 'Incomplete data'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insurance Status */}
          <div className='pt-2 border-t border-gray-200'>
            <h5 className='text-xs font-medium text-gray-500 mb-2'>
              Insurance
            </h5>
            <div className='flex items-center text-gray-600'>
              <FiShield className='w-4 h-4 mr-2 shrink-0' />
              <div className='flex items-center'>
                <span className='text-sm mr-2'>{insuranceStatus.status}</span>
                {insuranceStatus.hasInsurance && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs ${
                      insuranceValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {insuranceValid ? 'Active' : 'Expired'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {formData.emergencyContact?.name && (
            <div className='pt-2 border-t border-gray-200'>
              <h5 className='text-xs font-medium text-gray-500 mb-2'>
                Emergency Contact
              </h5>
              <div className='space-y-1'>
                <div className='flex items-center text-gray-600'>
                  <span className='text-sm'>
                    {formData.emergencyContact.name}
                    {formData.emergencyContact.relationship &&
                      ` (${formData.emergencyContact.relationship})`}
                  </span>
                </div>
                {formData.emergencyContact.phone && (
                  <div className='text-xs text-gray-500 pl-4'>
                    {formData.emergencyContact.phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Missing Information Alerts */}
          {completionStats.completed < completionStats.total && (
            <div className='pt-2 border-t border-gray-200'>
              <div className='flex items-start text-yellow-600'>
                <FiAlertCircle className='w-4 h-4 mr-2 mt-0.5 shrink-0' />
                <div className='text-xs'>
                  <p className='font-medium'>Missing Information</p>
                  <ul className='mt-1 space-y-0.5'>
                    {!completionStats.sections.basic && (
                      <li>• Basic information incomplete</li>
                    )}
                    {!completionStats.sections.address && (
                      <li>• Address information incomplete</li>
                    )}
                    {!completionStats.sections.emergency && (
                      <li>• Emergency contact incomplete</li>
                    )}
                    {!completionStats.sections.medical && (
                      <li>• Medical information incomplete</li>
                    )}
                    {!completionStats.sections.insurance && (
                      <li>• Insurance information incomplete</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Medical Warnings */}
          {formData.allergies && formData.allergies.length > 0 && (
            <div className='pt-2 border-t border-gray-200'>
              <div className='flex items-start text-red-600'>
                <FiAlertCircle className='w-4 h-4 mr-2 mt-0.5 shrink-0' />
                <div className='text-xs'>
                  <p className='font-medium'>Allergies</p>
                  <p className='mt-0.5'>
                    {formData.allergies.slice(0, 3).join(', ')}
                    {formData.allergies.length > 3 && '...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className='pt-2 border-t border-gray-200'>
            <div className='text-xs text-gray-400'>
              Summary last updated:{' '}
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 gap-2'>
        <div className='bg-white border border-gray-200 rounded-md p-3 text-center'>
          <div className='text-lg font-semibold text-blue-600'>
            {formData.allergies?.length || 0}
          </div>
          <div className='text-xs text-gray-500 mt-1'>Allergies</div>
        </div>
        <div className='bg-white border border-gray-200 rounded-md p-3 text-center'>
          <div className='text-lg font-semibold text-green-600'>
            {formData.medications?.length || 0}
          </div>
          <div className='text-xs text-gray-500 mt-1'>Medications</div>
        </div>
      </div>

      {/* Patient Status */}
      <div className='bg-white border border-gray-200 rounded-md p-3'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-xs text-gray-500'>Patient Status</div>
            <div className='text-sm font-medium'>
              {formData.isActive !== false ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              formData.isActive !== false
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {formData.isActive !== false ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFormSummary;
