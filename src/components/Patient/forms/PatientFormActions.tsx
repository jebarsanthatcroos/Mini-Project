import React from 'react';
import { FiArrowLeft, FiArrowRight, FiSave } from 'react-icons/fi';

interface PatientFormActionsProps {
  onCancel: () => void;
  saving: boolean;
  currentSection: string;
  sections: Array<{ id: string; label: string }>;
  onSectionChange: (section: string) => void;
  hasErrors?: boolean;
}

const PatientFormActions: React.FC<PatientFormActionsProps> = ({
  onCancel,
  saving,
  currentSection,
  sections,
  onSectionChange,
  hasErrors = false,
}) => {
  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === sections.length - 1;

  const goToPrevious = () => {
    if (!isFirstSection) {
      onSectionChange(sections[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (!isLastSection) {
      onSectionChange(sections[currentIndex + 1].id);
    }
  };

  return (
    <div className='flex justify-between items-center'>
      <div className='flex gap-3'>
        {!isFirstSection && (
          <button
            type='button'
            onClick={goToPrevious}
            className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
          >
            <FiArrowLeft className='mr-2 h-4 w-4' />
            Previous
          </button>
        )}
        {!isLastSection && (
          <button
            type='button'
            onClick={goToNext}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={hasErrors}
          >
            Next
            <FiArrowRight className='ml-2 h-4 w-4' />
          </button>
        )}
      </div>

      <div className='flex gap-3'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
        >
          Cancel
        </button>

        {/* Native form submit button - only show on last section */}
        {isLastSection && (
          <button
            type='submit'
            disabled={saving || hasErrors}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FiSave className='mr-2 h-4 w-4' />
            {saving ? 'Saving...' : 'Save Patient'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientFormActions;
