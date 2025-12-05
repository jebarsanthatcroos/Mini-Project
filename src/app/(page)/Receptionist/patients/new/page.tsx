/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import NewPatientHeader from '@/components//Patient/NewPatientHeader';
import PatientBasicInfoForm from '@/components/Patient/forms/PatientBasicInfoForm';
import PatientAddressForm from '@/components/Patient/forms/AddressForm';
import PatientEmergencyContactForm from '@/components/Patient/forms/EmergencyContactForm';
import PatientMedicalInfoForm from '@/components/Patient/forms/PatientMedicalInfoForm';
import PatientInsuranceForm from '@/components/Patient/forms/PatientInsuranceForm';
import PatientFormActions from '@/components/Patient/forms/PatientFormActions';
import PatientFormSummary from '@/components/Patient/forms/PatientFormSummary';
import { validatePatientForm, validateField } from '@/validation/patientSchema';

// Define interfaces based on your IPatient structure
export interface IAddress {
  street: string;
  state: string;
  city: string;
  zipCode?: string;
  country: string;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface IInsurance {
  provider?: string;
  policyNumber?: string;
  groupNumber?: string;
  validUntil?: Date;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

export interface IPatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  dateOfBirth: string; // Using string for form input, will convert to Date for API
  gender: Gender;
  address?: IAddress;
  emergencyContact?: IEmergencyContact;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  insurance?: IInsurance;
  bloodType?: BloodType;
  height?: number;
  weight?: number;
  isActive?: boolean;
  maritalStatus?: MaritalStatus;
  occupation?: string;
  preferredLanguage?: string;
  lastVisit?: string; // Using string for form input
}

const initialAddress: IAddress = {
  street: '',
  state: '',
  city: '',
  zipCode: '',
  country: '',
};

const initialEmergencyContact: IEmergencyContact = {
  name: '',
  phone: '',
  relationship: '',
  email: '',
};

const initialInsurance: IInsurance = {
  provider: '',
  policyNumber: '',
  groupNumber: '',
  validUntil: new Date(),
};

const initialFormData: IPatientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nic: '',
  dateOfBirth: '',
  gender: 'OTHER',
  address: initialAddress,
  emergencyContact: initialEmergencyContact,
  medicalHistory: '',
  allergies: [],
  medications: [],
  insurance: initialInsurance,
  bloodType: undefined,
  height: undefined,
  weight: undefined,
  isActive: true,
  maritalStatus: undefined,
  occupation: '',
  preferredLanguage: '',
  lastVisit: '',
};

type FormBlurEvent = React.FocusEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<IPatientFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('basic');

  const checkExistingPatient = async (
    email: string,
    nic: string
  ): Promise<{ exists: boolean; field?: string; message?: string }> => {
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
      return { exists: false, message: 'Error checking patient existence' };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ensureValidFormData = (
    data: Partial<IPatientFormData>
  ): IPatientFormData => {
    return {
      ...initialFormData,
      ...data,
      address: {
        ...initialAddress,
        ...(data.address || {}),
      },
      emergencyContact: {
        ...initialEmergencyContact,
        ...(data.emergencyContact || {}),
      },
      insurance: {
        ...initialInsurance,
        ...(data.insurance || {}),
        validUntil:
          data.insurance?.validUntil instanceof Date
            ? data.insurance.validUntil
            : initialInsurance.validUntil || new Date(),
      },
      allergies: data.allergies || [],
      medications: data.medications || [],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationResult = validatePatientForm(formData);

    if (!validationResult.success) {
      const errors = validationResult.errors || {};
      setFormErrors(errors);
      setError('Please fix the form errors before submitting.');

      // Scroll to first error
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

    // Check for existing patient
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
      // Prepare data for API
      const apiData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || undefined,
        lastVisit: formData.lastVisit || undefined,
        address: formData.address?.street ? formData.address : undefined,
        emergencyContact: formData.emergencyContact?.name
          ? formData.emergencyContact
          : undefined,
        insurance: formData.insurance?.provider
          ? formData.insurance
          : undefined,
        medicalHistory: formData.medicalHistory || undefined,
        allergies: formData.allergies?.length ? formData.allergies : undefined,
        medications: formData.medications?.length
          ? formData.medications
          : undefined,
        bloodType: formData.bloodType || undefined,
        height: formData.height || undefined,
        weight: formData.weight || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        occupation: formData.occupation || undefined,
        preferredLanguage: formData.preferredLanguage || undefined,
      };

      console.log('Sending data to API:', apiData);

      const response = await fetch('/api/patients/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.field) {
          setFormErrors(prev => ({
            ...prev,
            [result.field.toLowerCase()]: result.message,
          }));
          setError(result.message || 'Failed to create patient');
        } else {
          throw new Error(result.message || 'Failed to create patient');
        }
        return;
      }

      if (result.success) {
        setSuccess('Patient created successfully!');
        setFormErrors({});
        setTimeout(() => {
          router.push('/Receptionist/patients?success=true');
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

    // Handle nested fields
    if (name.includes('.')) {
      const [section, field] = name.split('.') as [
        keyof IPatientFormData,
        string,
      ];

      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: type === 'number' && value !== '' ? Number(value) : value,
        },
      }));
    } else {
      // Handle regular fields

      let processedValue: any = value;

      if (type === 'number') {
        processedValue = value === '' ? undefined : Number(value);
      } else if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      }

      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: FormBlurEvent) => {
    const { name, value } = e.target;

    if (
      !value &&
      !['gender', 'email', 'nic', 'phone', 'bloodType'].includes(name)
    ) {
      return;
    }

    const result = validateField(name, value);
    if (!result.valid && result.error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: result.error!,
      }));
    } else {
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
    value: string | number | Date
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear errors for nested field
    const errorKey = `${section}.${field}`;
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  };

  const handleInsuranceDateChange = (value: string) => {
    const dateValue = value ? new Date(value) : new Date();
    handleNestedChange('insurance', 'validUntil', dateValue);
  };

  const handleArrayChange = (
    field: 'allergies' | 'medications',
    value: string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

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
      router.push('/Receptionist/patients');
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
        'maritalStatus',
        'occupation',
        'preferredLanguage',
      ],
      address: ['street', 'city', 'state', 'zipCode', 'country'],
      emergency: ['name', 'phone', 'relationship', 'email'],
      medical: [
        'medicalHistory',
        'allergies',
        'medications',
        'bloodType',
        'height',
        'weight',
        'lastVisit',
      ],
      insurance: ['provider', 'policyNumber', 'groupNumber', 'validUntil'],
    };

    const fields = sectionFields[sectionId] || [];

    return fields.filter(field => {
      // Check for direct field errors
      if (formErrors[field]) return true;

      // Check for nested field errors
      if (sectionId === 'address' && formErrors[`address.${field}`])
        return true;
      if (sectionId === 'emergency' && formErrors[`emergencyContact.${field}`])
        return true;
      if (sectionId === 'insurance' && formErrors[`insurance.${field}`])
        return true;

      return false;
    }).length;
  };

  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <NewPatientHeader
          onBack={() => router.push('/Receptionist/patients')}
        />

        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-green-800'>
              <FiCheckCircle className='w-5 h-5' />
              <span className='font-medium'>{success}</span>
            </div>
          </div>
        )}

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
                      onBlur={handleBlur}
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
