/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiHeart,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

// Define specific interfaces for nested objects
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: Address;
  emergencyContact: EmergencyContact;
  medicalHistory: string;
  allergies: string[];
  medications: string[];
  insurance: Insurance;
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
  const patientId = params.id as string;

  const [formData, setFormData] = useState<PatientFormData>({
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
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
        const patient = result.data;
        setFormData({
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          email: patient.email || '',
          phone: patient.phone || '',
          dateOfBirth: patient.dateOfBirth
            ? patient.dateOfBirth.split('T')[0]
            : '',
          gender: patient.gender || 'OTHER',
          address: patient.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
          emergencyContact: patient.emergencyContact || {
            name: '',
            phone: '',
            relationship: '',
          },
          medicalHistory: patient.medicalHistory || '',
          allergies: patient.allergies || [],
          medications: patient.medications || [],
          insurance: patient.insurance || {
            provider: '',
            policyNumber: '',
            groupNumber: '',
          },
        });
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
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

  // Safe nested object handler with type checking
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof PatientFormData];

        // Check if it's a nested object (not array, not primitive)
        if (
          typeof parentValue === 'object' &&
          parentValue !== null &&
          !Array.isArray(parentValue)
        ) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }

        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const addMedication = () => {
    if (
      newMedication.trim() &&
      !formData.medications.includes(newMedication.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()],
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: 'allergy' | 'medication'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'allergy') {
        addAllergy();
      } else {
        addMedication();
      }
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
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

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push(`/doctor/patients/${patientId}`)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors'
          >
            <FiArrowLeft className='w-5 h-5' />
            Back to Patient Details
          </button>

          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Edit Patient</h1>
              <p className='text-gray-600 mt-2'>
                Update patient information and medical records
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
                    First Name *
                  </label>
                  <input
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.firstName
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Last Name *
                  </label>
                  <input
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email Address *
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number *
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Date of Birth *
                  </label>
                  <input
                    type='date'
                    name='dateOfBirth'
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.dateOfBirth
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                  />
                  {formErrors.dateOfBirth && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.dateOfBirth}
                    </p>
                  )}
                  {formData.dateOfBirth && (
                    <p className='mt-1 text-sm text-gray-500'>
                      Age: {calculateAge(formData.dateOfBirth)} years
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Gender *
                  </label>
                  <select
                    name='gender'
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='MALE'>Male</option>
                    <option value='FEMALE'>Female</option>
                    <option value='OTHER'>Other</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Address Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FiMapPin className='w-5 h-5 text-green-600' />
                Address Information
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Street Address
                  </label>
                  <input
                    type='text'
                    name='address.street'
                    value={formData.address.street}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    City
                  </label>
                  <input
                    type='text'
                    name='address.city'
                    value={formData.address.city}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    State
                  </label>
                  <input
                    type='text'
                    name='address.state'
                    value={formData.address.state}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    ZIP Code
                  </label>
                  <input
                    type='text'
                    name='address.zipCode'
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Country
                  </label>
                  <input
                    type='text'
                    name='address.country'
                    value={formData.address.country}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FiAlertCircle className='w-5 h-5 text-red-600' />
                Emergency Contact
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Contact Name
                  </label>
                  <input
                    type='text'
                    name='emergencyContact.name'
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='emergencyContact.phone'
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Relationship
                  </label>
                  <input
                    type='text'
                    name='emergencyContact.relationship'
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                    placeholder='e.g., Spouse, Parent, Child'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </motion.div>

            {/* Medical Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FiHeart className='w-5 h-5 text-purple-600' />
                Medical Information
              </h2>

              <div className='space-y-6'>
                {/* Allergies */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Allergies
                  </label>
                  <div className='flex gap-2 mb-3'>
                    <input
                      type='text'
                      value={newAllergy}
                      onChange={e => setNewAllergy(e.target.value)}
                      onKeyPress={e => handleKeyPress(e, 'allergy')}
                      placeholder='Add an allergy...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    <button
                      type='button'
                      onClick={addAllergy}
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      <FiPlus className='w-4 h-4' />
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {formData.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm'
                      >
                        {allergy}
                        <button
                          type='button'
                          onClick={() => removeAllergy(index)}
                          className='hover:text-red-900'
                        >
                          <FiTrash2 className='w-3 h-3' />
                        </button>
                      </span>
                    ))}
                    {formData.allergies.length === 0 && (
                      <p className='text-gray-500 text-sm'>
                        No allergies added
                      </p>
                    )}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Current Medications
                  </label>
                  <div className='flex gap-2 mb-3'>
                    <input
                      type='text'
                      value={newMedication}
                      onChange={e => setNewMedication(e.target.value)}
                      onKeyPress={e => handleKeyPress(e, 'medication')}
                      placeholder='Add a medication...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    <button
                      type='button'
                      onClick={addMedication}
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      <FiPlus className='w-4 h-4' />
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {formData.medications.map((medication, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                      >
                        {medication}
                        <button
                          type='button'
                          onClick={() => removeMedication(index)}
                          className='hover:text-blue-900'
                        >
                          <FiTrash2 className='w-3 h-3' />
                        </button>
                      </span>
                    ))}
                    {formData.medications.length === 0 && (
                      <p className='text-gray-500 text-sm'>
                        No medications added
                      </p>
                    )}
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Medical History
                  </label>
                  <textarea
                    name='medicalHistory'
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Enter patient's medical history, including past conditions, surgeries, and relevant health information..."
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </motion.div>

            {/* Insurance Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Insurance Information
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Insurance Provider
                  </label>
                  <input
                    type='text'
                    name='insurance.provider'
                    value={formData.insurance.provider}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Policy Number
                  </label>
                  <input
                    type='text'
                    name='insurance.policyNumber'
                    value={formData.insurance.policyNumber}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Group Number
                  </label>
                  <input
                    type='text'
                    name='insurance.groupNumber'
                    value={formData.insurance.groupNumber}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
            >
              <div className='flex gap-4'>
                <button
                  type='button'
                  onClick={() => router.push(`/doctor/patients/${patientId}`)}
                  className='flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={saving}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                >
                  <FiSave className='w-4 h-4' />
                  {saving ? 'Updating Patient...' : 'Update Patient'}
                </button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
