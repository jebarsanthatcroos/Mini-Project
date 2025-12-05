'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiPlus,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Patient, PatientStats } from '@/types/patient';
import { calculateAge } from '@/types/patient';
import PatientStatsComponent from '@/components/Patient/PatientStats';
import PatientFilters from '@/components/Patient/PatientFilters';
import PatientTable from '@/components/Patient/PatientTable';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [ageFilter, setAgeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchStats();

    // Check for success parameter in URL
    const successParam = searchParams.get('success');
    const messageParam = searchParams.get('message');

    if (successParam === 'true') {
      setSuccess(messageParam || 'Patient created successfully!');

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess(null);
        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        newUrl.searchParams.delete('message');
        window.history.replaceState({}, '', newUrl.toString());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/patients');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch patients');
      }

      const result = await response.json();

      if (result.success) {
        setPatients(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load patients'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/patients/stats');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Stats are optional, don't show error
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPatients(), fetchStats()]);
    setRefreshing(false);
    setSuccess('Data refreshed successfully!');
    setTimeout(() => setSuccess(null), 3000);
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
      setError(null);

      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete patient');
      }

      const result = await response.json();

      if (result.success) {
        // Remove patient from local state
        setPatients(prevPatients =>
          prevPatients.filter(patient => patient._id !== patientId)
        );

        // Refresh stats
        fetchStats();

        setSuccess('Patient deleted successfully!');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(result.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete patient'
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      searchTerm === '' ||
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.nic.includes(searchTerm);

    const matchesGender =
      genderFilter === 'ALL' || patient.gender === genderFilter;

    const patientAge = calculateAge(patient.dateOfBirth);
    const matchesAge =
      ageFilter === 'ALL' ||
      (ageFilter === 'CHILD' && patientAge < 18) ||
      (ageFilter === 'ADULT' && patientAge >= 18 && patientAge < 65) ||
      (ageFilter === 'SENIOR' && patientAge >= 65);

    return matchesSearch && matchesGender && matchesAge;
  });

  // Sort filtered patients
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

  const handleViewPatient = (id: string) => {
    router.push(`/doctor/patients/${id}`);
  };

  const handleEditPatient = (id: string) => {
    router.push(`/doctor/patients/${id}/edit`);
  };

  const handleAddPatient = () => {
    router.push('/doctor/patients/new');
  };

  // Show loading spinner on initial load
  if (loading && patients.length === 0) {
    return <Loading />;
  }

  // Show error component if there's a critical error and no patients loaded
  if (error && patients.length === 0) {
    return <ErrorComponent message={error} />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Patients</h1>
              <p className='text-gray-600 mt-2'>
                Manage your patient records and information
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm animate-fade-in'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2 text-green-800'>
                <FiCheckCircle className='w-5 h-5 shrink-0 mt-0.5' />
                <span className='font-medium'>{success}</span>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className='text-green-600 hover:text-green-800 transition-colors'
                aria-label='Dismiss'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && patients.length > 0 && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm animate-fade-in'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2 text-red-800'>
                <FiAlertCircle className='w-5 h-5 shrink-0 mt-0.5' />
                <span className='font-medium'>Error: {error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className='text-red-600 hover:text-red-800 transition-colors'
                aria-label='Dismiss'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && <PatientStatsComponent stats={stats} />}

        {/* Filters and Search */}
        <PatientFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderFilter}
          ageFilter={ageFilter}
          onAgeFilterChange={setAgeFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Patients Table */}
        <PatientTable
          patients={patients}
          sortedPatients={sortedPatients}
          deletingId={deletingId}
          onView={handleViewPatient}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onAddPatient={handleAddPatient}
        />

        {/* Patient Count and Refresh */}
        <div className='mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500'>
          <div>
            Showing{' '}
            <span className='font-medium text-gray-700'>
              {sortedPatients.length}
            </span>{' '}
            of{' '}
            <span className='font-medium text-gray-700'>{patients.length}</span>{' '}
            patients
            {searchTerm && (
              <span className='ml-2 text-gray-600'>
                (filtered by &quot;{searchTerm}&quot;)
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FiRefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Empty State */}
        {sortedPatients.length === 0 && !loading && (
          <div className='mt-8 text-center py-12 bg-white rounded-lg border border-gray-200'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              {searchTerm || genderFilter !== 'ALL' || ageFilter !== 'ALL'
                ? 'No patients found'
                : 'No patients yet'}
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm || genderFilter !== 'ALL' || ageFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding a new patient.'}
            </p>
            {patients.length === 0 && (
              <div className='mt-6'>
                <button
                  onClick={handleAddPatient}
                  className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  <FiPlus className='w-5 h-5 mr-2' />
                  Add Your First Patient
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
