'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiUser,
  FiAlertCircle,
  FiCalendar,
  FiPhone,
  FiMail,
  FiRefreshCw,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiEye,
  FiDroplet,
  FiHeart,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface Patient {
  _id: string;
  id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  medicalRecordNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate?: string;
  };
  primaryPhysician?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  age?: number;
  bmi?: number;
  name?: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/pharmacy/patients');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data.data?.patients || data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const handleDelete = async (patientId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/pharmacy/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete patient');
      }

      setPatients(prev => prev.filter(patient => patient._id !== patientId));
      setShowDeleteModal(false);
      setSelectedPatient(null);
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  };

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.userId.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.userId.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.medicalRecordNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.userId.phone.includes(searchTerm);

    const matchesGender =
      filterGender === 'all' || patient.gender === filterGender;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' ? patient.isActive : !patient.isActive);

    return matchesSearch && matchesGender && matchesStatus;
  });

  const getBMICategory = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5)
      return {
        category: 'Underweight',
        color: 'text-yellow-600 bg-yellow-100',
      };
    if (bmi < 25)
      return { category: 'Normal', color: 'text-green-600 bg-green-100' };
    if (bmi < 30)
      return { category: 'Overweight', color: 'text-orange-600 bg-orange-100' };
    return { category: 'Obese', color: 'text-red-600 bg-red-100' };
  };

  const getBloodTypeColor = (bloodType?: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-700',
    };
    return bloodType ? colors[bloodType] || 'bg-gray-100 text-gray-800' : '';
  };

  // Calculate statistics
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.isActive).length;
  const patientsWithAllergies = patients.filter(
    p => p.allergies.length > 0
  ).length;
  const averageAge =
    patients.length > 0
      ? Math.round(
          patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length
        )
      : 0;

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Patients Management
              </h1>
              <p className='text-gray-600 mt-2'>
                Manage patient records and medical information
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className='flex items-center gap-2 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
              <button
                onClick={() => router.push('/Pharmacist/patients/new')}
                className='flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FiPlus className='w-5 h-5' />
                Add New Patient
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Patients
                </p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {totalPatients}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <FiUsers className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Patients
                </p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {activePatients}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                <FiActivity className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  With Allergies
                </p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {patientsWithAllergies}
                </p>
              </div>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
                <FiAlertCircle className='w-6 h-6 text-red-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Average Age</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {averageAge}
                </p>
                <p className='text-sm text-gray-500'>years</p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
                <FiTrendingUp className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search patients by name, MRN, email, or phone...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Filters */}
            <div className='flex gap-2'>
              <select
                value={filterGender}
                onChange={e => setFilterGender(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Genders</option>
                <option value='MALE'>Male</option>
                <option value='FEMALE'>Female</option>
                <option value='OTHER'>Other</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>

              <button className='flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                <FiFilter className='w-5 h-5' />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          <AnimatePresence>
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className='bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
              >
                {/* Patient Card Header */}
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                        <FiUser className='w-6 h-6 text-blue-600' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {patient.userId.firstName} {patient.userId.lastName}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {patient.age || 'Unknown'} years •{' '}
                          {patient.gender.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      <button
                        onClick={() =>
                          router.push(`/Pharmacist/patients/${patient._id}`)
                        }
                        className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                        title='View Details'
                      >
                        <FiEye className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/Pharmacist/patients/${patient._id}/edit`
                          )
                        }
                        className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                        title='Edit Patient'
                      >
                        <FiEdit className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDeleteModal(true);
                        }}
                        className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete Patient'
                      >
                        <FiTrash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className='p-6'>
                  <div className='space-y-3 mb-4'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>MRN:</span>
                      <span className='font-mono text-gray-900'>
                        {patient.medicalRecordNumber}
                      </span>
                    </div>
                    <div className='flex items-center gap-3 text-sm'>
                      <FiMail className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-600'>
                        {patient.userId.email}
                      </span>
                    </div>
                    <div className='flex items-center gap-3 text-sm'>
                      <FiPhone className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-600'>
                        {patient.userId.phone}
                      </span>
                    </div>
                    <div className='flex items-center gap-3 text-sm'>
                      <FiCalendar className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-600'>
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className='grid grid-cols-2 gap-3 mb-4'>
                    {patient.bloodType && (
                      <div className='flex items-center gap-2'>
                        <FiDroplet className='w-4 h-4 text-red-500' />
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getBloodTypeColor(patient.bloodType)}`}
                        >
                          {patient.bloodType}
                        </span>
                      </div>
                    )}
                    {patient.bmi && (
                      <div className='flex items-center gap-2'>
                        <FiHeart className='w-4 h-4 text-green-500' />
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getBMICategory(patient.bmi)?.color}`}
                        >
                          BMI: {patient.bmi}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Allergies & Conditions */}
                  <div className='space-y-2'>
                    {patient.allergies.length > 0 && (
                      <div>
                        <p className='text-xs font-medium text-gray-500 mb-1'>
                          Allergies
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {patient.allergies.slice(0, 2).map((allergy, idx) => (
                            <span
                              key={idx}
                              className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'
                            >
                              {allergy}
                            </span>
                          ))}
                          {patient.allergies.length > 2 && (
                            <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                              +{patient.allergies.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {patient.chronicConditions.length > 0 && (
                      <div>
                        <p className='text-xs font-medium text-gray-500 mb-1'>
                          Conditions
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {patient.chronicConditions
                            .slice(0, 2)
                            .map((condition, idx) => (
                              <span
                                key={idx}
                                className='px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full'
                              >
                                {condition}
                              </span>
                            ))}
                          {patient.chronicConditions.length > 2 && (
                            <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                              +{patient.chronicConditions.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className='mt-4 flex justify-between items-center'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        patient.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() =>
                        router.push(`/Pharmacist/patients/${patient._id}`)
                      }
                      className='text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors'
                    >
                      View Full Profile →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <FiUser className='w-12 h-12 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {searchTerm || filterGender !== 'all' || filterStatus !== 'all'
                ? 'No patients match your criteria'
                : 'No patients found'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchTerm || filterGender !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first patient.'}
            </p>
            {searchTerm || filterGender !== 'all' || filterStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterGender('all');
                  setFilterStatus('all');
                }}
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => router.push('/Pharmacist/patients/new')}
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Add New Patient
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-lg p-6 max-w-md w-full'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <FiAlertCircle className='w-5 h-5 text-red-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Delete Patient
                </h3>
              </div>

              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete{' '}
                <strong>
                  {selectedPatient.userId.firstName}{' '}
                  {selectedPatient.userId.lastName}
                </strong>
                ? This action cannot be undone and all associated medical
                records will be permanently removed.
              </p>

              <div className='flex gap-3 justify-end'>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPatient(null);
                  }}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedPatient._id)}
                  disabled={deleting}
                  className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors'
                >
                  {deleting ? 'Deleting...' : 'Delete Patient'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
