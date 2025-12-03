import React from 'react';
import { DoctorSettings } from '@/types/doctor';

interface ProfessionalInfoSectionProps {
  settings: DoctorSettings;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({
  settings,
  onChange,
}) => {
  return (
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
          onChange={onChange}
          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='Tell patients about your experience and expertise...'
        />
      </div>
    </div>
  );
};

export default ProfessionalInfoSection;
