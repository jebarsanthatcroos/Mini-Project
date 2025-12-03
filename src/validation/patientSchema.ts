import { z, ZodError, ZodIssue } from 'zod';
const nicRegex = /^[0-9]{9}[VX]|[0-9]{12}$/;
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
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
export const insuranceSchema = z.object({
  provider: z
    .string()
    .min(1, 'Insurance provider is required')
    .max(100, 'Provider name is too long'),
  policyNumber: z
    .string()
    .min(1, 'Policy number is required')
    .max(50, 'Policy number is too long'),
  groupNumber: z
    .string()
    .max(50, 'Group number is too long')
    .optional()
    .or(z.literal('')),
  validUntil: z
    .date()
    .min(new Date(), 'Insurance expiration date must be in the future')
    .or(z.string().transform(str => new Date(str))),
});

export const patientFormSchema = z.object({
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
    .regex(nicRegex, 'Invalid NIC format. Use: 123456789V or 123456789012'),

  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format')
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
    error: () => ({ message: 'Please select a valid gender' }),
  }),

  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  insurance: insuranceSchema,

  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal('')),

  height: z
    .union([
      z
        .number()
        .min(0, 'Height must be positive')
        .max(300, 'Height must be realistic'),
      z.nan(),
    ])
    .optional(),

  weight: z
    .union([
      z
        .number()
        .min(0, 'Weight must be positive')
        .max(500, 'Weight must be realistic'),
      z.nan(),
    ])
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

  isActive: z.boolean().optional().default(true),
});

export type PatientFormSchemaType = z.infer<typeof patientFormSchema>;

export const createDefaultFormData = (): PatientFormSchemaType => ({
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
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: '',
    validUntil: new Date(),
  },
  medicalHistory: '',
  allergies: [],
  medications: [],
  bloodType: '',
  height: undefined,
  weight: undefined,
  isActive: true,
});
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

export const safeParsePatientForm = (data: unknown) => {
  return patientFormSchema.safeParse(data);
};

export const validateField = (fieldName: string, value: unknown) => {
  try {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      const parentSchema =
        patientFormSchema.shape[parent as keyof typeof patientFormSchema.shape];

      if (parentSchema && 'shape' in parentSchema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childSchema = (parentSchema as z.ZodObject<any>).shape[child];
        if (childSchema) {
          childSchema.parse(value);
          return {
            valid: true as const,
            error: null,
          };
        }
      }
    } else {
      // Handle top-level fields
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

export const schemas = {
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  insurance: insuranceSchema,
  patientForm: patientFormSchema,
} as const;

export const validateNIC = (
  nic: string
): { valid: boolean; error?: string } => {
  if (!nic) {
    return { valid: false, error: 'NIC number is required' };
  }

  if (!nicRegex.test(nic)) {
    return {
      valid: false,
      error: 'Invalid NIC format. Valid formats: 123456789V or 123456789012',
    };
  }

  return { valid: true };
};

export const validateEmail = (
  email: string
): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format. Example: user@example.com',
    };
  }

  return { valid: true };
};
