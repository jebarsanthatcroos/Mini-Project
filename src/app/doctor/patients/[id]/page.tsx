/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiRefreshCw,
  FiHeart,
  FiPlus,
  FiClock,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  reason: string;
}

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
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

  const calculateAge = (dateOfBirth: string) => {
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

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Male';
      case 'FEMALE':
        return 'Female';
      case 'OTHER':
        return 'Other';
      default:
        return gender;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentStatusText = (status: string) => {
    return status
      .toLowerCase()
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) return <Loading />;
  if (error || !patient)
    return <ErrorComponent message={error || 'Patient not found'} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push('/doctor/patients')}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
          >
            <FiArrowLeft className='w-5 h-5' />
            Back to Patients
          </button>

          <div className='flex justify-between items-start'>
            <div className='flex items-start gap-4'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                <FiUser className='w-8 h-8 text-blue-600' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className='text-gray-600 mt-1'>
                  Patient ID: {patient._id.slice(-8)} •{' '}
                  {calculateAge(patient.dateOfBirth)} years •{' '}
                  {getGenderText(patient.gender)}
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() =>
                  router.push(
                    `/doctor/appointments/new?patientId=${patient._id}`
                  )
                }
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FiPlus className='w-4 h-4' />
                New Appointment
              </button>
              <button
                onClick={() =>
                  router.push(`/doctor/patients/${patientId}/edit`)
                }
                className='flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
              >
                <FiEdit className='w-4 h-4' />
                Edit
              </button>
              <button
                onClick={handleDeletePatient}
                className='flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors'
              >
                <FiTrash2 className='w-4 h-4' />
                Delete
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='mb-6 border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'overview', name: 'Overview', icon: FiUser },
              { id: 'appointments', name: 'Appointments', icon: FiCalendar },
              { id: 'medical', name: 'Medical', icon: FiHeart },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
                >
                  <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FiUser className='w-5 h-5 text-blue-600' />
                    Personal Information
                  </h2>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Basic Details
                      </label>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Full Name:</span>
                          <span className='text-gray-900 font-medium'>
                            {patient.firstName} {patient.lastName}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Date of Birth:</span>
                          <span className='text-gray-900'>
                            {formatDate(patient.dateOfBirth)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Age:</span>
                          <span className='text-gray-900'>
                            {calculateAge(patient.dateOfBirth)} years
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Gender:</span>
                          <span className='text-gray-900 capitalize'>
                            {getGenderText(patient.gender).toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Contact Information
                      </label>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2 text-gray-900'>
                          <FiMail className='w-4 h-4 text-gray-400' />
                          <span>{patient.email}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-900'>
                          <FiPhone className='w-4 h-4 text-gray-400' />
                          <span>{patient.phone}</span>
                        </div>
                        {patient.address && (
                          <div className='flex items-start gap-2 text-gray-900'>
                            <FiMapPin className='w-4 h-4 text-gray-400 mt-0.5' />
                            <div>
                              <div>{patient.address.street}</div>
                              <div>
                                {patient.address.city}, {patient.address.state}{' '}
                                {patient.address.zipCode}
                              </div>
                              <div>{patient.address.country}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Emergency Contact */}
                {patient.emergencyContact && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
                  >
                    <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <FiAlertCircle className='w-5 h-5 text-red-600' />
                      Emergency Contact
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <div className='flex justify-between mb-2'>
                          <span className='text-gray-500'>Name:</span>
                          <span className='text-gray-900 font-medium'>
                            {patient.emergencyContact.name}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Relationship:</span>
                          <span className='text-gray-900 capitalize'>
                            {patient.emergencyContact.relationship.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className='flex items-center gap-2 text-gray-900'>
                          <FiPhone className='w-4 h-4 text-gray-400' />
                          <span>{patient.emergencyContact.phone}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Insurance Information */}
                {patient.insurance && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
                  >
                    <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                      Insurance Information
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <div className='flex justify-between mb-2'>
                          <span className='text-gray-500'>Provider:</span>
                          <span className='text-gray-900 font-medium'>
                            {patient.insurance.provider}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Policy Number:</span>
                          <span className='text-gray-900 font-mono'>
                            {patient.insurance.policyNumber}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Group Number:</span>
                          <span className='text-gray-900 font-mono'>
                            {patient.insurance.groupNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
              >
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                    <FiCalendar className='w-5 h-5 text-blue-600' />
                    Appointment History
                  </h2>
                  <button
                    onClick={() =>
                      router.push(
                        `/doctor/appointments/new?patientId=${patient._id}`
                      )
                    }
                    className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <FiPlus className='w-4 h-4' />
                    New Appointment
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <div className='text-center py-8'>
                    <FiCalendar className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      No appointments found
                    </h3>
                    <p className='text-gray-500 mb-4'>
                      This patient doesn&apos;t have any appointments scheduled
                      yet.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {appointments.map((appointment, index) => (
                      <motion.div
                        key={appointment._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                      >
                        <div className='flex justify-between items-start'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}
                              >
                                {getAppointmentStatusText(appointment.status)}
                              </span>
                              <span className='text-sm text-gray-500 capitalize'>
                                {appointment.type
                                  .toLowerCase()
                                  .replace('_', ' ')}
                              </span>
                            </div>
                            <h4 className='font-medium text-gray-900 mb-1'>
                              {appointment.reason}
                            </h4>
                            <div className='flex items-center gap-4 text-sm text-gray-500'>
                              <div className='flex items-center gap-1'>
                                <FiCalendar className='w-4 h-4' />
                                {formatDate(appointment.appointmentDate)}
                              </div>
                              <div className='flex items-center gap-1'>
                                <FiClock className='w-4 h-4' />
                                {formatTime(appointment.appointmentTime)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              router.push(
                                `/doctor/appointments/${appointment._id}`
                              )
                            }
                            className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                          >
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <div className='space-y-6'>
                {/* Allergies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
                >
                  <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FiAlertCircle className='w-5 h-5 text-red-600' />
                    Allergies
                  </h2>

                  {patient.allergies && patient.allergies.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {patient.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200'
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-500'>No allergies recorded</p>
                  )}
                </motion.div>

                {/* Medications */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
                >
                  <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FiPlus className='w-5 h-5 text-blue-600' />
                    Current Medications
                  </h2>

                  {patient.medications && patient.medications.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {patient.medications.map((medication, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200'
                        >
                          {medication}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-500'>
                      No current medications recorded
                    </p>
                  )}
                </motion.div>

                {/* Medical History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
                >
                  <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <FiHeart className='w-5 h-5 text-green-600' />
                    Medical History
                  </h2>

                  {patient.medicalHistory ? (
                    <div className='prose max-w-none'>
                      <p className='text-gray-900 whitespace-pre-wrap'>
                        {patient.medicalHistory}
                      </p>
                    </div>
                  ) : (
                    <p className='text-gray-500'>No medical history recorded</p>
                  )}
                </motion.div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h2>

              <div className='space-y-3'>
                <button
                  onClick={() =>
                    router.push(
                      `/doctor/appointments/new?patientId=${patient._id}`
                    )
                  }
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <FiPlus className='w-4 h-4' />
                  New Appointment
                </button>

                <button
                  onClick={() =>
                    router.push(`/doctor/patients/${patientId}/edit`)
                  }
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
                >
                  <FiEdit className='w-4 h-4' />
                  Edit Patient
                </button>

                <button
                  onClick={fetchPatient}
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <FiRefreshCw className='w-4 h-4' />
                  Refresh
                </button>
              </div>
            </motion.div>

            {/* Patient Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-gray-50 border border-gray-200 rounded-xl p-6'
            >
              <h3 className='font-semibold text-gray-900 mb-3'>
                Patient Details
              </h3>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Patient Since</span>
                  <span className='text-gray-900'>
                    {formatDate(patient.createdAt)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Last Updated</span>
                  <span className='text-gray-900'>
                    {formatDate(patient.updatedAt)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Patient ID</span>
                  <span className='text-gray-900 font-mono text-xs'>
                    {patient._id.slice(-8)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Total Appointments</span>
                  <span className='text-gray-900 font-medium'>
                    {appointments.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
