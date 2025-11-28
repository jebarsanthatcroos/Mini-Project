/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { FiAlertCircle } from 'react-icons/fi';

import { Patient, Appointment } from '@/types/patient';

import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

// Import components
import PatientHeader from '@/components/Patient/PatientHeader';
import PatientTabs from '@/components/Patient/PatientTabs';
import PersonalInfoCard from '@/components/Patient/PersonalInfoCard';
import EmergencyContactCard from '@/components/Patient/EmergencyContactCard';
import InsuranceCard from '@/components/Patient/InsuranceCard';
import AppointmentsTab from '@/components/Patient/AppointmentsTab';
import AllergiesCard from '@/components/Patient/AllergiesCard';
import MedicationsCard from '@/components/Patient/MedicationsCard';
import MedicalHistoryCard from '@/components/Patient/MedicalHistoryCard';
import QuickActionsCard from '@/components/Patient/QuickActionsCard';
import PatientMetadataCard from '@/components/Patient/PatientMetadataCard';

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'medical'
  >('overview');

  useEffect(() => {
    if (patientId) {
      fetchPatient();
      fetchAppointments();
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
        setPatient(result.data);
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

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `/api/doctor/patients/${patientId}/appointments`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAppointments(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleDeletePatient = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this patient? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/doctor/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      const result = await response.json();

      if (result.success) {
        router.push('/doctor/patients');
      } else {
        throw new Error(result.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient');
    }
  };

  const handleNewAppointment = () => {
    router.push(`/doctor/appointments/new?patientId=${patientId}`);
  };

  const handleEditPatient = () => {
    router.push(`/doctor/patients/${patientId}/edit`);
  };

  const handleViewAppointment = (appointmentId: string) => {
    router.push(`/doctor/appointments/${appointmentId}`);
  };

  if (loading) return <Loading />;
  if (error || !patient)
    return <ErrorComponent message={error || 'Patient not found'} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <PatientHeader
          patient={patient}
          onBack={() => router.push('/doctor/patients')}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onNewAppointment={handleNewAppointment}
        />

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <PatientTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                <PersonalInfoCard patient={patient} />
                <EmergencyContactCard patient={patient} />
                {patient.insurance && <InsuranceCard patient={patient} />}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <AppointmentsTab
                appointments={appointments}
                patient={patient}
                onNewAppointment={handleNewAppointment}
                onViewAppointment={handleViewAppointment}
              />
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <div className='space-y-6'>
                <AllergiesCard patient={patient} />
                <MedicationsCard patient={patient} />
                <MedicalHistoryCard patient={patient} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <QuickActionsCard
              onNewAppointment={handleNewAppointment}
              onEditPatient={handleEditPatient}
              onRefresh={fetchPatient}
            />

            <PatientMetadataCard
              patient={patient}
              appointments={appointments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
