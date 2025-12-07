import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiSearch } from 'react-icons/fi';
import { AppointmentFormData } from '@/types/appointment';
import { DoctorProfile } from '@/types/doctor';

interface DoctorSelectionProps {
  formData: AppointmentFormData;
  doctorProfiles?: DoctorProfile[];
  filteredDoctorProfiles: DoctorProfile[];
  searchTerm: string;
  showDoctorDropdown: boolean;
  formErrors: Record<string, string>;
  onSearchChange: (value: string) => void;
  onDoctorSelect: (doctor: DoctorProfile) => void;
  onShowDropdown: (show: boolean) => void;
  getSelectedDoctor: () => DoctorProfile | undefined;
}

const DoctorSelection: React.FC<DoctorSelectionProps> = ({
  formData,
  filteredDoctorProfiles = [],
  searchTerm,
  showDoctorDropdown,
  formErrors,
  onSearchChange,
  onDoctorSelect,
  onShowDropdown,
  getSelectedDoctor,
}) => {
  const handleSearchClick = () => {
    onShowDropdown(true);
  };

  const selectedDoctor = getSelectedDoctor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <FiUser className='w-5 h-5 text-blue-600' />
        Doctor Information
      </h2>

      <div className='space-y-4'>
        <div className='relative'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Select Doctor *
          </label>

          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                name='doctorSearch'
                placeholder='Search doctors by name, specialization, or license...'
                value={searchTerm}
                onChange={e => {
                  onSearchChange(e.target.value);
                  onShowDropdown(true);
                }}
                onFocus={() => onShowDropdown(true)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.doctorId ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>

            <button
              type='button'
              onClick={handleSearchClick}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center gap-2 whitespace-nowrap'
            >
              <FiSearch className='w-4 h-4' />
              Search
            </button>
          </div>

          {/* Dropdown List */}
          {showDoctorDropdown && filteredDoctorProfiles?.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto'>
              {filteredDoctorProfiles.map(doctor => (
                <div
                  key={doctor._id}
                  onClick={() => {
                    onDoctorSelect(doctor);
                    onShowDropdown(false);
                  }}
                  className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                >
                  <div className='font-medium text-gray-900'>
                    Dr. {doctor.name}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {doctor.specialization} • License: {doctor.licenseNumber}
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {doctor.hospital} • {doctor.department}
                    {doctor.experience && ` • ${doctor.experience} years exp`}
                    {!doctor.isVerified && ' • Not Verified'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDoctorDropdown &&
            searchTerm &&
            filteredDoctorProfiles?.length === 0 && (
              <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4'>
                <p className='text-sm text-gray-500 text-center'>
                  No doctors found matching &quot;{searchTerm}&quot;
                </p>
              </div>
            )}

          {formErrors.doctorId && (
            <p className='mt-1 text-sm text-red-600'>{formErrors.doctorId}</p>
          )}
        </div>

        {/* Selected Doctor Display */}
        {selectedDoctor && formData.doctorId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className='bg-blue-50 border border-blue-200 rounded-lg p-4'
          >
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium text-blue-900'>Selected Doctor</h3>
              <button
                type='button'
                onClick={() => {
                  onDoctorSelect({ _id: '' } as DoctorProfile);
                  onSearchChange('');
                }}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium'
              >
                Change Doctor
              </button>
            </div>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-blue-700'>Name:</span>
                <p className='text-blue-900 font-medium'>
                  Dr. {selectedDoctor.name}
                </p>
              </div>
              <div>
                <span className='text-blue-700'>Specialization:</span>
                <p className='text-blue-900'>{selectedDoctor.specialization}</p>
              </div>
              <div>
                <span className='text-blue-700'>License:</span>
                <p className='text-blue-900'>{selectedDoctor.licenseNumber}</p>
              </div>
              <div>
                <span className='text-blue-700'>Department:</span>
                <p className='text-blue-900'>{selectedDoctor.department}</p>
              </div>
              <div>
                <span className='text-blue-700'>Hospital:</span>
                <p className='text-blue-900'>{selectedDoctor.hospital}</p>
              </div>
              {selectedDoctor.experience && (
                <div>
                  <span className='text-blue-700'>Experience:</span>
                  <p className='text-blue-900'>
                    {selectedDoctor.experience} years
                  </p>
                </div>
              )}
              <div>
                <span className='text-blue-700'>Email:</span>
                <p className='text-blue-900'>{selectedDoctor.email}</p>
              </div>
              <div>
                <span className='text-blue-700'>Phone:</span>
                <p className='text-blue-900'>{selectedDoctor.phone}</p>
              </div>
              {selectedDoctor.consultationFee && (
                <div>
                  <span className='text-blue-700'>Consultation Fee:</span>
                  <p className='text-blue-900'>
                    LKR {selectedDoctor.consultationFee.toLocaleString()}
                  </p>
                </div>
              )}
              {selectedDoctor.rating && (
                <div>
                  <span className='text-blue-700'>Rating:</span>
                  <p className='text-blue-900'>
                    ⭐ {selectedDoctor.rating.average.toFixed(1)} (
                    {selectedDoctor.rating.count} reviews)
                  </p>
                </div>
              )}
            </div>

            {/* Qualifications */}
            {selectedDoctor.qualifications &&
              selectedDoctor.qualifications.length > 0 && (
                <div className='mt-3 pt-3 border-t border-blue-200'>
                  <span className='text-blue-700 text-sm font-medium'>
                    Qualifications:
                  </span>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {selectedDoctor.qualifications.map((qual, index) => (
                      <span
                        key={index}
                        className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'
                      >
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Languages */}
            {selectedDoctor.languages &&
              selectedDoctor.languages.length > 0 && (
                <div className='mt-2'>
                  <span className='text-blue-700 text-sm font-medium'>
                    Languages:
                  </span>
                  <p className='text-blue-900 text-sm mt-1'>
                    {selectedDoctor.languages.join(', ')}
                  </p>
                </div>
              )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorSelection;
