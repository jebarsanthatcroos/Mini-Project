'use client';

import React, { useState } from 'react';
import { FiAlertCircle, FiPhone, FiUser, FiMail, FiInfo } from 'react-icons/fi';
import { IPatientFormData } from '@/app/(page)/Receptionist/patients/new/page';

interface PatientEmergencyContactFormProps {
  formData: IPatientFormData;
  formErrors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const PatientEmergencyContactForm: React.FC<
  PatientEmergencyContactFormProps
> = ({ formData, formErrors, onChange, onBlur }) => {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [sameAsPatient, setSameAsPatient] = useState(false);

  // Relationship options
  const relationshipOptions = [
    { value: '', label: 'Select relationship' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'relative', label: 'Relative' },
    { value: 'guardian', label: 'Legal Guardian' },
    { value: 'partner', label: 'Partner' },
    { value: 'cousin', label: 'Cousin' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'other', label: 'Other' },
  ];

  // Preferred contact method
  const contactMethods = [
    { value: 'phone', label: 'Phone Call' },
    { value: 'sms', label: 'SMS/Text' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'viber', label: 'Viber' },
    { value: 'any', label: 'Any Method' },
  ];

  // Contact priority
  const priorityOptions = [
    { value: 'primary', label: 'Primary Contact' },
    { value: 'secondary', label: 'Secondary Contact' },
    { value: 'backup', label: 'Backup Contact' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: `emergencyContact.${e.target.name}`,
      },
    } as React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >;

    onBlur(syntheticEvent);
  };

  // Handle same as patient toggle
  const handleSameAsPatientToggle = (checked: boolean) => {
    setSameAsPatient(checked);

    if (checked) {
      // Copy patient's information to emergency contact
      onChange('name', `${formData.firstName} ${formData.lastName}`);
      onChange('phone', formData.phone);
      onChange('email', formData.email);
      onChange('relationship', 'self');
    } else {
      // Clear the emergency contact fields
      onChange('name', '');
      onChange('phone', '');
      onChange('email', '');
      onChange('relationship', '');
    }
  };

  // Format emergency contact display
  const formatContactDisplay = () => {
    const contact = formData.emergencyContact;
    if (!contact?.name) return 'No emergency contact added';

    const parts = [];
    if (contact.name) parts.push(contact.name);
    if (contact.relationship) parts.push(`(${contact.relationship})`);

    return parts.join(' ');
  };

  return (
    <div className='space-y-6'>
      {/* Emergency Contact Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Emergency Contact Information
          </h3>
          <p className='text-sm text-gray-600'>
            Provide contact details for emergency situations
          </p>
        </div>
        <button
          type='button'
          onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
          className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800'
        >
          <FiInfo className='w-4 h-4' />
          {showAdditionalInfo ? 'Hide Info' : 'Show Info'}
        </button>
      </div>

      {/* Information Card */}
      {showAdditionalInfo && (
        <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
          <div className='flex items-start'>
            <div className='shrink-0'>
              <FiInfo className='w-5 h-5 text-yellow-400 mt-0.5' />
            </div>
            <div className='ml-3'>
              <h4 className='text-sm font-medium text-yellow-800'>
                Emergency Contact Guidelines
              </h4>
              <ul className='mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1'>
                <li>Emergency contact should be available 24/7</li>
                <li>Provide at least one working phone number</li>
                <li>
                  Make sure the contact person is aware they&apos;re listed
                </li>
                <li>Update this information if contact details change</li>
                <li>
                  Consider time zone differences for international contacts
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Same as Patient Checkbox */}
      <div className='bg-gray-50 p-4 rounded-md border border-gray-200'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='sameAsPatient'
            name='sameAsPatient'
            checked={sameAsPatient}
            onChange={e => handleSameAsPatientToggle(e.target.checked)}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
          <label
            htmlFor='sameAsPatient'
            className='ml-2 block text-sm font-medium text-gray-900'
          >
            Emergency contact is the same as patient
          </label>
        </div>
        <p className='mt-1 text-xs text-gray-500 ml-6'>
          Check this if the patient is their own emergency contact
        </p>
      </div>

      {/* Emergency Contact Form Fields */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Contact Name */}
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Contact Name *
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiUser className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.emergencyContact?.name || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={sameAsPatient}
              className={`block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors['emergencyContact.name'] || formErrors.name
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              } ${sameAsPatient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder='John Smith'
              required
            />
          </div>
          {(formErrors['emergencyContact.name'] || formErrors.name) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['emergencyContact.name'] || formErrors.name}
              </span>
            </div>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label
            htmlFor='relationship'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Relationship *
          </label>
          <select
            id='relationship'
            name='relationship'
            value={formData.emergencyContact?.relationship || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={sameAsPatient}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors['emergencyContact.relationship'] ||
              formErrors.relationship
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            } ${sameAsPatient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          >
            {relationshipOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(formErrors['emergencyContact.relationship'] ||
            formErrors.relationship) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['emergencyContact.relationship'] ||
                  formErrors.relationship}
              </span>
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor='phone'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Phone Number *
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiPhone className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.emergencyContact?.phone || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={sameAsPatient}
              className={`block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors['emergencyContact.phone'] || formErrors.phone
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              } ${sameAsPatient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder='+94 77 123 4567'
              required
            />
          </div>
          {(formErrors['emergencyContact.phone'] || formErrors.phone) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['emergencyContact.phone'] || formErrors.phone}
              </span>
            </div>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Email Address
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiMail className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.emergencyContact?.email || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={sameAsPatient}
              className={`block w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors['emergencyContact.email'] || formErrors.email
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              } ${sameAsPatient ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder='contact@example.com'
            />
          </div>
          {(formErrors['emergencyContact.email'] || formErrors.email) && (
            <div className='mt-1 flex items-center gap-1 text-sm text-red-600'>
              <FiAlertCircle className='w-4 h-4' />
              <span>
                {formErrors['emergencyContact.email'] || formErrors.email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Contact Information */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <h4 className='text-sm font-medium text-gray-900 mb-4'>
          Additional Contact Information
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Secondary Phone Number */}
          <div>
            <label
              htmlFor='secondaryPhone'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Secondary Phone (Optional)
            </label>
            <input
              type='tel'
              id='secondaryPhone'
              name='secondaryPhone'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Alternative phone number'
            />
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label
              htmlFor='preferredContactMethod'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Preferred Contact Method
            </label>
            <select
              id='preferredContactMethod'
              name='preferredContactMethod'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select preferred method</option>
              {contactMethods.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Priority */}
          <div>
            <label
              htmlFor='contactPriority'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Contact Priority
            </label>
            <select
              id='contactPriority'
              name='contactPriority'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select priority level</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Language */}
          <div>
            <label
              htmlFor='contactLanguage'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Preferred Language
            </label>
            <select
              id='contactLanguage'
              name='contactLanguage'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>Select language</option>
              <option value='en'>English</option>
              <option value='si'>Sinhala</option>
              <option value='ta'>Tamil</option>
              <option value='other'>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Availability */}
      <div className='mt-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Availability Information (Optional)
        </label>
        <div className='space-y-3'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='available24x7'
              name='available24x7'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='available24x7'
              className='ml-2 block text-sm text-gray-900'
            >
              Available 24/7
            </label>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='availableWeekdays'
              name='availableWeekdays'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='availableWeekdays'
              className='ml-2 block text-sm text-gray-900'
            >
              Available on weekdays only
            </label>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='availableWeekends'
              name='availableWeekends'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='availableWeekends'
              className='ml-2 block text-sm text-gray-900'
            >
              Available on weekends only
            </label>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='internationalContact'
              name='internationalContact'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='internationalContact'
              className='ml-2 block text-sm text-gray-900'
            >
              International contact (different time zone)
            </label>
          </div>
        </div>
      </div>

      {/* Contact Notes */}
      <div className='mt-6'>
        <label
          htmlFor='contactNotes'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Contact Notes (Optional)
        </label>
        <textarea
          id='contactNotes'
          name='contactNotes'
          rows={3}
          className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          placeholder='Any special instructions, alternative contact methods, or notes about this emergency contact...'
        />
        <p className='mt-1 text-xs text-gray-500'>
          Add notes about best times to call, language barriers, or special
          circumstances
        </p>
      </div>

      {/* Emergency Contact Summary */}
      <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h4 className='text-sm font-medium text-blue-800 mb-2'>
          Emergency Contact Summary
        </h4>
        <div className='text-sm text-blue-700 space-y-1'>
          <div className='flex'>
            <span className='w-32 font-medium'>Contact:</span>
            <span>{formatContactDisplay()}</span>
          </div>
          {formData.emergencyContact?.phone && (
            <div className='flex'>
              <span className='w-32 font-medium'>Phone:</span>
              <span>{formData.emergencyContact.phone}</span>
            </div>
          )}
          {formData.emergencyContact?.email && (
            <div className='flex'>
              <span className='w-32 font-medium'>Email:</span>
              <span>{formData.emergencyContact.email}</span>
            </div>
          )}
          {sameAsPatient && (
            <div className='mt-2 text-xs text-blue-600 italic'>
              Note: This contact is the same as the patient
            </div>
          )}
        </div>
      </div>

      {/* No Emergency Contact Option */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='noEmergencyContact'
            name='noEmergencyContact'
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            onChange={e => {
              if (e.target.checked) {
                // Clear all emergency contact fields
                onChange('name', '');
                onChange('phone', '');
                onChange('email', '');
                onChange('relationship', '');
                setSameAsPatient(false);
              }
            }}
          />
          <label
            htmlFor='noEmergencyContact'
            className='ml-2 block text-sm text-gray-900'
          >
            Patient has no emergency contact
          </label>
        </div>
        <p className='mt-1 text-xs text-gray-500'>
          Check this only if the patient explicitly states they have no
          emergency contact
        </p>
      </div>
    </div>
  );
};

export default PatientEmergencyContactForm;
