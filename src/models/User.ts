import { Schema, model, models, Document, Types } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  image?: string;
  emailVerified?: Date;
  phone?: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  address?: string;
  bio?: string;
  isActive?: boolean;
  lastLogin?: Date;
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    appointmentReminders: boolean;
    messageAlerts: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
  };
}

export type UserRole =
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LABTECH'
  | 'PHARMACIST'
  | 'STAFF'
  | 'PATIENT'
  | 'USER';

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  displayName: string;
  roleDisplayName: string;

  // Methods
  isActiveUser(): boolean;
  hasRole(role: UserRole | UserRole[]): boolean;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // This automatically creates an index
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        'ADMIN',
        'DOCTOR',
        'NURSE',
        'RECEPTIONIST',
        'LABTECH',
        'PHARMACIST',
        'STAFF',
        'PATIENT',
        'USER',
      ],
      default: 'USER',
    },
    image: { type: String },
    emailVerified: { type: Date },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: [100, 'Specialization cannot exceed 100 characters'],
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      inAppNotifications: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
      messageAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, password, ...rest } = ret;
        return {
          id: _id.toString(),
          ...rest,
        };
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual for display name
UserSchema.virtual('displayName').get(function (this: IUserDocument) {
  if (this.role === 'DOCTOR') {
    return `Dr. ${this.name}`;
  }
  return this.name;
});

// Virtual for role display name
UserSchema.virtual('roleDisplayName').get(function (this: IUserDocument) {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Admin',
    DOCTOR: 'Medical Doctor',
    NURSE: 'Registered Nurse',
    PATIENT: 'Patient',
    RECEPTIONIST: 'Receptionist',
    LABTECH: 'Laboratory Technician',
    PHARMACIST: 'Pharmacist',
    STAFF: 'Staff Member',
    USER: 'User',
  };

  return roleNames[this.role] || this.role;
});

// Method to check if user is active
UserSchema.methods.isActiveUser = function (this: IUserDocument): boolean {
  return this.isActive === true && this.emailVerified !== null;
};

// Method to check role
UserSchema.methods.hasRole = function (
  this: IUserDocument,
  role: UserRole | UserRole[]
): boolean {
  if (Array.isArray(role)) {
    return role.includes(this.role);
  }
  return this.role === role;
};

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ createdAt: -1 });

// Static method to find active users
UserSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, emailVerified: { $ne: null } });
};

// Static method to find by role
UserSchema.statics.findByRole = function (role: UserRole) {
  return this.find({ role, isActive: true });
};

const User = models.User || model<IUserDocument>('User', UserSchema);

export default User;
