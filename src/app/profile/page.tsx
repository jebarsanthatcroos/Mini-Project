/* eslint-disable no-undef */
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiMapPin,
  FiBriefcase,
  FiAward,
  FiAlertCircle,
} from 'react-icons/fi';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  address: string;
  bio: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    address: '',
    bio: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        specialization: user.specialization || '',
        address: user.address || '',
        bio:
          user.bio ||
          'Healthcare professional dedicated to providing excellent patient care.',
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          specialization: formData.specialization,
          address: formData.address,
          bio: formData.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');

      // Update session to reflect changes
      await update();

      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        specialization: user.specialization || '',
        address: user.address || '',
        bio:
          user.bio ||
          'Healthcare professional dedicated to providing excellent patient care.',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      DOCTOR: 'bg-blue-100 text-blue-800 border-blue-200',
      NURSE: 'bg-green-100 text-green-800 border-green-200',
      PATIENT: 'bg-purple-100 text-purple-800 border-purple-200',
      RECEPTIONIST: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LABTECH: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      PHARMACIST: 'bg-pink-100 text-pink-800 border-pink-200',
      STAFF: 'bg-gray-100 text-gray-800 border-gray-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const roleNames = {
      ADMIN: 'Administrator',
      DOCTOR: 'Medical Doctor',
      NURSE: 'Registered Nurse',
      PATIENT: 'Patient',
      RECEPTIONIST: 'Receptionist',
      LABTECH: 'Laboratory Technician',
      PHARMACIST: 'Pharmacist',
      STAFF: 'Staff Member',
      USER: 'User',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleColors[role as keyof typeof roleColors] || roleColors.USER}`}
      >
        <FiShield className='mr-1 h-4 w-4' />
        {roleNames[role as keyof typeof roleNames] || role}
      </span>
    );
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Success/Error Messages */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-md p-4'>
            <div className='flex items-center'>
              <FiAlertCircle className='h-5 w-5 text-red-400 mr-2' />
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-md p-4'>
            <div className='flex items-center'>
              <FiAlertCircle className='h-5 w-5 text-green-400 mr-2' />
              <p className='text-green-800 text-sm'>{success}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='h-32 bg-linear-to-r from-blue-600 to-blue-700'></div>

          {/* Profile Header */}
          <div className='px-6 pb-6'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-12'>
              {/* Avatar and Basic Info */}
              <div className='flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4'>
                <div className='relative'>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className='h-24 w-24 rounded-full border-4 border-white bg-white'
                      src={user.image}
                      alt={user.name || 'User'}
                    />
                  ) : (
                    <div className='h-24 w-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center'>
                      <FiUser className='h-12 w-12 text-gray-600' />
                    </div>
                  )}
                  {isEditing && (
                    <button className='absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors'>
                      <FiCamera className='h-4 w-4' />
                    </button>
                  )}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center space-x-3'>
                    {isEditing ? (
                      <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        className='text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    ) : (
                      <h1 className='text-2xl font-bold text-gray-900'>
                        {user.name}
                      </h1>
                    )}
                    {getRoleBadge(user.role || 'USER')}
                  </div>
                  <p className='text-gray-600 flex items-center'>
                    <FiMail className='mr-2 h-4 w-4' />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='mt-4 sm:mt-0'>
                {isEditing ? (
                  <div className='flex space-x-3'>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors'
                    >
                      <FiX className='h-4 w-4' />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors'
                    >
                      <FiSave className='h-4 w-4' />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                  >
                    <FiEdit3 className='h-4 w-4' />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className='mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Personal Information */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Contact Information */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Contact Information
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <FiMail className='h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-500'>Email</p>
                      <p className='text-gray-900'>{user.email}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <FiPhone className='h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-500'>Phone</p>
                      {isEditing ? (
                        <input
                          type='tel'
                          name='phone'
                          value={formData.phone}
                          onChange={handleInputChange}
                          className='w-full text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          placeholder='Enter phone number'
                          pattern='^\+?[\d\s-()]+$'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {user.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <FiMapPin className='h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-500'>
                        Address
                      </p>
                      {isEditing ? (
                        <input
                          type='text'
                          name='address'
                          value={formData.address}
                          onChange={handleInputChange}
                          className='w-full text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          placeholder='Enter your address'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {user.address || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            {(user.role === 'DOCTOR' ||
              user.role === 'NURSE' ||
              user.role === 'LABTECH' ||
              user.role === 'PHARMACIST') && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Professional Information
                </h2>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <FiBriefcase className='h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-500'>
                        Department
                      </p>
                      {isEditing ? (
                        <input
                          type='text'
                          name='department'
                          value={formData.department}
                          onChange={handleInputChange}
                          className='w-full text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          placeholder='Enter department'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {user.department || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <FiAward className='h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-500'>
                        Specialization
                      </p>
                      {isEditing ? (
                        <input
                          type='text'
                          name='specialization'
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className='w-full text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          placeholder='Enter specialization'
                        />
                      ) : (
                        <p className='text-gray-900'>
                          {user.specialization || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                About
              </h2>
              {isEditing ? (
                <textarea
                  name='bio'
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className='w-full text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Tell us about yourself...'
                />
              ) : (
                <p className='text-gray-700 leading-relaxed'>
                  {user.bio || formData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Stats and Additional Info */}
          <div className='space-y-6'>
            {/* Account Status */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Account Status
              </h2>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Member Since</span>
                  <span className='text-sm font-medium text-gray-900 flex items-center'>
                    <FiCalendar className='mr-1 h-4 w-4' />
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Status</span>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    Active
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Email Verified</span>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h2>
              <div className='space-y-2'>
                <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                  Change Password
                </button>
                <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                  Notification Settings
                </button>
                <button className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                  Privacy Settings
                </button>
                <button className='w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors'>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
