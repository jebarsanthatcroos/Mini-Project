import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  genderFilter: string;
  onGenderFilterChange: (value: string) => void;
  ageFilter: string;
  onAgeFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  searchTerm,
  onSearchChange,
  genderFilter,
  onGenderFilterChange,
  ageFilter,
  onAgeFilterChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Search patients...'
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <select
          value={genderFilter}
          onChange={e => onGenderFilterChange(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='ALL'>All Genders</option>
          <option value='MALE'>Male</option>
          <option value='FEMALE'>Female</option>
          <option value='OTHER'>Other</option>
        </select>

        <select
          value={ageFilter}
          onChange={e => onAgeFilterChange(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='ALL'>All Ages</option>
          <option value='CHILD'>Children (&lt;18)</option>
          <option value='ADULT'>Adults (18-64)</option>
          <option value='SENIOR'>Seniors (65+)</option>
        </select>

        <select
          value={sortBy}
          onChange={e => onSortByChange(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='name'>Sort by Name</option>
          <option value='age'>Sort by Age</option>
          <option value='recent'>Sort by Recent</option>
          <option value='gender'>Sort by Gender</option>
        </select>
      </div>
    </div>
  );
};

export default PatientFilters;
