import { useState } from 'react';
import { PatientFormData } from '@/types/patient';

export const usePatientForm = (initialData: PatientFormData) => {
  const [formData, setFormData] = useState<PatientFormData>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    // eslint-disable-next-line no-undef
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof PatientFormData];

        if (
          typeof parentValue === 'object' &&
          parentValue !== null &&
          !Array.isArray(parentValue)
        ) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }

        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    validateForm,
    handleChange,
  };
};
