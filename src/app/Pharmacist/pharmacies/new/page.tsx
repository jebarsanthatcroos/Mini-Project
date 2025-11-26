/* eslint-disable no-undef */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiSave,
  FiMapPin,
  FiPhone,
  FiClock,
  FiPackage,
} from 'react-icons/fi';

const defaultOperatingHours = {
  Monday: '9:00 AM - 6:00 PM',
  Tuesday: '9:00 AM - 6:00 PM',
  Wednesday: '9:00 AM - 6:00 PM',
  Thursday: '9:00 AM - 6:00 PM',
  Friday: '9:00 AM - 6:00 PM',
  Saturday: '9:00 AM - 2:00 PM',
  Sunday: 'Closed',
};

const commonServices = [
  'Prescription Dispensing',
  'Medication Counseling',
  'Immunizations',
  'Health Screenings',
  'Compounding',
  'Delivery Service',
  'Emergency Supply',
  'Medication Therapy Management',
  'Smoking Cessation',
  'Travel Health',
];

interface FormData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    emergencyPhone: string;
  };
  operatingHours: typeof defaultOperatingHours;
  services: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  is24Hours: boolean;
}

export default function NewPharmacyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka',
    },
    contact: {
      phone: '',
      email: '',
      emergencyPhone: '',
    },
    operatingHours: { ...defaultOperatingHours },
    services: [],
    status: 'ACTIVE',
    is24Hours: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section as keyof FormData]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(prev[section as keyof FormData] as any),
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as keyof FormData]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleOperatingHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: value,
      },
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/pharmacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create pharmacy');
      }

      router.push('/Pharmacist/pharmacies');
      router.refresh();
    } catch (err) {
      console.error('Error creating pharmacy:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create pharmacy'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-6'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
          >
            <FiArrowLeft className='w-5 h-5' />
            Back to Pharmacies
          </button>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Add New Pharmacy
              </h1>
              <p className='text-gray-600 mt-2'>
                Create a new pharmacy location
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiPackage className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Basic Information */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiPackage className='w-5 h-5 text-blue-600' />
                  Basic Information
                </h2>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Pharmacy Name *
                    </label>
                    <input
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter pharmacy name'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Status
                      </label>
                      <select
                        name='status'
                        value={formData.status}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value='ACTIVE'>Active</option>
                        <option value='INACTIVE'>Inactive</option>
                        <option value='MAINTENANCE'>Maintenance</option>
                      </select>
                    </div>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='is24Hours'
                        checked={formData.is24Hours}
                        onChange={handleInputChange}
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                      />
                      <label className='ml-2 text-sm text-gray-700'>
                        24/7 Operation
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiMapPin className='w-5 h-5 text-green-600' />
                  Address Information
                </h2>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Street Address
                    </label>
                    <input
                      type='text'
                      name='address.street'
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter street address'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        City
                      </label>
                      <input
                        type='text'
                        name='address.city'
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='City'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        State
                      </label>
                      <input
                        type='text'
                        name='address.state'
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='State'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        ZIP Code
                      </label>
                      <input
                        type='text'
                        name='address.zipCode'
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='ZIP Code'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Country
                      </label>
                      <input
                        type='text'
                        name='address.country'
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Country'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiPhone className='w-5 h-5 text-purple-600' />
                  Contact Information
                </h2>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    <input
                      type='tel'
                      name='contact.phone'
                      value={formData.contact.phone}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Phone number'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      name='contact.email'
                      value={formData.contact.email}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Email address'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Emergency Phone
                    </label>
                    <input
                      type='tel'
                      name='contact.emergencyPhone'
                      value={formData.contact.emergencyPhone}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Emergency phone number'
                    />
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              {!formData.is24Hours && (
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                  <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                    <FiClock className='w-5 h-5 text-orange-600' />
                    Operating Hours
                  </h2>

                  <div className='space-y-3'>
                    {Object.entries(formData.operatingHours).map(
                      ([day, hours]) => (
                        <div
                          key={day}
                          className='flex items-center justify-between'
                        >
                          <label className='text-sm font-medium text-gray-700 w-32 capitalize'>
                            {day}
                          </label>
                          <input
                            type='text'
                            value={hours}
                            onChange={e =>
                              handleOperatingHoursChange(day, e.target.value)
                            }
                            className='flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='e.g., 9:00 AM - 6:00 PM'
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Services */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Services Offered
                </h2>

                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {commonServices.map(service => (
                    <div key={service} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                      />
                      <label
                        htmlFor={`service-${service}`}
                        className='ml-2 text-sm text-gray-700'
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Actions
                </h2>

                <div className='space-y-3'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                  >
                    <FiSave className='w-5 h-5' />
                    {saving ? 'Creating...' : 'Create Pharmacy'}
                  </button>

                  <button
                    type='button'
                    onClick={() => router.back()}
                    className='w-full text-gray-600 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
