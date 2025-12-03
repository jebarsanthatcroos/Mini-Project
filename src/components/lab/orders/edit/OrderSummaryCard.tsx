import { motion } from 'framer-motion';
import { LabTestRequest } from '@/types/lab';

interface OrderSummaryCardProps {
  order: LabTestRequest;
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Order Summary
      </h3>

      <div className='space-y-3 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-500'>Patient:</span>
          <span className='font-medium'>{order.patient.name}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>Test:</span>
          <span className='font-medium'>{order.test.name}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>Category:</span>
          <span className='font-medium'>{order.test.category}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>Sample Type:</span>
          <span className='font-medium capitalize'>
            {order.test.sampleType.toLowerCase()}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>Duration:</span>
          <span className='font-medium'>{order.test.duration} minutes</span>
        </div>
      </div>
    </motion.div>
  );
}
