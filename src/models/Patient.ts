// models/Patient.ts
import { Schema, model, models, Document, Types, Model } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface IInsurance {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
}

export interface IPatient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: IAddress;
  emergencyContact?: IEmergencyContact;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  insurance?: IInsurance;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height?: number;
  weight?: number;
  isActive?: boolean;
}

export interface IPatientDocument extends IPatient, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  age: number;
  bmi?: number;
  fullName: string;
  calculateAge(): number;
  calculateBMI(): number | null;
  hasAllergy(allergen: string): boolean;
  addAllergy(allergen: string): void;
  removeAllergy(allergen: string): void;
  hasMedication(medication: string): boolean;
  addMedication(medication: string): void;
  removeMedication(medication: string): void;
}

interface IPatientModel extends Model<IPatientDocument> {
  findActivePatients(): Promise<IPatientDocument[]>;
  findByEmail(email: string): Promise<IPatientDocument | null>;
  searchPatients(searchTerm: string): Promise<IPatientDocument[]>;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },
  zipCode: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' },
});

const EmergencyContactSchema = new Schema<IEmergencyContact>({
  name: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  relationship: { type: String, trim: true, default: '' },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email',
    ],
  },
});

const InsuranceSchema = new Schema<IInsurance>({
  provider: { type: String, trim: true, default: '' },
  policyNumber: { type: String, trim: true, default: '' },
  groupNumber: { type: String, trim: true, default: '' },
});

const PatientSchema = new Schema<IPatientDocument, IPatientModel>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function (value: Date) {
          return value < new Date();
        },
        message: 'Date of birth must be in the past',
      },
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    address: {
      type: AddressSchema,
      default: () => ({}),
    },
    emergencyContact: {
      type: EmergencyContactSchema,
      default: () => ({}),
    },
    medicalHistory: {
      type: String,
      trim: true,
      maxlength: [2000, 'Medical history cannot exceed 2000 characters'],
      default: '',
    },
    allergies: {
      type: [String],
      default: [],
      set: function (allergies: string[]) {
        return [...new Set(allergies.map(a => a.toLowerCase().trim()))];
      },
    },
    medications: {
      type: [String],
      default: [],
      set: function (medications: string[]) {
        return [...new Set(medications.map(m => m.trim()))];
      },
    },
    insurance: {
      type: InsuranceSchema,
      default: () => ({}),
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    height: {
      type: Number,
      min: [0, 'Height must be positive'],
      max: [300, 'Height must be realistic (max 300cm)'],
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be positive'],
      max: [500, 'Weight must be realistic (max 500kg)'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        const { _id, __v, ...rest } = ret;
        return {
          _id: _id.toString(),
          ...rest,
        };
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        const { _id, __v, ...rest } = ret;
        return {
          _id: _id.toString(),
          ...rest,
        };
      },
    },
  }
);

// Virtuals
PatientSchema.virtual('age').get(function (this: IPatientDocument) {
  return this.calculateAge();
});

PatientSchema.virtual('bmi').get(function (this: IPatientDocument) {
  return this.calculateBMI();
});

PatientSchema.virtual('fullName').get(function (this: IPatientDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
PatientSchema.methods.calculateAge = function (this: IPatientDocument): number {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

PatientSchema.methods.calculateBMI = function (
  this: IPatientDocument
): number | null {
  if (!this.height || !this.weight || this.height === 0) return null;
  const heightInMeters = this.height / 100;
  const bmi = this.weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
};

PatientSchema.methods.hasAllergy = function (
  this: IPatientDocument,
  allergen: string
): boolean {
  return this.allergies
    ? this.allergies.includes(allergen.toLowerCase().trim())
    : false;
};

PatientSchema.methods.addAllergy = function (
  this: IPatientDocument,
  allergen: string
): void {
  if (!this.allergies) this.allergies = [];
  const normalizedAllergen = allergen.toLowerCase().trim();
  if (!this.allergies.includes(normalizedAllergen)) {
    this.allergies.push(normalizedAllergen);
  }
};

PatientSchema.methods.removeAllergy = function (
  this: IPatientDocument,
  allergen: string
): void {
  if (this.allergies) {
    const normalizedAllergen = allergen.toLowerCase().trim();
    this.allergies = this.allergies.filter(a => a !== normalizedAllergen);
  }
};

PatientSchema.methods.hasMedication = function (
  this: IPatientDocument,
  medication: string
): boolean {
  return this.medications
    ? this.medications.includes(medication.trim())
    : false;
};

PatientSchema.methods.addMedication = function (
  this: IPatientDocument,
  medication: string
): void {
  if (!this.medications) this.medications = [];
  const normalizedMedication = medication.trim();
  if (!this.medications.includes(normalizedMedication)) {
    this.medications.push(normalizedMedication);
  }
};

PatientSchema.methods.removeMedication = function (
  this: IPatientDocument,
  medication: string
): void {
  if (this.medications) {
    const normalizedMedication = medication.trim();
    this.medications = this.medications.filter(m => m !== normalizedMedication);
  }
};

// Static methods
PatientSchema.statics.findActivePatients = function () {
  return this.find({ isActive: true }).sort({ firstName: 1, lastName: 1 });
};

PatientSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

PatientSchema.statics.searchPatients = function (searchTerm: string) {
  return this.find({
    isActive: true,
    $or: [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } },
    ],
  }).sort({ firstName: 1, lastName: 1 });
};

// Indexes
PatientSchema.index({ email: 1 }, { unique: true });
PatientSchema.index({ isActive: 1 });
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ dateOfBirth: 1 });
PatientSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  phone: 'text',
  'address.city': 'text',
  'address.state': 'text',
});

// Middleware
PatientSchema.pre('save', function (next) {
  // Ensure nested objects exist
  if (!this.address) {
    this.address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    };
  }

  if (!this.emergencyContact) {
    this.emergencyContact = {
      name: '',
      phone: '',
      relationship: '',
    };
  }

  if (!this.insurance) {
    this.insurance = {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    };
  }

  next();
});

PatientSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Patient =
  (models.Patient as IPatientModel) ||
  model<IPatientDocument, IPatientModel>('Patient', PatientSchema);

export default Patient;
