import React from 'react';
import { DoctorSettings } from '@/types/doctor';

interface AvailabilitySectionProps {
  settings: DoctorSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWorkingDayChange: (day: string) => void;
}

const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
  settings,
  onChange,
  onWorkingDayChange,
}) => {
  return (
    <div>
      <h2 className='text-lg font-medium text-gray-900 mb-4'>Availability</h2>

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
            onChange={onChange}
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
            onChange={onChange}
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
                onChange={() => onWorkingDayChange(day)}
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
  );
};

export default AvailabilitySection;
