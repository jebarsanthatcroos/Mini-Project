export interface DoctorSettings {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  bio: string;
  consultationFee: number;
  availableHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

export interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  bio: string;
  consultationFee: number;
  availableHours?: {
    start: string;
    end: string;
  };
  workingDays?: string[];
  experience?: number;
  education?: string[];
  awards?: string[];
  profilePicture?: string;
  createdAt: string;
  isVerified: boolean;
  qualifications: string[];
  department: string;
  licenseExpiry: Date;
  languages: string[];
  services: string[];
  publications?: string[];
  rating?: {
    average: number;
    count: number;
  };
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  createdAt: string;
  updatedAt: string;
}

// Medical Records
export interface MedicalRecord {
  _id: string;
  patientId: Patient;
  recordType:
    | 'CONSULTATION'
    | 'LAB_RESULT'
    | 'IMAGING'
    | 'ECG'
    | 'PRESCRIPTION'
    | 'PROGRESS_NOTE'
    | 'SURGICAL_REPORT'
    | 'DISCHARGE_SUMMARY'
    | 'OTHER';
  title: string;
  description: string;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  doctorNotes?: string;
}

export interface MedicalRecordFormData {
  patientId: string;
  recordType: string;
  title: string;
  description: string;
  date: string;
  status: string;
  doctorNotes: string;
  attachments: File[];
  existingAttachments: string[];
}

// Prescription Management
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
}

export interface Prescription {
  _id: string;
  patientId: Patient;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// Appointment Interface (Missing from original)
export interface Appointment {
  _id: string;
  patientId: Patient;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'CHECKUP' | 'EMERGENCY';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Filter Interfaces
export interface RecordFilters {
  recordType: string;
  status: string;
  patient: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface PrescriptionFilters {
  status: string;
  patient: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AppointmentFilters {
  status: string;
  patient: string;
  dateRange: {
    start: string;
    end: string;
  };
  type: string;
}

// Stats Interfaces
export interface DoctorStats {
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  averageRating: number;
  totalRatings?: number;
  recentRecords?: number;
  todayAppointments?: number;
}

export interface RecordStats {
  total: number;
  consultations: number;
  labResults: number;
  imaging: number;
  prescriptions: number;
  active: number;
  completed: number;
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

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
}

// Utility Interfaces
export interface Message {
  type: 'success' | 'error' | '';
  content: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
