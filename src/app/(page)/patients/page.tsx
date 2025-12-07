/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import { Patient, PatientStats } from '@/types/patient';
import PatientStatsComponent from '@/components/Patient/PatientStats';
import PatientFilters from '@/components/Patient/PatientFilters';
import PatientTable from '@/components/Patient/PatientTable';
import {
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';

const calculateAge = (dateOfBirth: string | Date): number => {
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PatientRECEPTIONIST() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('ALL');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('ALL');
  const [maritalStatusFilter, setMaritalStatusFilter] = useState<string>('ALL');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('true');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());

    if (searchTerm) params.append('search', searchTerm);

    if (genderFilter && genderFilter !== 'ALL')
      params.append('gender', genderFilter);
    if (bloodTypeFilter && bloodTypeFilter !== 'ALL')
      params.append('bloodType', bloodTypeFilter);
    if (ageGroupFilter && ageGroupFilter !== 'ALL')
      params.append('ageGroup', ageGroupFilter);
    if (maritalStatusFilter && maritalStatusFilter !== 'ALL')
      params.append('maritalStatus', maritalStatusFilter);
    if (isActiveFilter !== '') params.append('isActive', isActiveFilter);

    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    return params.toString();
  }, [
    searchTerm,
    genderFilter,
    bloodTypeFilter,
    ageGroupFilter,
    maritalStatusFilter,
    isActiveFilter,
    sortBy,
    sortOrder,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    const successParam = searchParams.get('success');
    const messageParam = searchParams.get('message');

    if (successParam === 'true') {
      setSuccess(messageParam || 'Patient created successfully!');

      const timer = setTimeout(() => {
        setSuccess(null);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        newUrl.searchParams.delete('message');
        window.history.replaceState({}, '', newUrl.toString());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [session, status, router, searchParams]);

  const fetchPatients = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams();
      const response = await fetch(`/api/patients?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch patients');
      }

      const result = await response.json();

      if (result.success) {
        setPatients(result.data || []);
        setPagination(
          result.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
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
  }, [session, buildQueryParams]);

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
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (
      session?.user &&
      (session.user.role === 'RECEPTIONIST' || session.user.role === 'ADMIN')
    ) {
      fetchPatients();
      fetchStats();
    }
  }, [session, status, fetchPatients]);

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
        fetchPatients();
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

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewPatient = (id: string) => {
    router.push(`/patients/${id}`);
  };

  const handleEditPatient = (id: string) => {
    router.push(`/patients/${id}/edit`);
  };

  const handleAddPatient = () => {
    router.push('/patients/new');
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (session?.user) {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    genderFilter,
    bloodTypeFilter,
    ageGroupFilter,
    maritalStatusFilter,
    isActiveFilter,
    session,
  ]);

  useEffect(() => {
    if (session?.user) {
      fetchPatients();
    }
  }, [pagination.page, pagination.limit, session, fetchPatients]);

  if (status === 'loading' || (loading && patients.length === 0)) {
    return <Loading />;
  }

  if (error && patients.length === 0) {
    return <ErrorComponent message={error} />;
  }

  if (
    !session?.user ||
    (session.user.role !== 'RECEPTIONIST' && session.user.role !== 'ADMIN')
  ) {
    return <ErrorComponent message='Unauthorized access' />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Patients</h1>
              <p className='text-gray-600 mt-2'>
                Manage your patient records and information
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className='flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
              <button
                onClick={handleAddPatient}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md'
              >
                <FiPlus className='w-5 h-5' />
                New Patient
              </button>
            </div>
          </div>
        </div>

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

        {stats && <PatientStatsComponent stats={stats} />}

        <div className='mt-6'>
          <PatientFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            genderFilter={genderFilter}
            onGenderFilterChange={setGenderFilter}
            ageFilter={ageGroupFilter}
            onAgeFilterChange={setAgeGroupFilter}
            maritalStatusFilter={maritalStatusFilter}
            onMaritalStatusFilterChange={setMaritalStatusFilter}
            isActiveFilter={isActiveFilter === 'true'}
            onIsActiveFilterChange={value =>
              setIsActiveFilter(value ? 'true' : 'false')
            }
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            limit={pagination.limit}
            onLimitChange={handleLimitChange}
          />
        </div>

        <div className='mt-6'>
          <PatientTable
            patients={patients}
            deletingId={deletingId}
            onView={handleViewPatient}
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </div>

        {pagination.pages > 1 && (
          <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-700'>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} patients
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>

              <div className='flex items-center gap-1'>
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>

            <div className='flex items-center gap-2 text-sm text-gray-700'>
              <span>Items per page:</span>
              <select
                value={pagination.limit}
                onChange={e => handleLimitChange(Number(e.target.value))}
                disabled={loading}
                className='border border-gray-300 rounded-md px-2 py-1 text-sm'
              >
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='25'>25</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </select>
            </div>
          </div>
        )}

        {patients.length === 0 && !loading && (
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
              {searchTerm ||
              genderFilter !== 'ALL' ||
              ageGroupFilter !== 'ALL' ||
              bloodTypeFilter !== 'ALL'
                ? 'No patients found'
                : 'No patients yet'}
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm ||
              genderFilter !== 'ALL' ||
              ageGroupFilter !== 'ALL' ||
              bloodTypeFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding a new patient.'}
            </p>
            <div className='mt-6'>
              <button
                onClick={handleAddPatient}
                className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <FiPlus className='w-5 h-5 mr-2' />
                Add Your First Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
