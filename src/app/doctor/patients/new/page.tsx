'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { PatientFormData } from '@/types/patient';
import NewPatientHeader from '@/components/Patient/NewPatientHeader';
import PatientBasicInfoForm from '@/components/Patient/forms/PatientBasicInfoForm';
import PatientAddressForm from '@/components/Patient/forms/AddressForm';
import PatientEmergencyContactForm from '@/components/Patient/forms/EmergencyContactForm';
import PatientMedicalInfoForm from '@/components/Patient/forms/PatientMedicalInfoForm';
import PatientInsuranceForm from '@/components/Patient/forms/PatientInsuranceForm';
import PatientFormActions from '@/components/Patient/forms/PatientFormActions';
import PatientFormSummary from '@/components/Patient/forms/PatientFormSummary';
import { validatePatientForm, validateField } from '@/validation/patientSchema';

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  nic: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'OTHER',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
    email: '',
  },
  medicalHistory: '',
  allergies: [],
  medications: [],
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: '',
    validUntil: new Date(),
  },
  bloodType: '',
  height: undefined,
  weight: undefined,
  isActive: true,
};
type FormBlurEvent = React.FocusEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('basic');

  const checkExistingPatient = async (
    email: string,
    nic: string
  ): Promise<{ exists: boolean; field?: string }> => {
    try {
      const response = await fetch(
        `/api/patients/check?email=${encodeURIComponent(email)}&nic=${encodeURIComponent(nic)}`
      );
      if (!response.ok) {
        throw new Error('Failed to check patient existence');
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking patient:', error);
      return { exists: false };
    }
  };

  // ✅ Ensure data has required address field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ensureValidFormData = (data: any): PatientFormData => {
    return {
      ...data,
      address: data.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      emergencyContact: data.emergencyContact || {
        name: '',
        phone: '',
        relationship: '',
        email: '',
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validatePatientForm(formData);

    if (!validationResult.success) {
      const errors = validationResult.errors || {};
      setFormErrors(errors);
      setError('Please fix the form errors before submitting.');
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    const checkResult = await checkExistingPatient(
      formData.email,
      formData.nic
    );
    if (checkResult.exists) {
      setError(
        `${checkResult.field} already exists! Please use a different ${checkResult.field?.toLowerCase()}.`
      );
      setFormErrors(prev => ({
        ...prev,
        [checkResult.field?.toLowerCase() === 'email' ? 'email' : 'nic']:
          `${checkResult.field} already exists`,
      }));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // ✅ Ensure the data has required fields before sending
      const validatedData = ensureValidFormData(validationResult.data);

      console.log('Sending data to API:', validatedData);
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.field) {
          setFormErrors(prev => ({
            ...prev,
            [errorData.field]: errorData.message,
          }));
          setError(`Patient with this ${errorData.field} already exists.`);
        } else {
          throw new Error(errorData.message || 'Failed to create patient');
        }
        return;
      }

      const result = await response.json();

      if (result.success || result.patient) {
        setSuccess('Patient created successfully!');
        setFormErrors({});
        setTimeout(() => {
          router.push('/doctor/patients?success=true');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to create patient');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create patient'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle number inputs
    if (type === 'number') {
      const numValue = value === '' ? undefined : Number(value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ✅ Updated to handle all input types including textarea
  const handleBlur = (e: FormBlurEvent) => {
    const { name, value } = e.target;

    // Skip validation for empty optional fields
    if (!value && !['gender', 'email', 'nic', 'phone'].includes(name)) {
      return;
    }

    // Validate individual field
    const result = validateField(name, value);
    if (!result.valid && result.error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: result.error!,
      }));
    } else {
      // Clear error if field is now valid
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (
    section: 'address' | 'emergencyContact' | 'insurance',
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear nested field errors
    const errorKey = `${section}.${field}`;
    if (formErrors[errorKey] || formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInsuranceDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        validUntil: new Date(value),
      },
    }));

    // Clear insurance date errors
    if (formErrors['insurance.validUntil']) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['insurance.validUntil'];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (
    field: 'allergies' | 'medications',
    value: string[]
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    // Clear array field errors
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel? Any unsaved changes will be lost.'
      )
    ) {
      router.push('/doctor/patients');
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'address', label: 'Address' },
    { id: 'emergency', label: 'Emergency Contact' },
    { id: 'medical', label: 'Medical Info' },
    { id: 'insurance', label: 'Insurance' },
  ];

  const getSectionErrors = (sectionId: string): number => {
    const sectionFields: Record<string, string[]> = {
      basic: [
        'firstName',
        'lastName',
        'nic',
        'email',
        'phone',
        'dateOfBirth',
        'gender',
      ],
      address: [
        'address.street',
        'address.city',
        'address.state',
        'address.zipCode',
        'address.country',
      ],
      emergency: [
        'emergencyContact.name',
        'emergencyContact.phone',
        'emergencyContact.relationship',
        'emergencyContact.email',
      ],
      medical: [
        'medicalHistory',
        'allergies',
        'medications',
        'bloodType',
        'height',
        'weight',
      ],
      insurance: [
        'insurance.provider',
        'insurance.policyNumber',
        'insurance.groupNumber',
        'insurance.validUntil',
      ],
    };

    const fields = sectionFields[sectionId] || [];
    return fields.filter(field => {
      return (
        formErrors[field] ||
        formErrors[field.split('.').pop() || ''] ||
        formErrors[field.replace('.', '_')]
      );
    }).length;
  };

  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <NewPatientHeader onBack={() => router.push('/doctor/patients')} />

        {/* Success Message */}
        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-green-800'>
              <FiCheckCircle className='w-5 h-5' />
              <span className='font-medium'>{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
            {Object.keys(formErrors).length > 0 && (
              <div className='mt-2 text-sm text-red-700'>
                Found {Object.keys(formErrors).length} validation error(s).
                Please check all fields.
              </div>
            )}
            <button
              onClick={() => {
                setError(null);
                setFormErrors({});
              }}
              className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Sidebar Navigation */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Patient Details
                </h3>
                <nav className='space-y-2'>
                  {sections.map(section => {
                    const errorCount = getSectionErrors(section.id);
                    return (
                      <button
                        key={section.id}
                        type='button'
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <span className='flex items-center justify-between'>
                          <span>{section.label}</span>
                          {errorCount > 0 && (
                            <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full'>
                              {errorCount}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <PatientFormSummary formData={formData} />

                {/* Form Status */}
                <div className='mt-4 p-3 bg-gray-50 rounded-md'>
                  <div className='text-sm text-gray-600'>
                    <div>
                      Fields with errors: {Object.keys(formErrors).length}
                    </div>
                    <div className='mt-1 text-xs'>
                      {hasErrors && 'Please fix all errors before submitting'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form Content */}
            <div className='lg:col-span-3'>
              <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='p-6 border-b border-gray-200'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {sections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <p className='text-gray-600 mt-1'>
                    Fill in the patient&apos;s {activeSection.replace('-', ' ')}{' '}
                    information
                  </p>
                </div>

                <div className='p-6'>
                  {activeSection === 'basic' && (
                    <PatientBasicInfoForm
                      formData={formData}
                      formErrors={formErrors}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}

                  {activeSection === 'address' && (
                    <PatientAddressForm
                      formData={formData}
                      formErrors={formErrors}
                      onChange={(field, value) =>
                        handleNestedChange('address', field, value)
                      }
                      onBlur={handleBlur}
                    />
                  )}

                  {activeSection === 'emergency' && (
                    <PatientEmergencyContactForm
                      formData={formData}
                      formErrors={formErrors}
                      onChange={(field, value) =>
                        handleNestedChange('emergencyContact', field, value)
                      }
                      onBlur={handleBlur}
                    />
                  )}

                  {activeSection === 'medical' && (
                    <PatientMedicalInfoForm
                      formData={formData}
                      formErrors={formErrors}
                      onChange={handleChange}
                      onArrayChange={handleArrayChange}
                      onBlur={handleBlur} // ✅ FIXED: Added missing onBlur prop
                    />
                  )}

                  {activeSection === 'insurance' && (
                    <PatientInsuranceForm
                      formData={formData}
                      formErrors={formErrors}
                      onChange={(field, value) =>
                        handleNestedChange('insurance', field, value)
                      }
                      onDateChange={handleInsuranceDateChange}
                      onBlur={handleBlur}
                    />
                  )}
                </div>

                {/* Form Actions */}
                <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg'>
                  <PatientFormActions
                    onCancel={handleCancel}
                    saving={saving}
                    currentSection={activeSection}
                    sections={sections}
                    onSectionChange={setActiveSection}
                    hasErrors={hasErrors}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
