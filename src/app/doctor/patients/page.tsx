'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Patient, PatientStats } from '@/types/patient';
import { calculateAge } from '@/utils/patientUtils';
import PatientStat from '@/components/Patient/PatientStats';
import PatientFilters from '@/components/Patient/PatientFilters';
import PatientTable from '@/components/Patient/PatientTable';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

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

  const handleViewPatient = (id: string) => {
    router.push(`/doctor/patients/${id}`);
  };

  const handleEditPatient = (id: string) => {
    router.push(`/doctor/patients/${id}/edit`);
  };

  const handleAddPatient = () => {
    router.push('/doctor/patients/new');
  };

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
              onClick={handleAddPatient}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <FiPlus className='w-5 h-5' />
              New Patient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && <PatientStat stats={stats} />}

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
