// app/lab/orders/new/types.ts
export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  medicalRecordNumber?: string;
}

export interface LabTest {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  duration: number;
  sampleType: string;
  preparationInstructions?: string;
  normalRange?: string;
  units?: string;
}

export interface NewOrderData {
  patientId: string;
  testId: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'STAT';
  notes: string;
  referral: string;
  isCritical: boolean;
  requestedDate: string;
}

export interface PatientSelectionProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient) => void;
}

export interface TestSelectionProps {
  availableTests: LabTest[];
  selectedTest: LabTest | null;
  onTestSelect: (test: LabTest) => void;
}

export interface OrderDetailsProps {
  orderData: NewOrderData;
  onOrderDataChange: (updates: Partial<NewOrderData>) => void;
}

export interface PrioritySettingsProps {
  orderData: NewOrderData;
  onOrderDataChange: (updates: Partial<NewOrderData>) => void;
}

export interface OrderSummaryProps {
  selectedPatient: Patient | null;
  selectedTest: LabTest | null;
  orderData: NewOrderData;
  submitting: boolean;
}
