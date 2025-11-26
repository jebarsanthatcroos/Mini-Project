'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit,
  FiEye,
  FiTrash2,
  FiFileText,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
}

interface Prescription {
  _id: string;
  patientId: Patient;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface PrescriptionFilters {
  status: string;
  patient: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function PrescriptionsPage() {
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<
    Prescription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PrescriptionFilters>({
    status: '',
    patient: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, prescriptions]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/prescriptions');

      if (!response.ok) {
        throw new Error('Failed to fetch prescriptions');
      }

      const result = await response.json();

      if (result.success) {
        setPrescriptions(result.data);
        setFilteredPrescriptions(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        prescription =>
          prescription.patientId.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          prescription.patientId.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          prescription.diagnosis
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          prescription.medications.some(med =>
            med.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(
        prescription => prescription.status === filters.status
      );
    }

    // Patient filter
    if (filters.patient) {
      filtered = filtered.filter(
        prescription => prescription.patientId._id === filters.patient
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        prescription =>
          new Date(prescription.startDate) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(
        prescription =>
          new Date(prescription.startDate) <= new Date(filters.dateRange.end)
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this prescription? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(prescriptionId);
      const response = await fetch(
        `/api/doctor/prescriptions/${prescriptionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete prescription');
      }

      const result = await response.json();

      if (result.success) {
        setPrescriptions(prev => prev.filter(p => p._id !== prescriptionId));
      } else {
        throw new Error(result.message || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <FiClock className='w-4 h-4 text-blue-500' />;
      case 'COMPLETED':
        return <FiCheckCircle className='w-4 h-4 text-green-500' />;
      case 'CANCELLED':
        return <FiXCircle className='w-4 h-4 text-red-500' />;
      default:
        return <FiFileText className='w-4 h-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      patient: '',
      dateRange: {
        start: '',
        end: '',
      },
    });
    setSearchTerm('');
  };

  const getUniquePatients = () => {
    const patientsMap = new Map();
    prescriptions.forEach(prescription => {
      patientsMap.set(prescription.patientId._id, prescription.patientId);
    });
    return Array.from(patientsMap.values());
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Prescriptions
              </h1>
              <p className='text-gray-600 mt-2'>
                Manage and review patient prescriptions
              </p>
            </div>
            <button
              onClick={() => router.push('/doctor/prescriptions/new')}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <FiPlus className='w-5 h-5' />
              New Prescription
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search prescriptions by patient name, diagnosis, or medication...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <FiFilter className='w-4 h-4' />
              Filters
              {(filters.status ||
                filters.patient ||
                filters.dateRange.start ||
                filters.dateRange.end) && (
                <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              )}
            </button>

            {/* Clear Filters */}
            {(searchTerm ||
              filters.status ||
              filters.patient ||
              filters.dateRange.start ||
              filters.dateRange.end) && (
              <button
                onClick={clearFilters}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Clear All
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='mt-4 p-4 bg-white border border-gray-200 rounded-lg'
            >
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Status Filter */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={e =>
                      setFilters(prev => ({ ...prev, status: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>All Status</option>
                    <option value='ACTIVE'>Active</option>
                    <option value='COMPLETED'>Completed</option>
                    <option value='CANCELLED'>Cancelled</option>
                  </select>
                </div>

                {/* Patient Filter */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Patient
                  </label>
                  <select
                    value={filters.patient}
                    onChange={e =>
                      setFilters(prev => ({ ...prev, patient: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>All Patients</option>
                    {getUniquePatients().map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Start Date Range
                  </label>
                  <input
                    type='date'
                    value={filters.dateRange.start}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {prescriptions.length}
                </p>
              </div>
              <FiFileText className='w-8 h-8 text-gray-400' />
            </div>
          </div>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Active</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {prescriptions.filter(p => p.status === 'ACTIVE').length}
                </p>
              </div>
              <FiClock className='w-8 h-8 text-blue-400' />
            </div>
          </div>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Completed</p>
                <p className='text-2xl font-bold text-green-600'>
                  {prescriptions.filter(p => p.status === 'COMPLETED').length}
                </p>
              </div>
              <FiCheckCircle className='w-8 h-8 text-green-400' />
            </div>
          </div>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Cancelled</p>
                <p className='text-2xl font-bold text-red-600'>
                  {prescriptions.filter(p => p.status === 'CANCELLED').length}
                </p>
              </div>
              <FiXCircle className='w-8 h-8 text-red-400' />
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
          {filteredPrescriptions.length === 0 ? (
            <div className='text-center py-12'>
              <FiFileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No prescriptions found
              </h3>
              <p className='text-gray-500 mb-6'>
                {searchTerm ||
                filters.status ||
                filters.patient ||
                filters.dateRange.start
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first prescription'}
              </p>
              {!searchTerm &&
                !filters.status &&
                !filters.patient &&
                !filters.dateRange.start && (
                  <button
                    onClick={() => router.push('/doctor/prescriptions/new')}
                    className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <FiPlus className='w-4 h-4' />
                    New Prescription
                  </button>
                )}
            </div>
          ) : (
            <div className='divide-y divide-gray-200'>
              {filteredPrescriptions.map(prescription => (
                <motion.div
                  key={prescription._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='p-6 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
                    {/* Left Section - Patient and Diagnosis */}
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                            <FiUser className='w-4 h-4 text-blue-600' />
                            {prescription.patientId.firstName}{' '}
                            {prescription.patientId.lastName}
                          </h3>
                          <p className='text-gray-600 text-sm mt-1'>
                            {prescription.patientId.email}
                          </p>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}
                        >
                          {getStatusIcon(prescription.status)}
                          {prescription.status.charAt(0) +
                            prescription.status.slice(1).toLowerCase()}
                        </div>
                      </div>

                      <div className='mb-3'>
                        <p className='text-sm text-gray-600 mb-1'>Diagnosis</p>
                        <p className='text-gray-900 font-medium'>
                          {prescription.diagnosis}
                        </p>
                      </div>

                      {/* Medications */}
                      <div className='mb-3'>
                        <p className='text-sm text-gray-600 mb-2'>
                          Medications
                        </p>
                        <div className='space-y-2'>
                          {prescription.medications.map((medication, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-3 text-sm'
                            >
                              <span className='font-medium text-gray-900'>
                                {medication.name}
                              </span>
                              <span className='text-gray-500'>
                                {medication.dosage}
                              </span>
                              <span className='text-gray-500'>•</span>
                              <span className='text-gray-500'>
                                {medication.frequency}
                              </span>
                              <span className='text-gray-500'>•</span>
                              <span className='text-gray-500'>
                                {medication.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
                        <div className='flex items-center gap-1'>
                          <FiCalendar className='w-4 h-4' />
                          <span>
                            Start: {formatDate(prescription.startDate)}
                          </span>
                        </div>
                        {prescription.endDate && (
                          <div className='flex items-center gap-1'>
                            <FiCalendar className='w-4 h-4' />
                            <span>End: {formatDate(prescription.endDate)}</span>
                          </div>
                        )}
                        {prescription.endDate && (
                          <div>
                            <span>
                              Duration:{' '}
                              {calculateDuration(
                                prescription.startDate,
                                prescription.endDate
                              )}{' '}
                              days
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className='flex items-center gap-2 lg:flex-col lg:items-end'>
                      <div className='text-right mb-2 hidden lg:block'>
                        <p className='text-xs text-gray-500'>
                          Created {formatDate(prescription.createdAt)}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor/prescriptions/${prescription._id}`
                            )
                          }
                          className='flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                        >
                          <FiEye className='w-4 h-4' />
                          <span className='hidden sm:inline'>View</span>
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor/prescriptions/${prescription._id}/edit`
                            )
                          }
                          className='flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                        >
                          <FiEdit className='w-4 h-4' />
                          <span className='hidden sm:inline'>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePrescription(prescription._id)
                          }
                          disabled={deleteLoading === prescription._id}
                          className='flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
                        >
                          <FiTrash2 className='w-4 h-4' />
                          <span className='hidden sm:inline'>
                            {deleteLoading === prescription._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {prescription.notes && (
                    <div className='mt-3 pt-3 border-t border-gray-200'>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>Notes:</span>{' '}
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination (optional - can be implemented later) */}
        {filteredPrescriptions.length > 0 && (
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2'>
              <button className='px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50'>
                Previous
              </button>
              <button className='px-3 py-2 text-sm bg-blue-600 text-white rounded-lg'>
                1
              </button>
              <button className='px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50'>
                2
              </button>
              <button className='px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50'>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
