// ============================================
// FILE 1: validation/patientSchema.ts
// ============================================
import { z, ZodError, ZodIssue } from 'zod';

// Address Schema
export const addressSchema = z.object({
  street: z
    .string()
    .min(1, 'Street is required')
    .max(200, 'Street is too long'),
  city: z.string().min(1, 'City is required').max(100, 'City is too long'),
  state: z.string().min(1, 'State is required').max(100, 'State is too long'),
  zipCode: z
    .string()
    .min(1, 'Zip code is required')
    .max(20, 'Zip code is too long'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country is too long'),
});

// Emergency Contact Schema
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Emergency contact name is required')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .min(1, 'Emergency contact phone is required')
    .regex(/^[0-9+\-() ]+$/, 'Invalid phone number format'),
  relationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship is too long'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

// Insurance Schema
export const insuranceSchema = z.object({
  provider: z.string().optional().or(z.literal('')),
  policyNumber: z.string().optional().or(z.literal('')),
  groupNumber: z.string().optional().or(z.literal('')),
  validUntil: z.union([z.date(), z.string()]).optional(),
});

// Main Patient Form Schema
export const patientFormSchema = z.object({
  // Basic Information
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

  nic: z
    .string()
    .min(1, 'NIC number is required')
    .max(20, 'NIC number is too long')
    .regex(/^[0-9A-Za-z]+$/, 'NIC must contain only letters and numbers'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email is too long'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9+\-() ]+$/, 'Invalid phone number format')
    .min(10, 'Phone number is too short')
    .max(20, 'Phone number is too long'),

  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(date => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth cannot be in the future')
    .refine(date => {
      const birthDate = new Date(date);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 150);
      return birthDate >= minDate;
    }, 'Invalid date of birth'),

  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Please select a valid gender',
  }),

  // Optional Medical Information
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal('')),

  height: z
    .number()
    .min(0, 'Height must be positive')
    .max(300, 'Height must be realistic')
    .optional(),

  weight: z
    .number()
    .min(0, 'Weight must be positive')
    .max(500, 'Weight must be realistic')
    .optional(),

  medicalHistory: z
    .string()
    .max(2000, 'Medical history is too long')
    .optional()
    .or(z.literal('')),

  allergies: z
    .array(z.string().max(100, 'Allergy name is too long'))
    .optional()
    .default([]),

  medications: z
    .array(z.string().max(100, 'Medication name is too long'))
    .optional()
    .default([]),

  // Nested Objects (optional)
  address: z
    .union([
      addressSchema,
      z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string(),
      }),
    ])
    .optional(),

  emergencyContact: z
    .union([
      emergencyContactSchema,
      z.object({
        name: z.string(),
        phone: z.string(),
        relationship: z.string(),
        email: z.string().optional(),
      }),
    ])
    .optional(),

  insurance: insuranceSchema.optional(),

  // Status
  isActive: z.boolean().optional().default(true),
});

// Type inference
export type PatientFormSchemaType = z.infer<typeof patientFormSchema>;

// Validation helper function with proper error handling
export const validatePatientForm = (data: unknown) => {
  try {
    const validated = patientFormSchema.parse(data);
    return {
      success: true as const,
      data: validated,
      errors: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string> = {};

      (error.issues as ZodIssue[]).forEach((err: ZodIssue) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });

      return {
        success: false as const,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false as const,
      data: null,
      errors: { _form: 'Validation failed' },
    };
  }
};

// Safe parse wrapper for React forms
export const safeParsePatientForm = (data: unknown) => {
  return patientFormSchema.safeParse(data);
};

// Partial validation for individual fields with proper type handling
export const validateField = (fieldName: string, value: unknown) => {
  try {
    const fieldSchema =
      patientFormSchema.shape[
        fieldName as keyof typeof patientFormSchema.shape
      ];

    if (fieldSchema) {
      fieldSchema.parse(value);
      return {
        valid: true as const,
        error: null,
      };
    }

    return {
      valid: false as const,
      error: 'Unknown field',
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = (error.issues as ZodIssue[])[0];
      return {
        valid: false as const,
        error: firstError?.message || 'Validation failed',
      };
    }

    return {
      valid: false as const,
      error: 'Validation failed',
    };
  }
};

// Additional utility: Get all field errors as an object
export const getFieldErrors = (error: ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  (error.issues as ZodIssue[]).forEach((err: ZodIssue) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return errors;
};

// Additional utility: Validate specific nested fields
export const validateNestedField = (
  schema: z.ZodTypeAny,
  value: unknown
): { valid: boolean; error: string | null } => {
  try {
    schema.parse(value);
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = (error.issues as ZodIssue[])[0];
      return {
        valid: false,
        error: firstError?.message || 'Validation failed',
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
};

// Export schemas for nested validation
export const schemas = {
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  insurance: insuranceSchema,
  patientForm: patientFormSchema,
} as const;

// ============================================
// FILE 2: components/PatientBasicInfoForm.tsx
// ============================================
import React from 'react';
import { PatientFormData } from '@/types/patient';

interface PatientBasicInfoFormProps {
  formData: PatientFormData;
  formErrors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PatientBasicInfoForm: React.FC<PatientBasicInfoFormProps> = ({
  formData,
  formErrors,
  onChange,
  onBlur,
}) => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='firstName'
            className='block text-sm font-medium text-gray-700'
          >
            First Name *
          </label>
          <input
            type='text'
            id='firstName'
            name='firstName'
            value={formData.firstName}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.firstName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Enter first name'
            aria-invalid={!!formErrors.firstName}
            aria-describedby={
              formErrors.firstName ? 'firstName-error' : undefined
            }
          />
          {formErrors.firstName && (
            <p id='firstName-error' className='mt-1 text-sm text-red-600'>
              {formErrors.firstName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='lastName'
            className='block text-sm font-medium text-gray-700'
          >
            Last Name *
          </label>
          <input
            type='text'
            id='lastName'
            name='lastName'
            value={formData.lastName}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.lastName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Enter last name'
            aria-invalid={!!formErrors.lastName}
            aria-describedby={
              formErrors.lastName ? 'lastName-error' : undefined
            }
          />
          {formErrors.lastName && (
            <p id='lastName-error' className='mt-1 text-sm text-red-600'>
              {formErrors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email Address *
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Enter email address'
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? 'email-error' : undefined}
          />
          {formErrors.email && (
            <p id='email-error' className='mt-1 text-sm text-red-600'>
              {formErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='phone'
            className='block text-sm font-medium text-gray-700'
          >
            Phone Number *
          </label>
          <input
            type='tel'
            id='phone'
            name='phone'
            value={formData.phone}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.phone
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Enter phone number'
            aria-invalid={!!formErrors.phone}
            aria-describedby={formErrors.phone ? 'phone-error' : undefined}
          />
          {formErrors.phone && (
            <p id='phone-error' className='mt-1 text-sm text-red-600'>
              {formErrors.phone}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div>
          <label
            htmlFor='dateOfBirth'
            className='block text-sm font-medium text-gray-700'
          >
            Date of Birth *
          </label>
          <input
            type='date'
            id='dateOfBirth'
            name='dateOfBirth'
            value={formData.dateOfBirth}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.dateOfBirth
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            aria-invalid={!!formErrors.dateOfBirth}
            aria-describedby={
              formErrors.dateOfBirth ? 'dateOfBirth-error' : undefined
            }
          />
          {formErrors.dateOfBirth && (
            <p id='dateOfBirth-error' className='mt-1 text-sm text-red-600'>
              {formErrors.dateOfBirth}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='gender'
            className='block text-sm font-medium text-gray-700'
          >
            Gender *
          </label>
          <select
            id='gender'
            name='gender'
            value={formData.gender}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.gender
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            aria-invalid={!!formErrors.gender}
            aria-describedby={formErrors.gender ? 'gender-error' : undefined}
          >
            <option value=''>Select Gender</option>
            <option value='MALE'>Male</option>
            <option value='FEMALE'>Female</option>
            <option value='OTHER'>Other</option>
          </select>
          {formErrors.gender && (
            <p id='gender-error' className='mt-1 text-sm text-red-600'>
              {formErrors.gender}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='nic'
            className='block text-sm font-medium text-gray-700'
          >
            NIC Number *
          </label>
          <input
            type='text'
            id='nic'
            name='nic'
            value={formData.nic}
            onChange={onChange}
            onBlur={onBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              formErrors.nic
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder='Enter NIC number'
            aria-invalid={!!formErrors.nic}
            aria-describedby={formErrors.nic ? 'nic-error' : undefined}
          />
          {formErrors.nic && (
            <p id='nic-error' className='mt-1 text-sm text-red-600'>
              {formErrors.nic}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientBasicInfoForm;
