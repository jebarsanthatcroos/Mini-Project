/* eslint-disable @typescript-eslint/no-explicit-any */

export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  FULL_DAY = 'FULL_DAY',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  BI_WEEKLY = 'BI_WEEKLY',
  WEEKLY = 'WEEKLY',
}

export enum TrainingStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  EXPIRED = 'EXPIRED',
}

export interface IWorkScheduleDay {
  start: string;
  end: string;
  active: boolean;
}

export interface IWorkSchedule {
  monday: IWorkScheduleDay;
  tuesday: IWorkScheduleDay;
  wednesday: IWorkScheduleDay;
  thursday: IWorkScheduleDay;
  friday: IWorkScheduleDay;
  saturday: IWorkScheduleDay;
  sunday: IWorkScheduleDay;
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ISalary {
  basic: number;
  allowances: number;
  deductions: number;
  currency: string;
  paymentFrequency: PaymentFrequency;
}

export interface IPerformanceMetrics {
  averageCheckInTime: number;
  averageAppointmentTime: number;
  patientSatisfactionScore: number;
  totalAppointmentsHandled: number;
  errorRate: number;
}

export interface IPermissions {
  canManageAppointments: boolean;
  canManagePatients: boolean;
  canManageBilling: boolean;
  canViewReports: boolean;
  canManageInventory: boolean;
  canHandleEmergency: boolean;
  canAccessMedicalRecords: boolean;
  canManagePrescriptions: boolean;
}

export interface ITrainingRecord {
  _id?: string;
  courseName: string;
  completionDate: Date | string;
  expiryDate?: Date | string;
  certificateId?: string;
  status: TrainingStatus;
}

export interface IReceptionist {
  _id?: string;
  user: string | IUserBasic;
  employeeId: string;
  shift: ShiftType;
  workSchedule: IWorkSchedule;
  department?: string;
  assignedDoctor?: string | IUserBasic;
  maxAppointmentsPerDay?: number;
  currentAppointmentsCount?: number;
  skills?: string[];
  languages?: string[];
  emergencyContact?: IEmergencyContact;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: Date | string;
  terminationDate?: Date | string;
  salary?: ISalary;
  performanceMetrics?: IPerformanceMetrics;
  permissions: IPermissions;
  trainingRecords?: ITrainingRecord[];
  lastModifiedBy?: string;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IUserBasic {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  role?: string;
}

export interface IUserFull extends IUserBasic {
  department?: string;
  specialization?: string;
  isActive?: boolean;
}

export interface IReceptionistPopulated
  extends Omit<IReceptionist, 'user' | 'assignedDoctor'> {
  user: IUserFull;
  assignedDoctor?: IUserFull;
  fullName: string;
  email: string;
  phone: string;
  isAvailable: boolean;
}

export interface IReceptionistResponse {
  success: boolean;
  data?: IReceptionistPopulated;
  message?: string;
  error?: string;
}

export interface IReceptionistsResponse {
  success: boolean;
  data?: IReceptionistPopulated[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface ICreateReceptionistRequest {
  userId: string;
  employeeId: string;
  shift: ShiftType;
  workSchedule?: Partial<IWorkSchedule>;
  department?: string;
  assignedDoctor?: string;
  maxAppointmentsPerDay?: number;
  skills?: string[];
  languages?: string[];
  emergencyContact?: IEmergencyContact;
  employmentStatus?: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: Date | string;
  salary?: ISalary;
  permissions?: Partial<IPermissions>;
  notes?: string;
}

export interface IUpdateReceptionistRequest {
  shift?: ShiftType;
  workSchedule?: Partial<IWorkSchedule>;
  department?: string;
  assignedDoctor?: string;
  maxAppointmentsPerDay?: number;
  skills?: string[];
  languages?: string[];
  emergencyContact?: IEmergencyContact;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
  terminationDate?: Date | string;
  salary?: Partial<ISalary>;
  performanceMetrics?: Partial<IPerformanceMetrics>;
  permissions?: Partial<IPermissions>;
  trainingRecords?: ITrainingRecord[];
  notes?: string;
  lastModifiedBy?: string;
}

export interface IReceptionistFilters {
  employeeId?: string;
  shift?: ShiftType;
  department?: string;
  employmentStatus?: EmploymentStatus | EmploymentStatus[];
  employmentType?: EmploymentType;
  skills?: string[];
  languages?: string[];
  isAvailable?: boolean;
  search?: string;
}

export interface IReceptionistQuery extends IReceptionistFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  populate?: boolean;
}

export interface IDepartmentMetrics {
  totalReceptionists: number;
  availableCount: number;
  averageSatisfaction: number;
  byShift?: {
    [key in ShiftType]?: number;
  };
  byEmploymentType?: {
    [key in EmploymentType]?: number;
  };
}

export interface IReceptionistStats {
  total: number;
  active: number;
  onLeave: number;
  suspended: number;
  terminated: number;
  available: number;
  unavailable: number;
  byShift: {
    [key in ShiftType]: number;
  };
  byDepartment: {
    [key: string]: number;
  };
  averagePerformance: number;
  totalAppointmentsToday: number;
}

export interface IScheduleUpdate {
  day: keyof IWorkSchedule;
  start: string;
  end: string;
  active: boolean;
}

export interface IScheduleConflict {
  receptionistId: string;
  receptionistName: string;
  day: string;
  conflictType: 'overlap' | 'invalid_time' | 'outside_hours';
  message: string;
}

export interface IPerformanceUpdate {
  averageCheckInTime?: number;
  averageAppointmentTime?: number;
  patientSatisfactionScore?: number;
  totalAppointmentsHandled?: number;
  errorRate?: number;
}

export interface IPerformanceReport {
  receptionistId: string;
  receptionistName: string;
  department?: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: IPerformanceMetrics;
  rating: number;
  rank?: number;
  improvement?: {
    checkInTime: number;
    appointmentTime: number;
    satisfaction: number;
    errorRate: number;
  };
}

export interface IAddTrainingRequest {
  courseName: string;
  completionDate: Date | string;
  expiryDate?: Date | string;
  certificateId?: string;
  status?: TrainingStatus;
}

export interface ITrainingReport {
  receptionistId: string;
  receptionistName: string;
  totalCourses: number;
  completed: number;
  inProgress: number;
  expired: number;
  upcomingExpirations: ITrainingRecord[];
}

export interface ISalaryUpdate {
  basic?: number;
  allowances?: number;
  deductions?: number;
  currency?: string;
  paymentFrequency?: PaymentFrequency;
  effectiveDate?: Date | string;
}

export interface IPayrollRecord {
  receptionistId: string;
  employeeId: string;
  receptionistName: string;
  period: {
    start: Date;
    end: Date;
  };
  salary: ISalary;
  totalSalary: number;
  daysWorked: number;
  overtimeHours?: number;
  bonuses?: number;
  netPay: number;
  paymentDate: Date;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
}

export interface IAttendanceRecord {
  receptionistId: string;
  date: Date | string;
  checkIn?: Date | string;
  checkOut?: Date | string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
  hoursWorked?: number;
  notes?: string;
}

export interface IAttendanceSummary {
  receptionistId: string;
  receptionistName: string;
  period: {
    start: Date;
    end: Date;
  };
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  attendanceRate: number;
}

export interface IShiftSwapRequest {
  requesterId: string;
  targetId: string;
  date: Date | string;
  requesterShift: ShiftType;
  targetShift: ShiftType;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: Date | string;
}

export interface IShiftAssignment {
  receptionistId: string;
  date: Date | string;
  shift: ShiftType;
  department: string;
  assignedBy: string;
  notes?: string;
}

export interface IReceptionistDashboard {
  personalInfo: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    shift: ShiftType;
    isOnDuty: boolean;
  };
  todaySchedule: IWorkScheduleDay | null;
  appointments: {
    current: number;
    max: number;
    canHandleMore: boolean;
  };
  performance: IPerformanceMetrics;
  rating: number;
  recentActivity: {
    date: Date;
    action: string;
    description: string;
  }[];
  upcomingTraining: ITrainingRecord[];
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    message: string;
    timestamp: Date;
    read: boolean;
  }[];
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}

export type ReceptionistSortField =
  | 'employeeId'
  | 'hireDate'
  | 'performanceMetrics.patientSatisfactionScore'
  | 'currentAppointmentsCount'
  | 'createdAt'
  | 'updatedAt';

export type ReceptionistStatus = 'available' | 'busy' | 'offline' | 'on_leave';

export interface IReceptionistAvailability {
  receptionistId: string;
  name: string;
  status: ReceptionistStatus;
  currentLoad: number;
  maxLoad: number;
  availableSlots: number;
}

export interface IReceptionistExport
  extends Omit<IReceptionist, 'user' | 'assignedDoctor'> {
  userName: string;
  userEmail: string;
  userPhone: string;
  assignedDoctorName?: string;
  totalSalary?: number;
  performanceRating?: number;
}

export interface IBulkReceptionistImport {
  employeeId: string;
  userId: string;
  shift: ShiftType;
  department?: string;
  employmentType: EmploymentType;
  hireDate: string;
  basicSalary?: number;
  skills?: string;
  languages?: string;
}

export interface IBulkImportResult {
  success: number;
  failed: number;
  errors: {
    row: number;
    employeeId: string;
    error: string;
  }[];
}

export const DEFAULT_PERMISSIONS: IPermissions = {
  canManageAppointments: true,
  canManagePatients: true,
  canManageBilling: true,
  canViewReports: false,
  canManageInventory: false,
  canHandleEmergency: true,
  canAccessMedicalRecords: false,
  canManagePrescriptions: false,
};

export const DEFAULT_WORK_SCHEDULE: IWorkSchedule = {
  monday: { start: '08:00', end: '17:00', active: true },
  tuesday: { start: '08:00', end: '17:00', active: true },
  wednesday: { start: '08:00', end: '17:00', active: true },
  thursday: { start: '08:00', end: '17:00', active: true },
  friday: { start: '08:00', end: '17:00', active: true },
  saturday: { start: '09:00', end: '13:00', active: false },
  sunday: { start: '09:00', end: '13:00', active: false },
};

export const SHIFT_TIMES: Record<ShiftType, { start: string; end: string }> = {
  [ShiftType.MORNING]: { start: '06:00', end: '14:00' },
  [ShiftType.EVENING]: { start: '14:00', end: '22:00' },
  [ShiftType.NIGHT]: { start: '22:00', end: '06:00' },
  [ShiftType.FULL_DAY]: { start: '08:00', end: '17:00' },
};

export const isReceptionistPopulated = (
  receptionist: IReceptionist | IReceptionistPopulated
): receptionist is IReceptionistPopulated => {
  return typeof receptionist.user === 'object' && 'name' in receptionist.user;
};

export const hasValidSchedule = (schedule: Partial<IWorkSchedule>): boolean => {
  return Object.values(schedule).some(day => day?.active === true);
};

export const isActiveReceptionist = (receptionist: IReceptionist): boolean => {
  return receptionist.employmentStatus === EmploymentStatus.ACTIVE;
};

export const canManageAppointments = (permissions: IPermissions): boolean => {
  return permissions.canManageAppointments;
};
