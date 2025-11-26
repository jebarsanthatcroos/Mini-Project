'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  bio: string;
  consultationFee: number;
  availableHours?: {
    start: string;
    end: string;
  };
  workingDays?: string[];
  experience?: number;
  education?: string[];
  awards?: string[];
  profilePicture?: string;
  createdAt: string;
}

interface Stats {
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  averageRating: number;
  totalRatings?: number;
  recentRecords?: number;
  todayAppointments?: number;
}

// Default values for missing data
const defaultAvailableHours = {
  start: '09:00',
  end: '17:00',
};

const defaultWorkingDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

// eslint-disable-next-line no-redeclare
export default function DoctorProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (session?.user?.role !== 'DOCTOR') {
      router.push('/unauthorized');
    }

    if (session?.user) {
      fetchDoctorProfile();
      fetchDoctorStats();
    }
  }, [session, status, router]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch('/api/doctor/profile');

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      // Fixed: Using the correct API endpoint
      const response = await fetch('/api/doctor/profile/stats');

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        console.error('Failed to load stats');
        // Set default stats if API fails
        setStats({
          totalPatients: 0,
          totalAppointments: 0,
          upcomingAppointments: 0,
          averageRating: 4.5,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalPatients: 0,
        totalAppointments: 0,
        upcomingAppointments: 0,
        averageRating: 4.5,
      });
    }
  };

  // Safe data access with fallbacks
  const availableHours = profile?.availableHours || defaultAvailableHours;
  const workingDays = profile?.workingDays || defaultWorkingDays;
  const bio = profile?.bio || 'No bio provided.';
  const experience = profile?.experience || 0;
  const education = profile?.education || [];
  const awards = profile?.awards || [];
  const profilePicture = profile?.profilePicture || null;
  const consultationFee = profile?.consultationFee || 0;

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return time; // Return original time if formatting fails
    }
  };

  const formatWorkingDays = (days: string[]) => {
    return days
      .map(day => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
  };

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Profile not found
          </h2>
          <p className='mt-2 text-gray-600'>Unable to load doctor profile</p>
          <button
            onClick={() => router.push('/doctor/settings')}
            className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'
          >
            Complete Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='bg-white shadow rounded-lg mb-8'>
          <div className='px-6 py-8 sm:px-8'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center'>
                  {profilePicture ? (
                    <Image
                      src={profilePicture}
                      alt={profile.name || 'Doctor'}
                      width={80}
                      height={80}
                      className='w-20 h-20 rounded-full object-cover'
                    />
                  ) : (
                    <span className='text-2xl font-bold text-blue-600'>
                      {profile.name?.charAt(0).toUpperCase() || 'D'}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    {profile.name || 'Doctor'}
                  </h1>
                  <p className='text-lg text-blue-600 font-medium'>
                    {profile.specialization || 'General Practitioner'}
                  </p>
                  <p className='text-gray-600'>
                    {profile.hospital || 'Medical Center'}
                  </p>
                  {stats && (
                    <div className='flex items-center mt-1'>
                      <div className='flex text-yellow-400'>
                        {'★'.repeat(Math.floor(stats.averageRating))}
                        {'☆'.repeat(5 - Math.floor(stats.averageRating))}
                      </div>
                      <span className='ml-2 text-sm text-gray-600'>
                        ({stats.averageRating.toFixed(1)})
                        {stats.totalRatings &&
                          ` • ${stats.totalRatings} reviews`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className='mt-4 sm:mt-0 flex space-x-3'>
                <Link
                  href='/doctor/settings'
                  className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Edit Profile
                </Link>
                <button className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white shadow rounded-lg'>
              {/* Stats */}
              <div className='p-6 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Practice Stats
                </h3>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600'>Total Patients</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stats?.totalPatients || 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Total Appointments</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {stats?.totalAppointments || 0}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>
                      Upcoming Appointments
                    </p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {stats?.upcomingAppointments || 0}
                    </p>
                  </div>
                  {stats?.todayAppointments !== undefined && (
                    <div>
                      <p className='text-sm text-gray-600'>
                        Today&apos;s Appointments
                      </p>
                      <p className='text-2xl font-bold text-green-600'>
                        {stats.todayAppointments}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className='p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Contact Information
                </h3>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Email</p>
                    <p className='text-gray-900'>{profile.email}</p>
                  </div>
                  {profile.phone && (
                    <div>
                      <p className='text-sm font-medium text-gray-600'>Phone</p>
                      <p className='text-gray-900'>{profile.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      License Number
                    </p>
                    <p className='text-gray-900'>
                      {profile.licenseNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className='p-6 border-t border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Availability
                </h3>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Working Hours
                    </p>
                    <p className='text-gray-900'>
                      {formatTime(availableHours.start)} -{' '}
                      {formatTime(availableHours.end)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Working Days
                    </p>
                    <p className='text-gray-900'>
                      {formatWorkingDays(workingDays)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Consultation Fee
                    </p>
                    <p className='text-lg font-bold text-green-600'>
                      ${consultationFee}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            <div className='bg-white shadow rounded-lg'>
              {/* Tabs */}
              <div className='border-b border-gray-200'>
                <nav className='flex -mb-px'>
                  {['overview', 'education', 'experience', 'reviews'].map(
                    tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-6 text-sm font-medium border-b-2 ${
                          activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className='p-6'>
                {activeTab === 'overview' && (
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-lg font-medium text-gray-900 mb-3'>
                        About Me
                      </h3>
                      <p className='text-gray-700 leading-relaxed'>{bio}</p>
                    </div>

                    {experience > 0 && (
                      <div>
                        <h3 className='text-lg font-medium text-gray-900 mb-3'>
                          Experience
                        </h3>
                        <p className='text-gray-700'>
                          {experience} years of experience in{' '}
                          {profile.specialization || 'medicine'}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className='text-lg font-medium text-gray-900 mb-3'>
                        Specializations
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                          {profile.specialization || 'General Medicine'}
                        </span>
                        {/* Add more specializations if available in the future */}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className='space-y-4'>
                    {education.length > 0 ? (
                      education.map((edu, index) => (
                        <div
                          key={index}
                          className='border-l-4 border-blue-500 pl-4 py-1'
                        >
                          <p className='text-gray-700'>{edu}</p>
                        </div>
                      ))
                    ) : (
                      <p className='text-gray-500'>
                        No education information provided.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className='space-y-4'>
                    {awards.length > 0 ? (
                      awards.map((award, index) => (
                        <div key={index} className='flex items-start space-x-3'>
                          <div className='shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                          <p className='text-gray-700'>{award}</p>
                        </div>
                      ))
                    ) : (
                      <p className='text-gray-500'>
                        No awards or achievements provided.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className='text-center py-8'>
                    <p className='text-gray-500'>
                      Reviews feature coming soon...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Link
                href='/doctor/appointments'
                className='bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow'
              >
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Appointments
                </h3>
                <p className='text-gray-600 text-sm'>
                  Manage your upcoming appointments
                </p>
              </Link>

              <Link
                href='/doctor/patients'
                className='bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow'
              >
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Patients
                </h3>
                <p className='text-gray-600 text-sm'>
                  View and manage patient records
                </p>
              </Link>

              <Link
                href='/doctor/schedule'
                className='bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow'
              >
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Schedule
                </h3>
                <p className='text-gray-600 text-sm'>
                  Set your availability and working hours
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
