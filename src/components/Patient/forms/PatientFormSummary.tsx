import React from 'react';
import { PatientFormData } from '@/types/patient';
import { FiUser, FiMapPin, FiPhone, FiHeart, FiShield } from 'react-icons/fi';

interface PatientFormSummaryProps {
  formData: PatientFormData;
}

const PatientFormSummary: React.FC<PatientFormSummaryProps> = ({
  formData,
}) => {
  const completedSections = [
    {
      id: 'basic',
      completed:
        !!formData.firstName && !!formData.lastName && !!formData.email,
    },
    {
      id: 'address',
      completed: !!formData.address.street || !!formData.address.city,
    },
    {
      id: 'emergency',
      completed:
        !!formData.emergencyContact.name || !!formData.emergencyContact.phone,
    },
    {
      id: 'medical',
      completed:
        !!formData.medicalHistory ||
        formData.allergies.length > 0 ||
        formData.medications.length > 0,
    },
    {
      id: 'insurance',
      completed:
        !!formData.insurance.provider || !!formData.insurance.policyNumber,
    },
  ];

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'basic':
        return <FiUser className='h-4 w-4' />;
      case 'address':
        return <FiMapPin className='h-4 w-4' />;
      case 'emergency':
        return <FiPhone className='h-4 w-4' />;
      case 'medical':
        return <FiHeart className='h-4 w-4' />;
      case 'insurance':
        return <FiShield className='h-4 w-4' />;
      default:
        return <FiUser className='h-4 w-4' />;
    }
  };

  return (
    <div className='mt-6 pt-6 border-t border-gray-200'>
      <h4 className='text-sm font-medium text-gray-900 mb-3'>Progress</h4>
      <div className='space-y-2'>
        {completedSections.map(section => (
          <div key={section.id} className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {getSectionIcon(section.id)}
              <span className='text-sm text-gray-600 capitalize'>
                {section.id}
              </span>
            </div>
            {section.completed ? (
              <div className='w-2 h-2 bg-green-500 rounded-full' />
            ) : (
              <div className='w-2 h-2 bg-gray-300 rounded-full' />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientFormSummary;
