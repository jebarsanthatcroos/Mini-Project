'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock as FiClockIcon,
  FiRefreshCw,
} from 'react-icons/fi';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

interface Appointment {
  _id: string;
  id: string;
  patientId: Patient;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'CHECKUP' | 'EMERGENCY' | 'OTHER';
  status:
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
  reason: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/doctor/appointments/${appointmentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch appointment');
      }

      const result = await response.json();

      if (result.success) {
        setAppointment(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch appointment');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(
        `/api/doctor/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const result = await response.json();

      if (result.success) {
        setAppointment(result.data);
      } else {
        throw new Error(result.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this appointment? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/doctor/appointments/${appointmentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      const result = await response.json();

      if (result.success) {
        router.push('/doctor/appointments');
      } else {
        throw new Error(result.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NO_SHOW':
        return 'No Show';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'Consultation';
      case 'FOLLOW_UP':
        return 'Follow-up';
      case 'CHECKUP':
        return 'Checkup';
      case 'EMERGENCY':
        return 'Emergency';
      case 'OTHER':
        return 'Other';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <FiAlertCircle className='mx-auto h-12 w-12 text-red-500 mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            {error || 'Appointment not found'}
          </h2>
          <button
            onClick={() => router.push('/doctor/appointments')}
            className='text-blue-600 hover:text-blue-700'
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-6'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push('/doctor/appointments')}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
          >
            <FiArrowLeft className='w-5 h-5' />
            Back to Appointments
          </button>

          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Appointment Details
              </h1>
              <p className='text-gray-600 mt-2'>
                {formatDate(appointment.appointmentDate)} at{' '}
                {formatTime(appointment.appointmentTime)}
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() =>
                  router.push(`/doctor/appointments/${appointmentId}/edit`)
                }
                className='flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
              >
                <FiEdit className='w-4 h-4' />
                Edit
              </button>
              <button
                onClick={handleDeleteAppointment}
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

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Appointment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                <FiCalendar className='w-5 h-5 text-blue-600' />
                Appointment Information
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date & Time
                  </label>
                  <div className='flex items-center gap-2 text-gray-900'>
                    <FiCalendar className='w-4 h-4 text-gray-400' />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className='flex items-center gap-2 text-gray-600 mt-1'>
                    <FiClock className='w-4 h-4 text-gray-400' />
                    <span>{formatTime(appointment.appointmentTime)}</span>
                    <span className='text-sm text-gray-500'>
                      ({appointment.duration} minutes)
                    </span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Type & Status
                  </label>
                  <div className='flex items-center gap-2 text-gray-900 mb-1'>
                    <FiFileText className='w-4 h-4 text-gray-400' />
                    <span>{getTypeText(appointment.type)}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                  >
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Reason for Visit
                  </label>
                  <p className='text-gray-900'>{appointment.reason}</p>
                </div>

                {appointment.symptoms && (
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Symptoms
                    </label>
                    <p className='text-gray-900'>{appointment.symptoms}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Medical Information */}
            {(appointment.diagnosis ||
              appointment.prescription ||
              appointment.notes) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiFileText className='w-5 h-5 text-green-600' />
                  Medical Information
                </h2>

                <div className='space-y-4'>
                  {appointment.diagnosis && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Diagnosis
                      </label>
                      <p className='text-gray-900'>{appointment.diagnosis}</p>
                    </div>
                  )}

                  {appointment.prescription && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Prescription
                      </label>
                      <p className='text-gray-900'>
                        {appointment.prescription}
                      </p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Doctor&apos;s Notes
                      </label>
                      <p className='text-gray-900 whitespace-pre-wrap'>
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Patient Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FiUser className='w-5 h-5 text-purple-600' />
                Patient Information
              </h2>

              <div className='space-y-3'>
                <div>
                  <p className='text-lg font-semibold text-gray-900'>
                    {appointment.patientId.firstName}{' '}
                    {appointment.patientId.lastName}
                  </p>
                  <p className='text-sm text-gray-500'>
                    Age: {calculateAge(appointment.patientId.dateOfBirth)} years
                  </p>
                  <p className='text-sm text-gray-500 capitalize'>
                    {appointment.patientId.gender.toLowerCase()}
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <FiMail className='w-4 h-4' />
                    <span>{appointment.patientId.email}</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <FiPhone className='w-4 h-4' />
                    <span>{appointment.patientId.phone}</span>
                  </div>
                </div>
              </div>
            </motion.div>

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

              <div className='space-y-2'>
                <button
                  onClick={() => updateAppointmentStatus('CONFIRMED')}
                  disabled={updating || appointment.status === 'CONFIRMED'}
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors'
                >
                  <FiCheckCircle className='w-4 h-4' />
                  Confirm
                </button>

                <button
                  onClick={() => updateAppointmentStatus('IN_PROGRESS')}
                  disabled={updating || appointment.status === 'IN_PROGRESS'}
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors'
                >
                  <FiClockIcon className='w-4 h-4' />
                  Start Session
                </button>

                <button
                  onClick={() => updateAppointmentStatus('COMPLETED')}
                  disabled={updating || appointment.status === 'COMPLETED'}
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors'
                >
                  <FiCheckCircle className='w-4 h-4' />
                  Complete
                </button>

                <button
                  onClick={() => updateAppointmentStatus('CANCELLED')}
                  disabled={updating || appointment.status === 'CANCELLED'}
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors'
                >
                  <FiXCircle className='w-4 h-4' />
                  Cancel
                </button>

                <button
                  onClick={fetchAppointment}
                  disabled={updating}
                  className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors'
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </button>
              </div>
            </motion.div>

            {/* Appointment Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-gray-50 border border-gray-200 rounded-xl p-6'
            >
              <h3 className='font-semibold text-gray-900 mb-3'>
                Appointment Details
              </h3>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Created</span>
                  <span className='text-gray-900'>
                    {new Date(appointment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Last Updated</span>
                  <span className='text-gray-900'>
                    {new Date(appointment.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-500'>Appointment ID</span>
                  <span className='text-gray-900 font-mono text-xs'>
                    {appointmentId.slice(-8)}
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
