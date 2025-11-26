/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiCalendar,
  FiFileText,
  FiPlus,
  FiEye,
  FiEdit,
  FiDownload,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiBarChart,
  FiImage,
  FiX,
  FiPrinter,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
}

interface MedicalRecord {
  _id: string;
  patientId: Patient;
  recordType:
    | 'CONSULTATION'
    | 'LAB_RESULT'
    | 'IMAGING'
    | 'ECG'
    | 'PRESCRIPTION'
    | 'PROGRESS_NOTE'
    | 'SURGICAL_REPORT'
    | 'DISCHARGE_SUMMARY'
    | 'OTHER';
  title: string;
  description: string;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  doctorNotes?: string;
}

interface RecordFilters {
  recordType: string;
  status: string;
  patient: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface RecordStats {
  total: number;
  consultations: number;
  labResults: number;
  imaging: number;
  prescriptions: number;
  active: number;
  completed: number;
}

export default function MedicalRecordsPage() {
  const router = useRouter();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RecordFilters>({
    recordType: '',
    status: '',
    patient: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const [stats, setStats] = useState<RecordStats>({
    total: 0,
    consultations: 0,
    labResults: 0,
    imaging: 0,
    prescriptions: 0,
    active: 0,
    completed: 0,
  });

  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    filterRecords();
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, records]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/records');

      if (!response.ok) {
        throw new Error('Failed to fetch medical records');
      }

      const result = await response.json();

      if (result.success) {
        setRecords(result.data);
        setFilteredRecords(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch medical records');
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        record =>
          record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patientId.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.patientId.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.doctorNotes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Record type filter
    if (filters.recordType) {
      filtered = filtered.filter(
        record => record.recordType === filters.recordType
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    // Patient filter
    if (filters.patient) {
      filtered = filtered.filter(
        record => record.patientId._id === filters.patient
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        record => new Date(record.date) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(
        record => new Date(record.date) <= new Date(filters.dateRange.end)
      );
    }

    setFilteredRecords(filtered);
  };

  const calculateStats = () => {
    const total = records.length;
    const consultations = records.filter(
      r => r.recordType === 'CONSULTATION'
    ).length;
    const labResults = records.filter(
      r => r.recordType === 'LAB_RESULT'
    ).length;
    const imaging = records.filter(r => r.recordType === 'IMAGING').length;
    const prescriptions = records.filter(
      r => r.recordType === 'PRESCRIPTION'
    ).length;
    const active = records.filter(r => r.status === 'ACTIVE').length;
    const completed = records.filter(r => r.status === 'COMPLETED').length;

    setStats({
      total,
      consultations,
      labResults,
      imaging,
      prescriptions,
      active,
      completed,
    });
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <FiUser className='w-4 h-4 text-blue-500' />;
      case 'LAB_RESULT':
        return <FiBarChart className='w-4 h-4 text-green-500' />;
      case 'IMAGING':
        return <FiImage className='w-4 h-4 text-purple-500' />;
      case 'ECG':
        return <FiActivity className='w-4 h-4 text-red-500' />;
      case 'PRESCRIPTION':
        return <FiFileText className='w-4 h-4 text-orange-500' />;
      case 'PROGRESS_NOTE':
        return <FiClock className='w-4 h-4 text-yellow-500' />;
      case 'SURGICAL_REPORT':
        return <FiScissors className='w-4 h-4 text-pink-500' />;
      case 'DISCHARGE_SUMMARY':
        return <FiCheckCircle className='w-4 h-4 text-teal-500' />;
      default:
        return <FiFileText className='w-4 h-4 text-gray-500' />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LAB_RESULT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IMAGING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ECG':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PRESCRIPTION':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PROGRESS_NOTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SURGICAL_REPORT':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'DISCHARGE_SUMMARY':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'Consultation';
      case 'LAB_RESULT':
        return 'Lab Result';
      case 'IMAGING':
        return 'Imaging';
      case 'ECG':
        return 'ECG Report';
      case 'PRESCRIPTION':
        return 'Prescription';
      case 'PROGRESS_NOTE':
        return 'Progress Note';
      case 'SURGICAL_REPORT':
        return 'Surgical Report';
      case 'DISCHARGE_SUMMARY':
        return 'Discharge Summary';
      case 'OTHER':
        return 'Other';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <FiClock className='w-3 h-3 text-blue-500' />;
      case 'COMPLETED':
        return <FiCheckCircle className='w-3 h-3 text-green-500' />;
      case 'ARCHIVED':
        return <FiFileText className='w-3 h-3 text-gray-500' />;
      default:
        return <FiFileText className='w-3 h-3 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'ARCHIVED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const clearFilters = () => {
    setFilters({
      recordType: '',
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
    records.forEach(record => {
      patientsMap.set(record.patientId._id, record.patientId);
    });
    return Array.from(patientsMap.values());
  };

  const handleViewRecord = (recordId: string) => {
    router.push(`/doctor/records/${recordId}`);
  };

  const handleCreateRecord = () => {
    router.push('/doctor/records/new');
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRecords.length === 0) return;

    try {
      // Implement bulk actions based on selection
      switch (bulkAction) {
        case 'download':
          // Download selected records
          await handleBulkDownload();
          break;
        case 'archive':
          // Archive selected records
          await handleBulkArchive();
          break;
        case 'delete':
          // Delete selected records
          await handleBulkDelete();
          break;
        default:
          break;
      }

      setBulkAction('');
      setSelectedRecords([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
    }
  };

  const handleBulkDownload = async () => {
    // Implement bulk download logic
    console.log('Downloading records:', selectedRecords);
  };

  const handleBulkArchive = async () => {
    // Implement bulk archive logic
    console.log('Archiving records:', selectedRecords);
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedRecords.length} records? This action cannot be undone.`
      )
    ) {
      return;
    }
    // Implement bulk delete logic
    console.log('Deleting records:', selectedRecords);
  };

  const handleDownloadFile = async (filename: string, recordId: string) => {
    try {
      setDownloading(recordId);
      const response = await fetch(
        `/api/doctor/records/download?filename=${filename}`
      );

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return <FiImage className='w-3 h-3 text-green-500' />;
    } else if (extension === 'pdf') {
      return <FiFileText className='w-3 h-3 text-red-500' />;
    } else {
      return <FiFileText className='w-3 h-3 text-blue-500' />;
    }
  };

  // Mock FiActivity and FiScissors icons (replace with actual imports if available)
  const FiActivity = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      />
    </svg>
  );

  const FiScissors = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z'
      />
    </svg>
  );

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
                Medical Records
              </h1>
              <p className='text-gray-600 mt-2'>
                Manage and review patient medical records, lab reports, imaging
                studies, and more
              </p>
            </div>
            <button
              onClick={handleCreateRecord}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <FiPlus className='w-5 h-5' />
              New Record
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6'>
          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Records
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.total}
                </p>
              </div>
              <FiFileText className='w-8 h-8 text-gray-400' />
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Consultations
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {stats.consultations}
                </p>
              </div>
              <FiUser className='w-8 h-8 text-blue-400' />
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Lab Results</p>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.labResults}
                </p>
              </div>
              <FiBarChart className='w-8 h-8 text-green-400' />
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Imaging</p>
                <p className='text-2xl font-bold text-purple-600'>
                  {stats.imaging}
                </p>
              </div>
              <FiImage className='w-8 h-8 text-purple-400' />
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Prescriptions
                </p>
                <p className='text-2xl font-bold text-orange-600'>
                  {stats.prescriptions}
                </p>
              </div>
              <FiFileText className='w-8 h-8 text-orange-400' />
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Active</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {stats.active}
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
                  {stats.completed}
                </p>
              </div>
              <FiCheckCircle className='w-8 h-8 text-green-400' />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <span className='text-blue-800 font-medium'>
                  {selectedRecords.length} record(s) selected
                </span>
                <select
                  value={bulkAction}
                  onChange={e => setBulkAction(e.target.value)}
                  className='px-3 py-1 border border-blue-300 rounded-lg bg-white text-blue-900'
                >
                  <option value=''>Bulk Actions</option>
                  <option value='download'>Download Selected</option>
                  <option value='archive'>Archive Selected</option>
                  <option value='delete'>Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className='px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Apply
                </button>
              </div>
              <button
                onClick={() => setSelectedRecords([])}
                className='text-blue-600 hover:text-blue-800'
              >
                <FiX className='w-5 h-5' />
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search records by title, description, patient name, or doctor notes...'
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
              {(filters.recordType ||
                filters.status ||
                filters.patient ||
                filters.dateRange.start ||
                filters.dateRange.end) && (
                <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              )}
            </button>

            {/* Clear Filters */}
            {(searchTerm ||
              filters.recordType ||
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
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {/* Record Type Filter */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Record Type
                  </label>
                  <select
                    value={filters.recordType}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        recordType: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>All Types</option>
                    <option value='CONSULTATION'>Consultation</option>
                    <option value='LAB_RESULT'>Lab Result</option>
                    <option value='IMAGING'>Imaging</option>
                    <option value='ECG'>ECG Report</option>
                    <option value='PRESCRIPTION'>Prescription</option>
                    <option value='PROGRESS_NOTE'>Progress Note</option>
                    <option value='SURGICAL_REPORT'>Surgical Report</option>
                    <option value='DISCHARGE_SUMMARY'>Discharge Summary</option>
                    <option value='OTHER'>Other</option>
                  </select>
                </div>

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
                    <option value='ARCHIVED'>Archived</option>
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
                    Date Range
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

        {/* Records List */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
          {filteredRecords.length === 0 ? (
            <div className='text-center py-12'>
              <FiFileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No medical records found
              </h3>
              <p className='text-gray-500 mb-6'>
                {searchTerm ||
                filters.recordType ||
                filters.status ||
                filters.patient ||
                filters.dateRange.start
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first medical record'}
              </p>
              {!searchTerm &&
                !filters.recordType &&
                !filters.status &&
                !filters.patient &&
                !filters.dateRange.start && (
                  <button
                    onClick={handleCreateRecord}
                    className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <FiPlus className='w-4 h-4' />
                    New Medical Record
                  </button>
                )}
            </div>
          ) : (
            <div className='divide-y divide-gray-200'>
              {/* Table Header */}
              <div className='p-6 bg-gray-50 flex items-center gap-4'>
                <input
                  type='checkbox'
                  checked={
                    selectedRecords.length === filteredRecords.length &&
                    filteredRecords.length > 0
                  }
                  onChange={handleSelectAll}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <div className='flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-900'>
                  <div className='col-span-4'>Record & Patient</div>
                  <div className='col-span-2'>Type</div>
                  <div className='col-span-2'>Date</div>
                  <div className='col-span-2'>Status</div>
                  <div className='col-span-2 text-right'>Actions</div>
                </div>
              </div>

              {filteredRecords.map(record => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='p-6 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start gap-4'>
                    <input
                      type='checkbox'
                      checked={selectedRecords.includes(record._id)}
                      onChange={() => handleSelectRecord(record._id)}
                      className='mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />

                    <div className='flex-1 grid grid-cols-12 gap-4 items-start'>
                      {/* Record & Patient Info */}
                      <div className='col-span-4'>
                        <div className='flex items-start gap-3'>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-gray-900 mb-1'>
                              {record.title}
                            </h3>
                            <p className='text-gray-600 text-sm mb-2 line-clamp-2'>
                              {record.description}
                            </p>
                            <div className='flex items-center gap-2 text-sm text-gray-500'>
                              <FiUser className='w-4 h-4' />
                              <span>
                                {record.patientId.firstName}{' '}
                                {record.patientId.lastName}
                              </span>
                              <span>•</span>
                              <span>
                                {calculateAge(record.patientId.dateOfBirth)}{' '}
                                years
                              </span>
                              <span>•</span>
                              <span className='capitalize'>
                                {record.patientId.gender.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Record Type */}
                      <div className='col-span-2'>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRecordTypeColor(record.recordType)}`}
                        >
                          {getRecordTypeIcon(record.recordType)}
                          {getRecordTypeLabel(record.recordType)}
                        </span>
                      </div>

                      {/* Date */}
                      <div className='col-span-2'>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <FiCalendar className='w-4 h-4' />
                          <span>{formatDate(record.date)}</span>
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          Created {formatDate(record.createdAt)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className='col-span-2'>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.status.charAt(0) +
                            record.status.slice(1).toLowerCase()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className='col-span-2'>
                        <div className='flex items-center gap-2 justify-end'>
                          {/* File Download Buttons */}
                          {record.attachments
                            .slice(0, 2)
                            .map((filename, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  handleDownloadFile(filename, record._id)
                                }
                                disabled={downloading === record._id}
                                className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                                title={`Download ${filename}`}
                              >
                                {getFileIcon(filename)}
                              </button>
                            ))}
                          {record.attachments.length > 2 && (
                            <span
                              className='text-xs text-gray-500'
                              title={`${record.attachments.length - 2} more files`}
                            >
                              +{record.attachments.length - 2}
                            </span>
                          )}

                          <button
                            onClick={() => handleViewRecord(record._id)}
                            className='flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                          >
                            <FiEye className='w-4 h-4' />
                          </button>

                          <button
                            onClick={() =>
                              router.push(`/doctor/records/${record._id}/edit`)
                            }
                            className='flex items-center gap-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded transition-colors'
                          >
                            <FiEdit className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className='mt-3 pt-3 border-t border-gray-200'>
                    <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                      {record.attachments.length > 0 && (
                        <div className='flex items-center gap-1'>
                          <FiDownload className='w-4 h-4' />
                          <span>{record.attachments.length} file(s)</span>
                        </div>
                      )}

                      {record.doctorNotes && (
                        <div className='flex items-center gap-1 flex-1 min-w-0'>
                          <FiFileText className='w-4 h-4 shrink-0' />
                          <span className='truncate' title={record.doctorNotes}>
                            {record.doctorNotes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination and Load More */}
        {filteredRecords.length > 0 && (
          <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-600'>
              Showing {filteredRecords.length} of {records.length} records
            </div>

            <div className='flex items-center gap-2'>
              <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                <FiArrowRight className='w-4 h-4 rotate-180' />
                Previous
              </button>
              <button className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                Next
                <FiArrowRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
