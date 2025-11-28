import React from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  saving,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <div className='flex gap-4'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          Cancel
        </button>
        <button
          type='submit'
          onClick={onSubmit}
          disabled={saving}
          className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
        >
          <FiSave className='w-4 h-4' />
          {saving ? 'Updating Patient...' : 'Update Patient'}
        </button>
      </div>
    </motion.div>
  );
};

export default FormActions;
