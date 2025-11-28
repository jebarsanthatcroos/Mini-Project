import { motion } from 'framer-motion';
import { FiPackage, FiUser } from 'react-icons/fi';
import { LabTestRequest } from '@/types/lab';

interface OrderInformationProps {
  order: LabTestRequest;
}

export default function OrderInformation({ order }: OrderInformationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <FiPackage className='w-5 h-5 text-purple-600' />
        Test Information
      </h2>

      <div className='space-y-4'>
        <div className='flex justify-between items-start'>
          <span className='text-gray-500'>Test Name:</span>
          <span className='font-medium text-right'>{order.test.name}</span>
        </div>

        <div className='flex justify-between items-start'>
          <span className='text-gray-500'>Category:</span>
          <span className='font-medium'>{order.test.category}</span>
        </div>

        <div className='flex justify-between items-start'>
          <span className='text-gray-500'>Sample Type:</span>
          <span className='font-medium capitalize'>
            {order.test.sampleType.toLowerCase()}
          </span>
        </div>

        <div className='flex justify-between items-start'>
          <span className='text-gray-500'>Duration:</span>
          <span className='font-medium'>{order.test.duration} minutes</span>
        </div>

        <div className='flex justify-between items-start'>
          <span className='text-gray-500'>Price:</span>
          <span className='font-medium'>${order.test.price}</span>
        </div>

        {/* Doctor Information */}
        <div className='pt-4 border-t border-gray-200'>
          <h3 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
            <FiUser className='w-4 h-4 text-blue-600' />
            Requesting Doctor
          </h3>
          <div className='space-y-2'>
            <p className='font-medium'>{order.doctor.name}</p>
            <p className='text-sm text-gray-600'>Email:{order.doctor.email}</p>
            <p className='text-sm text-gray-600'>
              phone number:{order.doctor.phone}
            </p>
            <p className='text-sm text-gray-600'>
              ID: {order.doctor.doctor_number}
            </p>
            <p className='text-sm text-gray-600'>
              License: {order.doctor.doctorId}
            </p>
          </div>
        </div>

        {/* Lab Technician */}
        {order.labTechnician && (
          <div className='pt-4 border-t border-gray-200'>
            <h3 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
              <FiUser className='w-4 h-4 text-green-600' />
              Assigned Technician
            </h3>
            <div className='space-y-2'>
              <p className='font-medium'>{order.labTechnician.name}</p>
              <p className='text-sm text-gray-600'>
                ID: {order.labTechnician.employeeId}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
