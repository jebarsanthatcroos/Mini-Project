'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit3,
  FiSave,
  FiX,
  FiShield,
  FiAward,
  FiBriefcase,
  FiClock,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface LabTechnician {
  id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    avatar?: string;
  };
  employeeId: string;
  specialization: string;
  qualifications: string[];
  licenseNumber: string;
  licenseExpiry: string;
  department: string;
  yearsOfExperience: number;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  isActive: boolean;
  joinedDate: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  qualifications: string;
  licenseNumber: string;
  licenseExpiry: string;
  department: string;
  yearsOfExperience: number;
  shift: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
}

export default function LabTechnicianProfilePage() {
  const [profile, setProfile] = useState<LabTechnician | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    qualifications: '',
    licenseNumber: '',
    licenseExpiry: '',
    department: '',
    yearsOfExperience: 0,
    shift: 'MORNING',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/lab/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        initializeFormData(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');

      // Load mock data for development
      const mockProfile = getMockProfile();
      setProfile(mockProfile);
      initializeFormData(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const getMockProfile = (): LabTechnician => ({
    id: 'lab1',
    userId: {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@medicalab.com',
      phone: '+1234567890',
      dateOfBirth: '1990-08-15',
      gender: 'FEMALE',
      avatar: '/avatars/lab-technician.jpg',
    },
    employeeId: 'LAB-2023-001',
    specialization: 'Clinical Pathology',
    qualifications: ['MT(ASCP)', 'MLS'],
    licenseNumber: 'CLT-123456',
    licenseExpiry: '2025-12-31',
    department: 'Clinical Laboratory',
    yearsOfExperience: 8,
    shift: 'MORNING',
    isActive: true,
    joinedDate: '2023-01-15',
    emergencyContact: {
      name: 'Michael Chen',
      relationship: 'Spouse',
      phone: '+1234567891',
    },
  });

  const initializeFormData = (profileData: LabTechnician) => {
    setFormData({
      firstName: profileData.userId.firstName,
      lastName: profileData.userId.lastName,
      phone: profileData.userId.phone,
      specialization: profileData.specialization,
      qualifications: profileData.qualifications.join(', '),
      licenseNumber: profileData.licenseNumber,
      licenseExpiry: profileData.licenseExpiry,
      department: profileData.department,
      yearsOfExperience: profileData.yearsOfExperience,
      shift: profileData.shift,
      emergencyContactName: profileData.emergencyContact?.name || '',
      emergencyContactRelationship:
        profileData.emergencyContact?.relationship || '',
      emergencyContactPhone: profileData.emergencyContact?.phone || '',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/lab/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          qualifications: formData.qualifications
            .split(',')
            .map(q => q.trim())
            .filter(q => q),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
        // Show success message
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      initializeFormData(profile);
    }
    setIsEditing(false);
    setError(null);
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'MORNING':
        return 'bg-green-100 text-green-800';
      case 'EVENING':
        return 'bg-orange-100 text-orange-800';
      case 'NIGHT':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case 'MORNING':
        return 'Morning Shift';
      case 'EVENING':
        return 'Evening Shift';
      case 'NIGHT':
        return 'Night Shift';
      default:
        return shift;
    }
  };

  if (loading) return <Loading />;
  if (error && !profile) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <div>
              <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Lab Technician Profile
              </h1>
              <p className='text-gray-600 mt-2'>
                Manage your professional information and settings
              </p>
            </div>

            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl'
              >
                <FiEdit3 />
                Edit Profile
              </motion.button>
            ) : (
              <div className='flex gap-3'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className='flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300'
                >
                  <FiX />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl'
                >
                  {saving ? (
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <FiSave />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3'
            >
              <FiX className='text-red-500 text-xl shrink-0' />
              <div className='flex-1'>
                <p className='text-red-800 text-sm'>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className='text-red-600 hover:text-red-800 text-sm font-medium shrink-0'
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Sidebar - Profile Summary */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20'
            >
              <div className='text-center'>
                <div className='relative mx-auto w-24 h-24 mb-4'>
                  <div className='w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                    {profile?.userId.firstName.charAt(0)}
                    {profile?.userId.lastName.charAt(0)}
                  </div>
                </div>

                <h2 className='text-xl font-bold text-gray-900'>
                  {profile?.userId.firstName} {profile?.userId.lastName}
                </h2>
                <p className='text-gray-600 mb-2'>{profile?.specialization}</p>

                <div className='flex items-center justify-center gap-2 text-sm text-gray-500 mb-4'>
                  <FiBriefcase />
                  <span>{profile?.department}</span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getShiftColor(profile?.shift || '')}`}
                >
                  <FiClock className='text-sm' />
                  {getShiftLabel(profile?.shift || '')}
                </div>
              </div>

              <div className='mt-6 space-y-3'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>Employee ID</span>
                  <span className='font-mono font-semibold text-gray-900'>
                    {profile?.employeeId}
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>Experience</span>
                  <span className='font-semibold text-gray-900'>
                    {profile?.yearsOfExperience} years
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>Status</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${profile?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20'
            >
              <h3 className='font-semibold text-gray-900 mb-4'>Quick Stats</h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>Tests Today</span>
                  <span className='font-semibold text-blue-600'>24</span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>Pending Results</span>
                  <span className='font-semibold text-orange-600'>8</span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>Accuracy Rate</span>
                  <span className='font-semibold text-green-600'>99.2%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-2 border border-white/20'
            >
              <div className='flex space-x-1'>
                {['personal', 'professional', 'emergency'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                  >
                    {tab === 'personal' && 'Personal Info'}
                    {tab === 'professional' && 'Professional Info'}
                    {tab === 'emergency' && 'Emergency Contact'}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Personal Information */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                  Personal Information
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      First Name *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.userId.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Last Name *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.userId.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <div className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl'>
                      <FiMail className='text-gray-400' />
                      <span className='text-gray-900'>
                        {profile?.userId.email}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      Contact admin to change email
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number *
                    </label>
                    {isEditing ? (
                      <div className='relative'>
                        <FiPhone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                          type='tel'
                          name='phone'
                          value={formData.phone}
                          onChange={handleInputChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                        />
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl'>
                        <FiPhone className='text-gray-400' />
                        <span className='text-gray-900'>
                          {profile?.userId.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Date of Birth
                    </label>
                    <div className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl'>
                      <FiCalendar className='text-gray-400' />
                      <span className='text-gray-900'>
                        {profile?.userId.dateOfBirth
                          ? new Date(
                              profile.userId.dateOfBirth
                            ).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Gender
                    </label>
                    <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl capitalize'>
                      {profile?.userId.gender.toLowerCase()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Professional Information */}
            {activeTab === 'professional' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                  Professional Information
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Specialization *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='specialization'
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.specialization}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Department *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='department'
                        value={formData.department}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.department}
                      </p>
                    )}
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Qualifications *
                    </label>
                    {isEditing ? (
                      <textarea
                        name='qualifications'
                        value={formData.qualifications}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder='Enter qualifications separated by commas'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 resize-none'
                      />
                    ) : (
                      <div className='px-4 py-3 bg-gray-50 rounded-xl'>
                        <div className='flex flex-wrap gap-2'>
                          {profile?.qualifications.map(
                            (qualification, index) => (
                              <span
                                key={index}
                                className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'
                              >
                                <FiAward className='text-xs' />
                                {qualification}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      License Number *
                    </label>
                    {isEditing ? (
                      <div className='relative'>
                        <FiShield className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                          type='text'
                          name='licenseNumber'
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                        />
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl'>
                        <FiShield className='text-gray-400' />
                        <span className='text-gray-900'>
                          {profile?.licenseNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      License Expiry *
                    </label>
                    {isEditing ? (
                      <input
                        type='date'
                        name='licenseExpiry'
                        value={formData.licenseExpiry}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.licenseExpiry
                          ? new Date(profile.licenseExpiry).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Years of Experience *
                    </label>
                    {isEditing ? (
                      <input
                        type='number'
                        name='yearsOfExperience'
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        min='0'
                        max='50'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.yearsOfExperience} years
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Work Shift *
                    </label>
                    {isEditing ? (
                      <select
                        name='shift'
                        value={formData.shift}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      >
                        <option value='MORNING'>Morning Shift</option>
                        <option value='EVENING'>Evening Shift</option>
                        <option value='NIGHT'>Night Shift</option>
                      </select>
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {getShiftLabel(profile?.shift || '')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Emergency Contact */}
            {activeTab === 'emergency' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20'
              >
                <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                  Emergency Contact
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Contact Name *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='emergencyContactName'
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.emergencyContact?.name || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Relationship *
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        name='emergencyContactRelationship'
                        value={formData.emergencyContactRelationship}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                      />
                    ) : (
                      <p className='px-4 py-3 text-gray-900 bg-gray-50 rounded-xl'>
                        {profile?.emergencyContact?.relationship ||
                          'Not provided'}
                      </p>
                    )}
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number *
                    </label>
                    {isEditing ? (
                      <div className='relative'>
                        <FiPhone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                          type='tel'
                          name='emergencyContactPhone'
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                        />
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl'>
                        <FiPhone className='text-gray-400' />
                        <span className='text-gray-900'>
                          {profile?.emergencyContact?.phone || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
