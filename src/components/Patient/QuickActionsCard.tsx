import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiRefreshCw } from 'react-icons/fi';

interface QuickActionsCardProps {
  onNewAppointment: () => void;
  onEditPatient: () => void;
  onRefresh: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onNewAppointment,
  onEditPatient,
  onRefresh,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-lg font-semibold text-gray-900 mb-4'>
        Quick Actions
      </h2>

      <div className='space-y-3'>
        <button
          onClick={onNewAppointment}
          className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          <FiPlus className='w-4 h-4' />
          New Appointment
        </button>

        <button
          onClick={onEditPatient}
          className='w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
        >
          <FiEdit className='w-4 h-4' />
          Edit Patient
        </button>

        <button
          onClick={onRefresh}
          className='w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          <FiRefreshCw className='w-4 h-4' />
          Refresh
        </button>
      </div>
    </motion.div>
  );
};

export default QuickActionsCard;
