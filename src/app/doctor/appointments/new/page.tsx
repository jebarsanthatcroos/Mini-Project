'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle } from 'react-icons/fi';

// Components
import PageHeader from '@/components/Doctor/appointments/PageHeader';
import PatientSelection from '@/components/Doctor/appointments/PatientSelection';
import AppointmentDetails from '@/components/Doctor/appointments/AppointmentDetails';
import MedicalInformation from '@/components/Doctor/appointments/MedicalInformation';
import AppointmentSummary from '@/components/Doctor/appointments/AppointmentSummary';
import FormActions from '@/components/Doctor/appointments/FormActions';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

// Types
import { Patient, AppointmentFormData } from '@/types/appointment';

export default function NewAppointmentPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<AppointmentFormData>({
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
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        patient =>
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients');

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const result = await response.json();

      if (result.success) {
        setPatients(result.data);
        setFilteredPatients(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/doctor/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      const result = await response.json();

      if (result.success) {
        router.push('/doctor/appointments');
      } else {
        throw new Error(result.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create appointment'
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
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
  };

  const getSelectedPatient = () => {
    return patients.find(patient => patient._id === formData.patientId);
  };

  const calculateAge = (dateOfBirth: Date) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <PageHeader
          onBack={() => router.push('/doctor/appointments')}
          title='New Appointment'
          subtitle='Schedule a new appointment with a patient'
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
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-'>
              <PatientSelection
                patients={patients}
                filteredPatients={filteredPatients}
                searchTerm={searchTerm}
                showPatientDropdown={showPatientDropdown}
                selectedPatientId={formData.patientId}
                formErrors={formErrors}
                onSearchChange={setSearchTerm}
                onShowDropdown={setShowPatientDropdown}
                onPatientSelect={handlePatientSelect}
                calculateAge={calculateAge}
                getSelectedPatient={getSelectedPatient}
              />

              <AppointmentDetails
                formData={formData}
                formErrors={formErrors}
                onChange={handleChange}
                getMinDate={getMinDate}
              />

              <MedicalInformation
                formData={formData}
                formErrors={formErrors}
                onChange={handleChange}
              />
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              <AppointmentSummary formData={formData} />

              <FormActions
                saving={saving}
                onCancel={() => router.push('/doctor/appointments')}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
