import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { Patient } from '@/types/patient';
import { formatDate, calculateAge, getGenderText } from '@/utils/patientUtils';

interface PersonalInfoCardProps {
  patient: Patient;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ patient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <FiUser className='w-5 h-5 text-blue-600' />
        Personal Information
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Basic Details
          </label>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Full Name:</span>
              <span className='text-gray-900 font-medium'>
                {patient.firstName} {patient.lastName}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Date of Birth:</span>
              <span className='text-gray-900'>
                {formatDate(patient.dateOfBirth)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Age:</span>
              <span className='text-gray-900'>
                {calculateAge(patient.dateOfBirth)} years
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Gender:</span>
              <span className='text-gray-900 capitalize'>
                {getGenderText(patient.gender).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Contact Information
          </label>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-gray-900'>
              <FiMail className='w-4 h-4 text-gray-400' />
              <span>{patient.email}</span>
            </div>
            <div className='flex items-center gap-2 text-gray-900'>
              <FiPhone className='w-4 h-4 text-gray-400' />
              <span>{patient.phone}</span>
            </div>
            {patient.address && (
              <div className='flex items-start gap-2 text-gray-900'>
                <FiMapPin className='w-4 h-4 text-gray-400 mt-0.5' />
                <div>
                  <div>{patient.address.street}</div>
                  <div>
                    {patient.address.city}, {patient.address.state}{' '}
                    {patient.address.zipCode}
                  </div>
                  <div>{patient.address.country}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalInfoCard;
