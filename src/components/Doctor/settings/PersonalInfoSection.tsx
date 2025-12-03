import React from 'react';
import { DoctorSettings } from '@/types/doctor';

interface PersonalInfoSectionProps {
  settings: DoctorSettings;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  settings,
  onChange,
}) => {
  return (
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
            onChange={onChange}
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
            onChange={onChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50'
            disabled
          />
          <p className='mt-1 text-xs text-gray-500'>Email cannot be changed</p>
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
            onChange={onChange}
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
            onChange={onChange}
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
  );
};

export default PersonalInfoSection;
