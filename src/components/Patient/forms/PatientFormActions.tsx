'use client';

import React from 'react';
import { FiArrowLeft, FiArrowRight, FiSave, FiCheck } from 'react-icons/fi';

interface PatientFormActionsProps {
  onCancel: () => void;
  saving: boolean;
  currentSection: string;
  sections: Array<{ id: string; label: string }>;
  onSectionChange: (sectionId: string) => void;
  hasErrors: boolean;
  onSubmit?: () => void;
}

const PatientFormActions: React.FC<PatientFormActionsProps> = ({
  onCancel,
  saving,
  currentSection,
  sections,
  onSectionChange,
  hasErrors,
  onSubmit,
}) => {
  // Get current section index
  const currentIndex = sections.findIndex(
    section => section.id === currentSection
  );
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === sections.length - 1;

  // Handle next section
  const handleNext = () => {
    if (!isLastSection) {
      const nextSection = sections[currentIndex + 1];
      onSectionChange(nextSection.id);
    }
  };

  // Handle previous section
  const handlePrevious = () => {
    if (!isFirstSection) {
      const prevSection = sections[currentIndex - 1];
      onSectionChange(prevSection.id);
    }
  };

  // Get section completion status (simulated - you can implement real logic)
  const getSectionStatus = (
    sectionId: string
  ): 'complete' | 'incomplete' | 'current' => {
    if (sectionId === currentSection) return 'current';
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    return sectionIndex < currentIndex ? 'complete' : 'incomplete';
  };

  return (
    <div className='space-y-4'>
      {/* Section Navigation */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Previous Button */}
        <button
          type='button'
          onClick={handlePrevious}
          disabled={isFirstSection}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isFirstSection
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiArrowLeft className='w-4 h-4 mr-2' />
          Previous
        </button>

        {/* Section Indicators (Mobile) */}
        <div className='sm:hidden flex items-center space-x-2'>
          {sections.map((section, _index) => {
            const status = getSectionStatus(section.id);
            return (
              <button
                key={section.id}
                type='button'
                onClick={() => onSectionChange(section.id)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  status === 'current'
                    ? 'bg-blue-600'
                    : status === 'complete'
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
                title={section.label}
              />
            );
          })}
        </div>

        {/* Next/Submit Button */}
        {isLastSection ? (
          <button
            type={onSubmit ? 'button' : 'submit'}
            onClick={onSubmit}
            disabled={saving || hasErrors}
            className={`inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              saving || hasErrors
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Saving Patient...
              </>
            ) : (
              <>
                <FiCheck className='w-4 h-4 mr-2' />
                Complete Registration
              </>
            )}
          </button>
        ) : (
          <button
            type='button'
            onClick={handleNext}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Next
            <FiArrowRight className='w-4 h-4 ml-2' />
          </button>
        )}
      </div>

      {/* Section Progress Bar (Desktop) */}
      <div className='hidden sm:block'>
        <div className='flex items-center justify-between'>
          {sections.map((section, index) => {
            const status = getSectionStatus(section.id);
            const isClickable = index <= currentIndex;

            return (
              <React.Fragment key={section.id}>
                {/* Section Circle */}
                <div className='flex flex-col items-center relative'>
                  <button
                    type='button'
                    onClick={() => isClickable && onSectionChange(section.id)}
                    disabled={!isClickable}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      status === 'current'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : status === 'complete'
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    } ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                  >
                    {status === 'complete' ? (
                      <FiCheck className='w-5 h-5' />
                    ) : (
                      <span className='text-sm font-medium'>{index + 1}</span>
                    )}
                  </button>

                  {/* Section Label */}
                  <span
                    className={`mt-2 text-xs font-medium ${
                      status === 'current'
                        ? 'text-blue-600'
                        : status === 'complete'
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {section.label}
                  </span>

                  {/* Status Indicator */}
                  {status === 'current' && (
                    <div className='absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse'></div>
                  )}
                </div>

                {/* Connector Line */}
                {index < sections.length - 1 && (
                  <div className='flex-1 h-1 mx-2'>
                    <div
                      className={`h-full rounded-full ${
                        index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200'>
        <div className='flex items-center space-x-3'>
          {/* Cancel Button */}
          <button
            type='button'
            onClick={onCancel}
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Cancel
          </button>

          {/* Save Draft Button */}
          <button
            type='button'
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            <FiSave className='w-4 h-4 mr-2 text-gray-400' />
            Save Draft
          </button>
        </div>

        {/* Validation Status */}
        <div className='flex items-center space-x-2'>
          {hasErrors ? (
            <div className='flex items-center text-red-600'>
              <svg
                className='w-5 h-5 mr-1'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-sm font-medium'>Form has errors</span>
            </div>
          ) : (
            <div className='flex items-center text-green-600'>
              <FiCheck className='w-5 h-5 mr-1' />
              <span className='text-sm font-medium'>All fields valid</span>
            </div>
          )}

          {/* Section Indicator */}
          <div className='hidden sm:block text-sm text-gray-500'>
            Section {currentIndex + 1} of {sections.length}
          </div>
        </div>
      </div>

      {/* Error Warning */}
      {hasErrors && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <div className='flex items-start'>
            <svg
              className='w-5 h-5 text-red-400 mt-0.5 mr-2 shrink-0'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            <div className='text-sm text-red-700'>
              <p className='font-medium'>Please fix errors before continuing</p>
              <p className='mt-1'>
                Some fields require correction. Check all sections for
                validation errors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className='pt-2 border-t border-gray-200'>
        <div className='text-xs text-gray-500'>
          <div className='flex items-center justify-between'>
            <span>Tip: Use Tab to navigate between fields</span>
            <span className='hidden sm:inline'>
              Press{' '}
              <kbd className='px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs'>
                Enter
              </kbd>{' '}
              to save
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className='hidden sm:block'>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <button
            type='button'
            onClick={() => onSectionChange('basic')}
            className={`px-2 py-1 rounded ${
              currentSection === 'basic'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:text-blue-600'
            }`}
          >
            Basic Info
          </button>
          <button
            type='button'
            onClick={() => onSectionChange('address')}
            className={`px-2 py-1 rounded ${
              currentSection === 'address'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:text-blue-600'
            }`}
          >
            Address
          </button>
          <button
            type='button'
            onClick={() => onSectionChange('emergency')}
            className={`px-2 py-1 rounded ${
              currentSection === 'emergency'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:text-blue-600'
            }`}
          >
            Emergency
          </button>
          <button
            type='button'
            onClick={() => onSectionChange('medical')}
            className={`px-2 py-1 rounded ${
              currentSection === 'medical'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:text-blue-600'
            }`}
          >
            Medical
          </button>
          <button
            type='button'
            onClick={() => onSectionChange('insurance')}
            className={`px-2 py-1 rounded ${
              currentSection === 'insurance'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:text-blue-600'
            }`}
          >
            Insurance
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFormActions;
