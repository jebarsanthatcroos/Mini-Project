'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Patient, AppointmentFormData } from '@/types/appointment';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

import NewAppointmentHeader from '@/components/Appointment/NewAppointmentHeader';
import PatientSelection from '@/components/Appointment/PatientSelection';
import AppointmentDetailsForm from '@/components/Appointment/Form/AppointmentDetailsForm';
import MedicalInfoForm from '@/components/Appointment/Form/MedicalInfoForm';
import AppointmentSummary from '@/components/Appointment/AppointmentSummary';
import AppointmentFormActions from '@/components/Appointment/Form/AppointmentFormActions';
import HelpTips from '@/components/Appointment/HelpTips';

const initialFormData: AppointmentFormData = {
  patientId: '',
  appointmentDate: '',
  appointmentTime: '',
  duration: 30,
  type: 'CONSULTATION',
  status: 'SCHEDULED',
  reason: '',
  symptoms: '',
  diagnosis: '',
  prescription: '',
  notes: '',
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] =
    useState<AppointmentFormData>(initialFormData);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam === 'true') {
      setSuccess('Appointment created successfully!');

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess(null);
        // Remove success parameter from URL without page reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        window.history.replaceState({}, '', newUrl.toString());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        patient =>
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient.nic &&
            patient.nic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/patients?isActive=true&limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const result = await response.json();

      if (result.success) {
        setPatients(result.data || []);
        setFilteredPatients(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) {
      errors.patientId = 'Please select a patient';
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }

    if (!formData.appointmentTime) {
      errors.appointmentTime = 'Appointment time is required';
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason for visit is required';
    }

    if (!formData.type) {
      errors.type = 'Appointment type is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          appointmentDate: new Date(formData.appointmentDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      const result = await response.json();

      if (result.success) {
        // Redirect with success parameter
        router.push('/doctor/appointments?success=true');
      } else {
        throw new Error(result.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create appointment'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient._id,
    }));
    setSearchTerm(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);

    if (formErrors.patientId) {
      setFormErrors(prev => ({
        ...prev,
        patientId: '',
      }));
    }
  };

  const getSelectedPatient = () => {
    return patients.find(patient => patient._id === formData.patientId);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.patient-search-container')) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) return <Loading />;
  if (error && !patients.length) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <NewAppointmentHeader
          onBack={() => router.push('/doctor/appointments')}
        />

        {/* Success Message */}
        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-green-800'>
              <FiCheckCircle className='w-5 h-5' />
              <span className='font-medium'>{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className='mt-2 text-sm text-green-600 hover:text-green-800 underline'
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className='patient-search-container'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-6'>
              <PatientSelection
                formData={formData}
                patients={patients}
                filteredPatients={filteredPatients}
                searchTerm={searchTerm}
                showPatientDropdown={showPatientDropdown}
                formErrors={formErrors}
                onSearchChange={setSearchTerm}
                onPatientSelect={handlePatientSelect}
                onShowDropdown={setShowPatientDropdown}
                getSelectedPatient={getSelectedPatient}
              />

              <AppointmentDetailsForm
                formData={formData}
                formErrors={formErrors}
                onChange={handleChange}
              />

              <MedicalInfoForm
                formData={formData}
                formErrors={formErrors}
                onChange={handleChange}
              />
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              <AppointmentSummary
                formData={formData}
                selectedPatient={getSelectedPatient()}
              />

              <AppointmentFormActions
                onCancel={() => router.push('/doctor/appointments')}
                onSubmit={handleSubmit}
                saving={saving}
              />

              <HelpTips />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
