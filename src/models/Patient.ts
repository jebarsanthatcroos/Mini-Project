// models/Patient.ts
import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface IPatient {
  userId: Types.ObjectId;
  medicalRecordNumber: string;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE" | "OTHER";
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  height?: number; // in cm
  weight?: number; // in kg
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    expiryDate?: Date;
  };
  primaryPhysician?: Types.ObjectId; // Reference to Doctor (User)
  notes?: string;
  isActive?: boolean;
}

export interface IPatientDocument extends IPatient, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  age: number;
  bmi?: number;
  fullMedicalRecord: string;
  
  // Methods
  calculateAge(): number;
  calculateBMI(): number | null;
  hasAllergy(allergen: string): boolean;
  addAllergy(allergen: string): void;
  removeAllergy(allergen: string): void;
}

const PatientSchema = new Schema<IPatientDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true
    },
    medicalRecordNumber: {
      type: String,
      required: [true, "Medical record number is required"],
      unique: true,
      uppercase: true,
      match: [/^MRN-\d{8}$/, "Medical record number must be in format MRN-XXXXXXXX"]
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function(value: Date) {
          return value < new Date();
        },
        message: "Date of birth must be in the past"
      }
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: [true, "Gender is required"]
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    height: {
      type: Number,
      min: [0, "Height must be positive"],
      max: [300, "Height must be realistic (max 300cm)"]
    },
    weight: {
      type: Number,
      min: [0, "Weight must be positive"],
      max: [500, "Weight must be realistic (max 500kg)"]
    },
    allergies: {
      type: [String],
      default: []
    },
    chronicConditions: {
      type: [String],
      default: []
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, "Emergency contact name is required"],
        trim: true
      },
      relationship: {
        type: String,
        required: [true, "Emergency contact relationship is required"],
        trim: true
      },
      phone: {
        type: String,
        required: [true, "Emergency contact phone is required"],
        match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"]
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
      }
    },
    insurance: {
      provider: {
        type: String,
        trim: true
      },
      policyNumber: {
        type: String,
        trim: true,
        uppercase: true
      },
      groupNumber: {
        type: String,
        trim: true
      },
      expiryDate: {
        type: Date,
        validate: {
          validator: function(value: Date) {
            return !value || value > new Date();
          },
          message: "Insurance expiry date must be in the future"
        }
      }
    },
    primaryPhysician: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, ...rest } = ret;
        return {
          id: _id.toString(),
          ...rest
        };
      }
    },
    toObject: { virtuals: true }
  }
);

// Virtual for age calculation
PatientSchema.virtual('age').get(function(this: IPatientDocument) {
  return this.calculateAge();
});

// Virtual for BMI calculation
PatientSchema.virtual('bmi').get(function(this: IPatientDocument) {
  return this.calculateBMI();
});

// Virtual for full medical record string
PatientSchema.virtual('fullMedicalRecord').get(function(this: IPatientDocument) {
  return `${this.medicalRecordNumber} - DOB: ${this.dateOfBirth.toISOString().split('T')[0]}`;
});

// Method to calculate age
PatientSchema.methods.calculateAge = function(this: IPatientDocument): number {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Method to calculate BMI
PatientSchema.methods.calculateBMI = function(this: IPatientDocument): number | null {
  if (!this.height || !this.weight) {
    return null;
  }
  
  const heightInMeters = this.height / 100;
  const bmi = this.weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
};

// Method to check if patient has specific allergy
PatientSchema.methods.hasAllergy = function(this: IPatientDocument, allergen: string): boolean {
  return this.allergies ? this.allergies.includes(allergen.toLowerCase()) : false;
};

// Method to add allergy
PatientSchema.methods.addAllergy = function(this: IPatientDocument, allergen: string): void {
  if (!this.allergies) {
    this.allergies = [];
  }
  
  const normalizedAllergen = allergen.toLowerCase();
  if (!this.allergies.includes(normalizedAllergen)) {
    this.allergies.push(normalizedAllergen);
  }
};

// Method to remove allergy
PatientSchema.methods.removeAllergy = function(this: IPatientDocument, allergen: string): void {
  if (this.allergies) {
    this.allergies = this.allergies.filter(a => a !== allergen.toLowerCase());
  }
};

// Indexes for better query performance
PatientSchema.index({ userId: 1 });
PatientSchema.index({ medicalRecordNumber: 1 });
PatientSchema.index({ isActive: 1 });
PatientSchema.index({ primaryPhysician: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ dateOfBirth: 1 });

// Static method to find active patients
PatientSchema.statics.findActivePatients = function() {
  return this.find({ isActive: true }).populate('userId primaryPhysician');
};

// Static method to find by primary physician
PatientSchema.statics.findByPhysician = function(physicianId: Types.ObjectId) {
  return this.find({ primaryPhysician: physicianId, isActive: true }).populate('userId');
};

// Static method to generate medical record number
PatientSchema.statics.generateMRN = async function() {
  const count = await this.countDocuments();
  const nextNumber = (count + 1).toString().padStart(8, '0');
  return `MRN-${nextNumber}`;
};

// Middleware to validate user exists and has PATIENT role
PatientSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('userId')) {
    const User = models.User || model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.role !== 'PATIENT') {
      throw new Error('User must have PATIENT role');
    }
  }
  
  next();
});

// Middleware to validate primary physician
PatientSchema.pre('save', async function(next) {
  if (this.primaryPhysician) {
    const User = models.User || model('User');
    const physician = await User.findById(this.primaryPhysician);
    
    if (!physician) {
      throw new Error('Primary physician not found');
    }
    
    if (physician.role !== 'DOCTOR') {
      throw new Error('Primary physician must have DOCTOR role');
    }
  }
  
  next();
});

// Add static methods to the schema interface
interface PatientModel extends Schema<IPatientDocument> {
  findActivePatients(): Promise<IPatientDocument[]>;
  findByPhysician(physicianId: Types.ObjectId): Promise<IPatientDocument[]>;
  generateMRN(): Promise<string>;
}

const Patient = (models.Patient as unknown as Model<IPatientDocument> & PatientModel) || 
  model<IPatientDocument, PatientModel>("Patient", PatientSchema);

export default Patient;