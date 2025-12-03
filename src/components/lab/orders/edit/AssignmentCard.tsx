import { motion } from 'framer-motion';
import { LabTestRequest } from '@/types/lab';

interface AssignmentCardProps {
  order: LabTestRequest;
}

export default function AssignmentCard({ order }: AssignmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Current Assignment
      </h3>

      <div className='space-y-3 text-sm'>
        <div>
          <span className='text-gray-500'>Doctor:</span>
          <p className='font-medium'>{order.doctor.name}</p>
          <p className='text-gray-500'>{order.doctor.email}</p>
        </div>
        <div>
          <span className='text-gray-500'>Technician:</span>
          {order.labTechnician ? (
            <>
              <p className='font-medium'>{order.labTechnician.name}</p>
              <p className='text-gray-500'>{order.labTechnician.employeeId}</p>
            </>
          ) : (
            <p className='text-orange-600'>Unassigned</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
