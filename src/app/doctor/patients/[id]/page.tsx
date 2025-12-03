'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Patient } from '@/types/patient';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

// Import components
import PatientHeader from '@/components/Patient/layout/PatientHeader';
import PatientTabs from '@/components/Patient/layout/PatientTabs';
import PersonalInfoCard from '@/components/Patient/cards/PersonalInfoCard';
import EmergencyContactCard from '@/components/Patient/cards/EmergencyContactCard';
import InsuranceCard from '@/components/Patient/cards/InsuranceCard';
import AppointmentsTab from '@/components/Patient/tabs/AppointmentsTab';
import AllergiesCard from '@/components/Patient/cards/AllergiesCard';
import MedicationsCard from '@/components/Patient/cards/MedicationsCard';
import MedicalHistoryCard from '@/components/Patient/cards/EmergencyContactCard';
import QuickActionsCard from '@/components/Patient/cards/QuickActionsCard';
import PatientMetadataCard from '@/components/Patient/cards/PatientMetadataCard';

type ActiveTab = 'overview' | 'appointments' | 'medical' | 'billing';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/patients/${patientId}`);

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

  const handleEdit = () => {
    router.push(`/doctor/patients/${patientId}/edit`);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this patient? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Patient deleted successfully');
        setTimeout(() => {
          router.push('/doctor/patients?success=true');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateAppointment = () => {
    router.push(`/doctor/appointments/new?patientId=${patientId}`);
  };

  const handleRefresh = () => {
    fetchPatient();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;
  if (!patient) return <ErrorComponent message='Patient not found' />;

  return (
    <motion.div
      className='min-h-screen bg-gray-50'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PatientHeader
          patient={patient}
          onBack={() => router.push('/doctor/patients')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleting={deleting}
        />
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-green-800'>
              <FiCheckCircle className='w-5 h-5' />
              <span className='font-medium'>{success}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
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
        </motion.div>
      )}

      {/* Tabs Navigation */}
      <motion.div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6'
        variants={itemVariants}
      >
        <PatientTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          patient={patient}
        />
      </motion.div>

      {/* Tab Content */}
      <motion.div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
        variants={itemVariants}
      >
        {activeTab === 'overview' && (
          <motion.div
            className='grid grid-cols-1 lg:grid-cols-3 gap-6'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
          >
            {/* Left Column */}
            <div className='lg:col-span-2 space-y-6'>
              <motion.div variants={itemVariants}>
                <PersonalInfoCard patient={patient} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MedicalHistoryCard patient={patient} />
              </motion.div>
              <motion.div
                className='grid grid-cols-1 md:grid-cols-2 gap-6'
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <AllergiesCard patient={patient} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MedicationsCard patient={patient} />
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              <motion.div variants={itemVariants}>
                <QuickActionsCard
                  patient={patient}
                  onCreateAppointment={handleCreateAppointment}
                  onEditPatient={handleEdit}
                  onRefresh={handleRefresh}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <EmergencyContactCard patient={patient} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InsuranceCard patient={patient} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <PatientMetadataCard patient={patient} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AppointmentsTab patientId={patientId} />
          </motion.div>
        )}

        {activeTab === 'medical' && (
          <motion.div
            className='grid grid-cols-1 lg:grid-cols-3 gap-6'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
          >
            {/* Left Column */}
            <div className='lg:col-span-2 space-y-6'>
              <motion.div variants={itemVariants}>
                <MedicalHistoryCard patient={patient} />
              </motion.div>
              <motion.div
                className='grid grid-cols-1 md:grid-cols-2 gap-6'
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <AllergiesCard patient={patient} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MedicationsCard patient={patient} />
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              <motion.div variants={itemVariants}>
                <InsuranceCard patient={patient} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <PatientMetadataCard patient={patient} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='text-center py-12'>
                <div className='mx-auto h-12 w-12 text-gray-400'>
                  <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                    />
                  </svg>
                </div>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  Billing Information
                </h3>
                <p className='mt-2 text-sm text-gray-500'>
                  Billing features are coming soon. This section will include
                  insurance claims, payment history, and invoices.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
