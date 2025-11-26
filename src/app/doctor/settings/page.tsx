// app/doctor/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DoctorSettings {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  bio: string;
  consultationFee: number;
  availableHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

// eslint-disable-next-line no-redeclare
export default function DoctorSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [settings, setSettings] = useState<DoctorSettings>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    hospital: '',
    bio: '',
    consultationFee: 0,
    availableHours: {
      start: '09:00',
      end: '17:00',
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (session?.user?.role !== 'DOCTOR') {
      router.push('/unauthorized');
    }

    if (session?.user) {
      fetchDoctorSettings();
    }
  }, [session, status, router]);

  const fetchDoctorSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/settings');

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        setMessage({ type: 'error', content: 'Failed to load settings' });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', content: 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-undef
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/doctor/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          content: 'Settings updated successfully!',
        });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          content: error.error || 'Failed to update settings',
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', content: 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    // eslint-disable-next-line no-undef
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof DoctorSettings] as object),
          [child]: value,
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleWorkingDayChange = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Doctor Settings
            </h1>
            <p className='mt-1 text-sm text-gray-600'>
              Manage your profile and practice settings
            </p>
          </div>

          {message.content && (
            <div
              className={`mx-6 mt-4 p-4 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.content}
            </div>
          )}

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Personal Information */}
            <div>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Personal Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={settings.name}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={settings.email}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50'
                    disabled
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={settings.phone}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='specialization'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Specialization
                  </label>
                  <select
                    id='specialization'
                    name='specialization'
                    value={settings.specialization}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Select Specialization</option>
                    <option value='Cardiology'>Cardiology</option>
                    <option value='Dermatology'>Dermatology</option>
                    <option value='Neurology'>Neurology</option>
                    <option value='Pediatrics'>Pediatrics</option>
                    <option value='Orthopedics'>Orthopedics</option>
                    <option value='Psychiatry'>Psychiatry</option>
                    <option value='Surgery'>Surgery</option>
                    <option value='Internal Medicine'>Internal Medicine</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Professional Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='licenseNumber'
                    className='block text-sm font-medium text-gray-700'
                  >
                    License Number
                  </label>
                  <input
                    type='text'
                    id='licenseNumber'
                    name='licenseNumber'
                    value={settings.licenseNumber}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='hospital'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Hospital/Clinic
                  </label>
                  <input
                    type='text'
                    id='hospital'
                    name='hospital'
                    value={settings.hospital}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='consultationFee'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Consultation Fee ($)
                  </label>
                  <input
                    type='number'
                    id='consultationFee'
                    name='consultationFee'
                    value={settings.consultationFee}
                    onChange={handleChange}
                    min='0'
                    step='0.01'
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>

              <div className='mt-4'>
                <label
                  htmlFor='bio'
                  className='block text-sm font-medium text-gray-700'
                >
                  Bio/Description
                </label>
                <textarea
                  id='bio'
                  name='bio'
                  rows={4}
                  value={settings.bio}
                  onChange={handleChange}
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Tell patients about your experience and expertise...'
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Availability
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label
                    htmlFor='availableHours.start'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Start Time
                  </label>
                  <input
                    type='time'
                    id='availableHours.start'
                    name='availableHours.start'
                    value={settings.availableHours.start}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label
                    htmlFor='availableHours.end'
                    className='block text-sm font-medium text-gray-700'
                  >
                    End Time
                  </label>
                  <input
                    type='time'
                    id='availableHours.end'
                    name='availableHours.end'
                    value={settings.availableHours.end}
                    onChange={handleChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Working Days
                </label>
                <div className='flex flex-wrap gap-4'>
                  {[
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ].map(day => (
                    <label key={day} className='inline-flex items-center'>
                      <input
                        type='checkbox'
                        checked={settings.workingDays.includes(day)}
                        onChange={() => handleWorkingDayChange(day)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='ml-2 text-sm text-gray-700 capitalize'>
                        {day}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => router.back()}
                className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={saving}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
