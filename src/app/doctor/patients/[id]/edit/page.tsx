/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiAlertCircle } from 'react-icons/fi';
import { Patient, PatientFormData, patientToFormData } from '@/types/patient';
import { usePatientForm } from '@/hooks/usePatientForm';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

// Import components
import EditPatientHeader from '@/components/Patient/forms/EditPatientHeader';
import PersonalInfoForm from '@/components/Patient/forms/PersonalInfoForm';
import AddressForm from '@/components/Patient/forms/AddressForm';
import EmergencyContactForm from '@/components/Patient/forms/EmergencyContactForm';
import MedicalInfoForm from '@/components/Patient/forms/MedicalInfoForm';
import InsuranceForm from '@/components/Patient/forms/InsuranceForm';
import FormActions from '@/components/Patient/forms/FormActions';

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
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
  },
  medicalHistory: '',
  allergies: [],
  medications: [],
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: '',
  },
};

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { formData, setFormData, formErrors, validateForm, handleChange } =
    usePatientForm(initialFormData);

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/doctor/patients/${patientId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch patient');
      }

      const result = await response.json();

      if (result.success) {
        const patient: Patient = result.data;
        // Convert Patient to PatientFormData using the utility function
        const formData = patientToFormData(patient);
        setFormData(formData);
      } else {
        throw new Error(result.message || 'Failed to fetch patient');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/doctor/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update patient');
      }

      const result = await response.json();

      if (result.success) {
        router.push(`/doctor/patients/${patientId}`);
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

  const addAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, allergy],
    }));
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const addMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, medication],
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <EditPatientHeader
          onBack={() => router.push(`/doctor/patients/${patientId}`)}
        />

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='space-y-6'>
            <PersonalInfoForm
              formData={formData}
              formErrors={formErrors}
              onChange={handleChange}
            />

            <AddressForm formData={formData} onChange={handleChange} />

            <EmergencyContactForm formData={formData} onChange={handleChange} />

            <MedicalInfoForm
              formData={formData}
              onChange={handleChange}
              onAddAllergy={addAllergy}
              onRemoveAllergy={removeAllergy}
              onAddMedication={addMedication}
              onRemoveMedication={removeMedication}
            />

            <InsuranceForm formData={formData} onChange={handleChange} />

            <FormActions
              onCancel={() => router.push(`/doctor/patients/${patientId}`)}
              onSubmit={handleSubmit}
              saving={saving}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
