'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiSearch,
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
  gender: string;
}

interface AppointmentFormData {
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'CHECKUP' | 'EMERGENCY' | 'OTHER';
  status: 'SCHEDULED' | 'CONFIRMED';
  reason: string;
  symptoms?: string;
}

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
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDefaultTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
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
                New Appointment
              </h1>
              <p className='text-gray-600 mt-2'>
                Schedule a new appointment with a patient
              </p>
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

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Patient Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FiUser className='w-5 h-5 text-blue-600' />
                  Patient Information
                </h2>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Select Patient *
                    </label>
                    <div className='relative'>
                      <div className='relative'>
                        <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                        <input
                          type='text'
                          placeholder='Search patients by name or email...'
                          value={searchTerm}
                          onChange={e => {
                            setSearchTerm(e.target.value);
                            setShowPatientDropdown(true);
                          }}
                          onFocus={() => setShowPatientDropdown(true)}
                          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                      </div>

                      {showPatientDropdown && filteredPatients.length > 0 && (
                        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto'>
                          {filteredPatients.map(patient => (
                            <div
                              key={patient._id}
                              onClick={() => handlePatientSelect(patient)}
                              className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                            >
                              <div className='font-medium text-gray-900'>
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {patient.email} •{' '}
                                {calculateAge(patient.dateOfBirth)} years •{' '}
                                {patient.gender.toLowerCase()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {formErrors.patientId && (
                      <p className='mt-1 text-sm text-red-600'>
                        {formErrors.patientId}
                      </p>
                    )}
                  </div>

                  {formData.patientId && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                      <h3 className='font-medium text-blue-900 mb-2'>
                        Selected Patient
                      </h3>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-blue-700'>Name:</span>
                          <p className='text-blue-900 font-medium'>
                            {getSelectedPatient()?.firstName}{' '}
                            {getSelectedPatient()?.lastName}
                          </p>
                        </div>
                        <div>
                          <span className='text-blue-700'>Email:</span>
                          <p className='text-blue-900'>
                            {getSelectedPatient()?.email}
                          </p>
                        </div>
                        <div>
                          <span className='text-blue-700'>Phone:</span>
                          <p className='text-blue-900'>
                            {getSelectedPatient()?.phone}
                          </p>
                        </div>
                        <div>
                          <span className='text-blue-700'>Age:</span>
                          <p className='text-blue-900'>
                            {getSelectedPatient() &&
                              calculateAge(
                                getSelectedPatient()!.dateOfBirth
                              )}{' '}
                            years
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Appointment Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FiCalendar className='w-5 h-5 text-green-600' />
                  Appointment Details
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Date *
                    </label>
                    <input
                      type='date'
                      name='appointmentDate'
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.appointmentDate
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                    {formErrors.appointmentDate && (
                      <p className='mt-1 text-sm text-red-600'>
                        {formErrors.appointmentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Time *
                    </label>
                    <input
                      type='time'
                      name='appointmentTime'
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.appointmentTime
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                    />
                    {formErrors.appointmentTime && (
                      <p className='mt-1 text-sm text-red-600'>
                        {formErrors.appointmentTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Duration *
                    </label>
                    <select
                      name='duration'
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Appointment Type *
                    </label>
                    <select
                      name='type'
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='CONSULTATION'>Consultation</option>
                      <option value='FOLLOW_UP'>Follow-up</option>
                      <option value='CHECKUP'>Checkup</option>
                      <option value='EMERGENCY'>Emergency</option>
                      <option value='OTHER'>Other</option>
                    </select>
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Initial Status
                    </label>
                    <select
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='SCHEDULED'>Scheduled</option>
                      <option value='CONFIRMED'>Confirmed</option>
                    </select>
                    <p className='mt-1 text-sm text-gray-500'>
                      Scheduled appointments will need to be confirmed later.
                      Confirmed appointments are ready for the patient.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Medical Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FiFileText className='w-5 h-5 text-purple-600' />
                  Medical Information
                </h2>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Reason for Visit *
                    </label>
                    <textarea
                      name='reason'
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder='Describe the primary reason for this appointment...'
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.reason ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.reason && (
                      <p className='mt-1 text-sm text-red-600'>
                        {formErrors.reason}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Symptoms (Optional)
                    </label>
                    <textarea
                      name='symptoms'
                      value={formData.symptoms}
                      onChange={handleChange}
                      rows={3}
                      placeholder='List any symptoms reported by the patient...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>
              </motion.div>
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
                  Appointment Summary
                </h2>

                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Status:</span>
                    <span
                      className={`font-medium ${
                        formData.status === 'CONFIRMED'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {formData.status === 'CONFIRMED'
                        ? 'Confirmed'
                        : 'Scheduled'}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Duration:</span>
                    <span className='font-medium'>
                      {formData.duration} minutes
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Type:</span>
                    <span className='font-medium capitalize'>
                      {formData.type.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {formData.appointmentDate && (
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>Date:</span>
                      <span className='font-medium'>
                        {new Date(formData.appointmentDate).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {formData.appointmentTime && (
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>Time:</span>
                      <span className='font-medium'>
                        {new Date(
                          `2000-01-01T${formData.appointmentTime}`
                        ).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}

                  {formData.patientId && (
                    <div className='pt-3 border-t border-gray-200'>
                      <div className='flex justify-between'>
                        <span className='text-gray-500'>Patient:</span>
                        <span className='font-medium text-right'>
                          {getSelectedPatient()?.firstName}{' '}
                          {getSelectedPatient()?.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
              >
                <div className='space-y-3'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                  >
                    <FiSave className='w-4 h-4' />
                    {saving ? 'Creating Appointment...' : 'Create Appointment'}
                  </button>

                  <button
                    type='button'
                    onClick={() => router.push('/doctor/appointments')}
                    className='w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                </div>

                <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <p className='text-xs text-yellow-800'>
                    <strong>Note:</strong> The patient will receive a
                    notification about this appointment once created.
                  </p>
                </div>
              </motion.div>

              {/* Help Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className='bg-blue-50 border border-blue-200 rounded-xl p-6'
              >
                <h3 className='font-semibold text-blue-900 mb-3'>Quick Tips</h3>
                <ul className='space-y-2 text-sm text-blue-800'>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5'>•</span>
                    <span>Select a patient from your existing records</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5'>•</span>
                    <span>
                      Choose appropriate duration based on appointment type
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5'>•</span>
                    <span>
                      Mark as confirmed if the patient has already confirmed
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5'>•</span>
                    <span>
                      Provide clear reason for better patient preparation
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
