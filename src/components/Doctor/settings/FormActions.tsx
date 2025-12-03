import React from 'react';

interface FormActionsProps {
  saving: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ saving, onCancel }) => {
  return (
    <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200'>
      <button
        type='button'
        onClick={onCancel}
        className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      >
        Cancel
      </button>
      <button
        type='submit'
        disabled={saving}
        className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default FormActions;
