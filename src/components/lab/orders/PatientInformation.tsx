import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiPhone, FiMail } from 'react-icons/fi';
import { LabTestRequest } from '@/types/lab';

interface PatientInformationProps {
  order: LabTestRequest;
}

export default function PatientInformation({ order }: PatientInformationProps) {
  const calculateAge = (dateOfBirth: Date) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-Uk', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <FiUser className='w-5 h-5 text-indigo-600' />
        Patient Information
      </h2>

      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center'>
            <FiUser className='w-6 h-6 text-indigo-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>
              {order.patient.name}
            </h3>
            <p className='text-sm text-gray-600'>
              Patient ID: {order.patient.inc}
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <FiCalendar className='w-4 h-4 text-gray-400' />
            <div>
              <p className='text-sm text-gray-500'>Date of Birth</p>
              <p className='font-medium'>
                {formatDate(order.patient.dateOfBirth)}
                <span className='text-gray-600 ml-2'>
                  ({calculateAge(order.patient.dateOfBirth)} years)
                </span>
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <FiUser className='w-4 h-4 text-gray-400' />
            <div>
              <p className='text-sm text-gray-500'>Gender</p>
              <p className='font-medium capitalize'>
                {order.patient.gender.toLowerCase()}
              </p>
            </div>
          </div>

          {order.patient.phone && (
            <div className='flex items-center gap-3'>
              <FiPhone className='w-4 h-4 text-gray-400' />
              <div>
                <p className='text-sm text-gray-500'>Phone</p>
                <p className='font-medium'>{order.patient.phone}</p>
              </div>
            </div>
          )}

          {order.patient.email && (
            <div className='flex items-center gap-3'>
              <FiMail className='w-4 h-4 text-gray-400' />
              <div>
                <p className='text-sm text-gray-500'>Email</p>
                <p className='font-medium'>{order.patient.email}</p>
              </div>
            </div>
          )}
        </div>

        {order.patient.medicalRecordNumber && (
          <div className='pt-4 border-t border-gray-200'>
            <p className='text-sm text-gray-500'>Medical Record Number</p>
            <p className='font-medium'>{order.patient.medicalRecordNumber}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
