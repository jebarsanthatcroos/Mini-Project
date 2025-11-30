import React, { useState } from 'react';
import { PatientFormData } from '@/types/patient';
import { validatePatientForm, validateField } from '@/validation/patientSchema';
import PatientBasicInfoForm from './PatientBasicInfoForm';

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  nic: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'OTHER',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
    email: '',
  },
  medicalHistory: '',
  allergies: [],
  medications: [],
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: '',
    validUntil: new Date(),
  },
  bloodType: '',
  height: undefined,
  weight: undefined,
  isActive: true,
};

const PatientFormContainer: React.FC = () => {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'number' ? (value ? parseFloat(value) : undefined) : value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Skip validation for empty optional fields
    if (!value && name !== 'gender') {
      return;
    }

    // Validate individual field on blur
    const result = validateField(name, value);
    if (!result.valid && result.error) {
      setFormErrors(prev => ({
        ...prev,
        [name]: result.error!,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Validate entire form
    const result = validatePatientForm(formData);

    if (result.success) {
      try {
        // Your API call here
        console.log('Valid form data:', result.data);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Success
        setSubmitSuccess(true);
        setFormErrors({});

        // Optional: Reset form after successful submission
        // setTimeout(() => {
        //   setFormData(initialFormData);
        //   setSubmitSuccess(false);
        // }, 2000);
      } catch (error) {
        console.error('Submission error:', error);
        setFormErrors({
          _form: 'Failed to submit form. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Show validation errors
      setFormErrors(result.errors || {});
      setIsSubmitting(false);

      // Scroll to first error
      const firstErrorField = Object.keys(result.errors || {})[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setSubmitSuccess(false);
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-md p-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
          Patient Registration
        </h2>

        {submitSuccess && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2'>
            <svg
              className='w-5 h-5 text-green-600'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path d='M5 13l4 4L19 7'></path>
            </svg>
            <p className='text-green-800 font-medium'>
              Patient registered successfully!
            </p>
          </div>
        )}

        {formErrors._form && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2'>
            <svg
              className='w-5 h-5 text-red-600'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path d='M6 18L18 6M6 6l12 12'></path>
            </svg>
            <p className='text-red-800 font-medium'>{formErrors._form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <PatientBasicInfoForm
            formData={formData}
            formErrors={formErrors}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <div className='mt-8 flex flex-col sm:flex-row gap-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg
                    className='animate-spin h-5 w-5'
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
                  Submitting...
                </span>
              ) : (
                'Register Patient'
              )}
            </button>

            <button
              type='button'
              onClick={handleReset}
              disabled={isSubmitting}
              className='px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormContainer;
