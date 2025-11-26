'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import {
  FiUser,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiRefreshCw,
  FiUsers,
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
  createdAt: string;
  updatedAt: string;
}

interface PatientStats {
  total: number;
  male: number;
  female: number;
  other: number;
  recent: number;
  adults: number;
  children: number;
}

export default function PatientsPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [ageFilter, setAgeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/patients');

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const result = await response.json();

      if (result.success) {
        setPatients(result.data);
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/doctor/patients/stats');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this patient? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingId(patientId);
      const response = await fetch(`/api/doctor/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      const result = await response.json();

      if (result.success) {
        setPatients(patients.filter(patient => patient._id !== patientId));
        fetchStats();
      } else {
        throw new Error(result.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    } finally {
      setDeletingId(null);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      searchTerm === '' ||
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    const matchesGender =
      genderFilter === 'ALL' || patient.gender === genderFilter;

    const matchesAge =
      ageFilter === 'ALL' ||
      (ageFilter === 'CHILD' && calculateAge(patient.dateOfBirth) < 18) ||
      (ageFilter === 'ADULT' &&
        calculateAge(patient.dateOfBirth) >= 18 &&
        calculateAge(patient.dateOfBirth) < 65) ||
      (ageFilter === 'SENIOR' && calculateAge(patient.dateOfBirth) >= 65);

    return matchesSearch && matchesGender && matchesAge;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      case 'age':
        return calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth);
      case 'recent':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'gender':
        return a.gender.localeCompare(b.gender);
      default:
        return 0;
    }
  });

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Patients</h1>
              <p className='text-gray-600 mt-2'>
                Manage your patient records and information
              </p>
            </div>
            <button
              onClick={() => router.push('/doctor/patients/new')}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <FiPlus className='w-5 h-5' />
              New Patient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <FiUsers className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {stats.total}
                  </div>
                  <div className='text-sm text-gray-500'>Total Patients</div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <FiUser className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-blue-600'>
                    {stats.male}
                  </div>
                  <div className='text-sm text-gray-500'>Male</div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-pink-100 rounded-lg'>
                  <FiUser className='w-6 h-6 text-pink-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-pink-600'>
                    {stats.female}
                  </div>
                  <div className='text-sm text-gray-500'>Female</div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <FiUser className='w-6 h-6 text-purple-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-purple-600'>
                    {stats.other}
                  </div>
                  <div className='text-sm text-gray-500'>Other</div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <FiCalendar className='w-6 h-6 text-green-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-green-600'>
                    {stats.adults}
                  </div>
                  <div className='text-sm text-gray-500'>Adults</div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-yellow-100 rounded-lg'>
                  <FiCalendar className='w-6 h-6 text-yellow-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {stats.children}
                  </div>
                  <div className='text-sm text-gray-500'>Children</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search patients...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='ALL'>All Genders</option>
              <option value='MALE'>Male</option>
              <option value='FEMALE'>Female</option>
              <option value='OTHER'>Other</option>
            </select>

            <select
              value={ageFilter}
              onChange={e => setAgeFilter(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='ALL'>All Ages</option>
              <option value='CHILD'>Children (&lt;18)</option>
              <option value='ADULT'>Adults (18-64)</option>
              <option value='SENIOR'>Seniors (65+)</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='name'>Sort by Name</option>
              <option value='age'>Sort by Age</option>
              <option value='recent'>Sort by Recent</option>
              <option value='gender'>Sort by Gender</option>
            </select>
          </div>
        </div>

        {/* Patients Grid */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          {sortedPatients.length === 0 ? (
            <div className='text-center py-12'>
              <FiUser className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No patients found
              </h3>
              <p className='text-gray-500 mb-4'>
                {patients.length === 0
                  ? 'No patients in your records yet.'
                  : 'No patients match your search criteria.'}
              </p>
              {patients.length === 0 && (
                <button
                  onClick={() => router.push('/doctor/patients/new')}
                  className='text-blue-600 hover:text-blue-700 font-medium'
                >
                  Add your first patient
                </button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Patient
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Contact
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Age & Gender
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Medical Info
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Joined
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {sortedPatients.map((patient, index) => (
                    <motion.tr
                      key={patient._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='hover:bg-gray-50'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center'>
                            <FiUser className='w-5 h-5 text-blue-600' />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              ID: {patient._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 flex items-center gap-1 mb-1'>
                          <FiMail className='w-4 h-4 text-gray-400' />
                          {patient.email}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center gap-1'>
                          <FiPhone className='w-4 h-4 text-gray-400' />
                          {patient.phone}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {calculateAge(patient.dateOfBirth)} years
                        </div>
                        <div className='text-sm text-gray-500 capitalize'>
                          {getGenderText(patient.gender).toLowerCase()}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900 space-y-1'>
                          {patient.allergies &&
                            patient.allergies.length > 0 && (
                              <div>
                                <span className='text-red-600 font-medium'>
                                  Allergies:
                                </span>{' '}
                                {patient.allergies.join(', ')}
                              </div>
                            )}
                          {patient.medications &&
                            patient.medications.length > 0 && (
                              <div>
                                <span className='text-blue-600 font-medium'>
                                  Meds:
                                </span>{' '}
                                {patient.medications.join(', ')}
                              </div>
                            )}
                          {(!patient.allergies ||
                            patient.allergies.length === 0) &&
                            (!patient.medications ||
                              patient.medications.length === 0) && (
                              <span className='text-gray-400'>
                                No medical info
                              </span>
                            )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {formatDate(patient.createdAt)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex justify-end gap-2'>
                          <button
                            onClick={() =>
                              router.push(`/doctor/patients/${patient._id}`)
                            }
                            className='text-blue-600 hover:text-blue-900 p-1 transition-colors'
                            title='View Details'
                          >
                            <FiEye className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/doctor/patients/${patient._id}/edit`
                              )
                            }
                            className='text-green-600 hover:text-green-900 p-1 transition-colors'
                            title='Edit Patient'
                          >
                            <FiEdit className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient._id)}
                            disabled={deletingId === patient._id}
                            className='text-red-600 hover:text-red-900 p-1 disabled:opacity-50 transition-colors'
                            title='Delete Patient'
                          >
                            {deletingId === patient._id ? (
                              <FiRefreshCw className='w-4 h-4 animate-spin' />
                            ) : (
                              <FiTrash2 className='w-4 h-4' />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Patient Count */}
        <div className='mt-4 flex justify-between items-center text-sm text-gray-500'>
          <div>
            Showing {sortedPatients.length} of {patients.length} patients
          </div>
          <button
            onClick={fetchPatients}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
          >
            <FiRefreshCw className='w-4 h-4' />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
