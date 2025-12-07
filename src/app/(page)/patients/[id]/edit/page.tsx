/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiSave,
  FiX,
} from 'react-icons/fi';
import PatientBasicInfoForm from '@/components/Patient/forms/PatientBasicInfoForm';
import PatientAddressForm from '@/components/Patient/forms/AddressForm';
import PatientEmergencyContactForm from '@/components/Patient/forms/EmergencyContactForm';
import PatientMedicalInfoForm from '@/components/Patient/forms/PatientMedicalInfoForm';
import PatientInsuranceForm from '@/components/Patient/forms/PatientInsuranceForm';
import PatientFormSummary from '@/components/Patient/forms/PatientFormSummary';
import { validatePatientForm, validateField } from '@/validation/patientSchema';
import { IPatientFormData } from '@/app/(page)/patients/new/page';

type FormBlurEvent = React.FocusEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export default function PatientEditPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id as string;

  const [formData, setFormData] = useState<IPatientFormData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [originalData, setOriginalData] = useState<IPatientFormData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }

        const result = await response.json();

        if (result.success && result.data) {
          const patientData = transformPatientData(result.data);
          setFormData(patientData);
          setOriginalData(patientData);
        } else {
          throw new Error(result.message || 'Failed to load patient');
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to load patient'
        );
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const transformPatientData = (data: any): IPatientFormData => {
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      nic: data.nic || '',
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: data.gender || 'OTHER',
      address: data.address || {
        street: '',
        state: '',
        city: '',
        zipCode: '',
        country: '',
      },
      emergencyContact: data.emergencyContact || {
        name: '',
        phone: '',
        relationship: '',
        email: '',
      },
      medicalHistory: data.medicalHistory || '',
      allergies: data.allergies || [],
      medications: data.medications || [],
      insurance: data.insurance || {
        provider: '',
        policyNumber: '',
        groupNumber: '',
        validUntil: new Date(),
      },
      bloodType: data.bloodType,
      height: data.height,
      weight: data.weight,
      isActive: data.isActive ?? true,
      maritalStatus: data.maritalStatus,
      occupation: data.occupation || '',
      preferredLanguage: data.preferredLanguage || '',
      lastVisit: data.lastVisit
        ? new Date(data.lastVisit).toISOString().split('T')[0]
        : '',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    const validationResult = validatePatientForm(formData);

    if (!validationResult.success) {
      const errors = validationResult.errors || {};
      setFormErrors(errors);
      setError('Please fix the form errors before saving.');

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

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
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

      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
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
          setError(result.message || 'Failed to update patient');
        } else {
          throw new Error(result.message || 'Failed to update patient');
        }
        return;
      }

      if (result.success) {
        setSuccess('Patient updated successfully!');
        setFormErrors({});
        setTimeout(() => {
          router.push(`/patients/${patientId}`);
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update patient'
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
    if (!formData) return;

    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [section, field] = name.split('.') as [
        keyof IPatientFormData,
        string,
      ];

      setFormData(prev =>
        prev
          ? {
              ...prev,
              [section]: {
                ...(prev[section] as any),
                [field]:
                  type === 'number' && value !== '' ? Number(value) : value,
              },
            }
          : null
      );
    } else {
      let processedValue: any = value;

      if (type === 'number') {
        processedValue = value === '' ? undefined : Number(value);
      } else if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      }

      setFormData(prev =>
        prev
          ? {
              ...prev,
              [name]: processedValue,
            }
          : null
      );
    }

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
    setFormData(prev =>
      prev
        ? {
            ...prev,
            [section]: {
              ...prev[section],
              [field]: value,
            },
          }
        : null
    );

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
    setFormData(prev =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );

    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes and return to patient details?')) {
      router.push(`/patients/${patientId}`);
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
      if (formErrors[field]) return true;
      if (sectionId === 'address' && formErrors[`address.${field}`])
        return true;
      if (sectionId === 'emergency' && formErrors[`emergencyContact.${field}`])
        return true;
      if (sectionId === 'insurance' && formErrors[`insurance.${field}`])
        return true;
      return false;
    }).length;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <FiAlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
            Error Loading Patient
          </h2>
          <p className='text-gray-600 mb-6'>{error}</p>
          <button
            onClick={() => router.push('/patients')}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6'>
          <button
            onClick={() => router.push(`/patients/${patientId}`)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
          >
            <FiArrowLeft className='w-5 h-5' />
            <span>Back to Patient Details</span>
          </button>

          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Edit Patient: {formData.firstName} {formData.lastName}
              </h1>
              <p className='text-gray-600 mt-1'>
                Update patient information below
              </p>
            </div>

            <div className='flex gap-2'>
              <button
                onClick={handleCancel}
                className='flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300'
              >
                <FiX className='w-4 h-4' />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || hasErrors}
                className='flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FiSave className='w-4 h-4' />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

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
            {hasErrors && (
              <div className='mt-2 text-sm text-red-700'>
                Found {Object.keys(formErrors).length} validation error(s).
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
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Edit Sections
                </h3>
                <nav className='space-y-2'>
                  {sections.map(section => {
                    const errorCount = getSectionErrors(section.id);
                    return (
                      <button
                        key={section.id}
                        type='button'
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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

                <div className='mt-4 p-3 bg-amber-50 rounded-md border border-amber-200'>
                  <div className='text-sm text-amber-800'>
                    <strong>Edit Mode</strong>
                    <div className='mt-1'>
                      {hasErrors
                        ? `${Object.keys(formErrors).length} error(s) to fix`
                        : 'Ready to save'}
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
                    Update patient&apos;s {activeSection} information
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

                <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-between items-center'>
                  <p className='text-sm text-gray-600'>
                    * Required fields must be filled
                  </p>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={handleCancel}
                      className='px-4 py-2 text-gray-700 hover:text-gray-900'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={saving || hasErrors}
                      className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
