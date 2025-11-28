export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: Address;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  insurance?: Insurance;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: Address;
  emergencyContact: EmergencyContact;
  medicalHistory: string;
  allergies: string[];
  medications: string[];
  insurance: Insurance;
}

export interface PatientStats {
  total: number;
  male: number;
  female: number;
  other: number;
  recent: number;
  adults: number;
  children: number;
}

export interface Appointment {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  reason: string;
}

export const patientToFormData = (patient: Patient): PatientFormData => {
  return {
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    email: patient.email || '',
    phone: patient.phone || '',
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
    gender: patient.gender || 'OTHER',
    address: patient.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    emergencyContact: patient.emergencyContact || {
      name: '',
      phone: '',
      relationship: '',
    },
    medicalHistory: patient.medicalHistory || '',
    allergies: patient.allergies || [],
    medications: patient.medications || [],
    insurance: patient.insurance || {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    },
  };
};
