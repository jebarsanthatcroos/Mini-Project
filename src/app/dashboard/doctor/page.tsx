'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { StatsCards } from '@/components/Doctor/StatsCards';
import { UpcomingAppointments } from '@/components/Doctor/UpcomingAppointments';
import { QuickActions } from '@/components/Doctor/QuickActions';
import { RecentActivity } from '@/components/Doctor/RecentActivity';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/models/User';
import PatientSearch from '@/components/Patient/Search/PatientSearch';
import { Patient } from '@/types/patient';

interface DoctorStats {
  totalPatients: number;
  appointmentsToday: number;
  monthlyEarnings: number;
  averageRating: number;
}

interface DoctorSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    phone?: string;
    department?: string;
    specialization?: string;
    licenseNumber?: string;
    address?: string;
    bio?: string;
    isActive?: boolean;
    lastLogin?: Date;
  };
  accessToken?: string;
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Patient search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>('');

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (status === 'loading') return;

    const doctorSession = session as DoctorSession | null;

    if (!doctorSession || doctorSession.user?.role !== 'DOCTOR') {
      router.push('/auth/signin');
      return;
    }

    fetchDoctorStats();
  }, [session, status, router]);
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      performSearch(debouncedSearchTerm);
    } else {
      setFilteredPatients([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const fetchDoctorStats = async () => {
    try {
      const mockStats: DoctorStats = {
        totalPatients: 1247,
        appointmentsToday: 8,
        monthlyEarnings: 12500,
        averageRating: 4.8,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // API call to search patients
  const searchPatients = async (query: string): Promise<Patient[]> => {
    try {
      console.log('Searching for:', query); // Debug log

      const response = await fetch(
        `/api/patients/search?q=${encodeURIComponent(query)}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Remove Authorization header if you're using session-based auth
        }
      );

      console.log('Search response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('Search results:', data); // Debug log

      return data.patients || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  };

  const performSearch = async (query: string) => {
    setIsSearchLoading(true);
    setSearchError('');

    try {
      const patients = await searchPatients(query);
      setFilteredPatients(patients);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : 'Failed to search patients'
      );
      setFilteredPatients([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Patient search handlers
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);

    if (term.length < 2) {
      setFilteredPatients([]);
      setSearchError('');
    }
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    console.log('Selected patient:', patient);
    // Navigate to patient details
    router.push(`/doctor/patients/${patient._id}`);
    setShowPatientDropdown(false);
    setSearchTerm('');
  };

  const handleAddNewPatient = () => {
    router.push('/doctor/patients/new');
    setShowPatientDropdown(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  if (status === 'loading' || loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const doctorSession = session as DoctorSession | null;

  if (!doctorSession || doctorSession.user?.role !== 'DOCTOR') {
    return null;
  }

  const { user } = doctorSession;

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='bg-white rounded-lg shadow-sm p-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Welcome back, Dr. {user.name}!
            </h1>
            <p className='text-gray-600 mt-2'>
              {user.department} • {user.specialization}
            </p>
            <div className='flex items-center mt-3 space-x-4 text-sm text-gray-500'>
              <span>License: {user.licenseNumber}</span>
              <span>•</span>
              <span>
                Last login:{' '}
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : 'First login'}
              </span>
              <span>•</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || 'Profile'}
                width={32}
                height={32}
                className='w-12 h-12 rounded-full border-2 border-gray-200'
              />
            )}
            <Button
              variant='outline'
              onClick={handleSignOut}
              className='border-red-200 text-red-600 hover:bg-red-50'
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Patient Search */}
      <div className='bg-white rounded-lg shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Patient Search
        </h2>
        <p className='text-sm text-gray-600 mb-4'>
          Search patients by name, email, NIC, or phone number
        </p>
        <PatientSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onShowDropdown={setShowPatientDropdown}
          onPatientSelect={handlePatientSelect}
          filteredPatients={filteredPatients}
          showPatientDropdown={showPatientDropdown}
          isLoading={isSearchLoading}
          error={searchError}
          onAddNewPatient={handleAddNewPatient}
        />
      </div>

      {/* Rest of your dashboard components */}
      {stats && <StatsCards stats={stats} />}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <UpcomingAppointments />
        </div>
        <div className='space-y-6'>
          <QuickActions />
          <RecentActivity />
        </div>
      </div>

      {/* Doctor Profile Summary */}
      <div className='bg-white rounded-lg shadow-sm p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Profile Summary
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div>
            <h4 className='text-sm font-medium text-gray-600'>
              Contact Information
            </h4>
            <p className='mt-1 text-sm text-gray-900'>
              {user.phone || 'Not provided'}
            </p>
            <p className='text-sm text-gray-600'>{user.email}</p>
          </div>
          <div>
            <h4 className='text-sm font-medium text-gray-600'>Address</h4>
            <p className='mt-1 text-sm text-gray-900'>
              {user.address || 'Not provided'}
            </p>
          </div>
          <div>
            <h4 className='text-sm font-medium text-gray-600'>Bio</h4>
            <p className='mt-1 text-sm text-gray-900'>
              {user.bio || 'No bio provided'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
