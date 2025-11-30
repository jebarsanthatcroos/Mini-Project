import React from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';

interface AppointmentFormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

const AppointmentFormActions: React.FC<AppointmentFormActionsProps> = ({
  onCancel,
  onSubmit,
  saving,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <div className='space-y-3'>
        <button
          type='submit'
          onClick={onSubmit}
          disabled={saving}
          className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
        >
          <FiSave className='w-4 h-4' />
          {saving ? 'Creating Appointment...' : 'Create Appointment'}
        </button>

        <button
          type='button'
          onClick={onCancel}
          className='w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          Cancel
        </button>
      </div>

      <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <p className='text-xs text-yellow-800'>
          <strong>Note:</strong> The patient will receive a notification about
          this appointment once created.
        </p>
      </div>
    </motion.div>
  );
};

export default AppointmentFormActions;
