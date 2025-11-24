import { Schema, model, models, Document, Types } from "mongoose";

export interface IPharmacy {
  name: string;
  address: string;
  phone: string;
  email?: string;
  pharmacistName: string;
  licenseNumber: string;
  operatingHours: {
    open: string;
    close: string;
  };
  services: string[];
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdBy: Types.ObjectId;
  website?: string;
  emergencyContact?: string;
  insuranceProviders?: string[];
}

export interface IPharmacyDocument extends IPharmacy, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  isOpen: boolean;
  formattedHours: string;
  
  // Methods
  isActive(): boolean;
  hasService(service: string): boolean;
}

const PharmacySchema = new Schema<IPharmacyDocument>(
  {
    name: { 
      type: String, 
      required: [true, "Pharmacy name is required"], 
      trim: true,
      minlength: [2, "Pharmacy name must be at least 2 characters"],
      maxlength: [100, "Pharmacy name cannot exceed 100 characters"]
    },
    address: { 
      type: String, 
      required: [true, "Address is required"], 
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    phone: { 
      type: String, 
      required: [true, "Phone number is required"],
      match: [/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"]
    },
    email: { 
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    pharmacistName: { 
      type: String, 
      required: [true, "Pharmacist name is required"],
      trim: true,
      maxlength: [100, "Pharmacist name cannot exceed 100 characters"]
    },
    licenseNumber: { 
      type: String, 
      required: [true, "License number is required"],
      unique: true, // This automatically creates an index
      uppercase: true,
      trim: true
    },
    operatingHours: {
      open: {
        type: String,
        required: true,
        default: "09:00",
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:MM format"]
      },
      close: {
        type: String,
        required: true,
        default: "18:00",
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:MM format"]
      }
    },
    services: [{
      type: String,
      trim: true
    }],
    description: { 
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    status: { 
      type: String, 
      enum: ["active", "inactive", "suspended"], 
      default: "active" 
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"]
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+\..+$/, "Please enter a valid website URL"]
    },
    emergencyContact: {
      type: String,
      match: [/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"]
    },
    insuranceProviders: [{
      type: String,
      trim: true
    }]
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

// Virtual for checking if pharmacy is currently open
PharmacySchema.virtual('isOpen').get(function(this: IPharmacyDocument) {
  try {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    // Add null checks for operatingHours
    if (!this.operatingHours?.open || !this.operatingHours?.close) {
      return false;
    }
    
    return currentTime >= this.operatingHours.open && currentTime <= this.operatingHours.close;
  } catch (error) {
    console.error('Error calculating isOpen:', error);
    return false;
  }
});

// Virtual for formatted operating hours
PharmacySchema.virtual('formattedHours').get(function(this: IPharmacyDocument) {
  try {
    const formatTime = (time: string) => {
      // Add null/undefined check and validate time format
      if (!time || typeof time !== 'string') {
        return 'N/A';
      }
      
      const timeParts = time.split(':');
      if (timeParts.length !== 2) {
        return 'N/A';
      }
      
      const [hours, minutes] = timeParts;
      const hour = parseInt(hours);
      
      // Validate hour and minutes
      if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(parseInt(minutes))) {
        return 'N/A';
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Add null checks for operatingHours
    if (!this.operatingHours?.open || !this.operatingHours?.close) {
      return 'N/A - N/A';
    }

    return `${formatTime(this.operatingHours.open)} - ${formatTime(this.operatingHours.close)}`;
  } catch (error) {
    console.error('Error formatting hours:', error);
    return 'N/A - N/A';
  }
});

// Method to check if pharmacy is active
PharmacySchema.methods.isActive = function(this: IPharmacyDocument): boolean {
  return this.status === 'active';
};

// Method to check if pharmacy offers a specific service
PharmacySchema.methods.hasService = function(this: IPharmacyDocument, service: string): boolean {
  return this.services.includes(service);
};

// Indexes for better query performance
// REMOVED DUPLICATE: PharmacySchema.index({ licenseNumber: 1 }, { unique: true });
// The unique: true on licenseNumber already creates this index
PharmacySchema.index({ name: 'text', address: 'text', pharmacistName: 'text' });
PharmacySchema.index({ status: 1 });
PharmacySchema.index({ createdBy: 1 });
PharmacySchema.index({ "operatingHours.open": 1, "operatingHours.close": 1 });
PharmacySchema.index({ createdAt: -1 });

// Static method to find active pharmacies
PharmacySchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find pharmacies by service
PharmacySchema.statics.findByService = function(service: string) {
  return this.find({ 
    status: 'active', 
    services: { $in: [service] } 
  });
};

// Middleware to validate operating hours
PharmacySchema.pre('save', function(next) {
  if (this.operatingHours.open >= this.operatingHours.close) {
    next(new Error('Opening time must be before closing time'));
  }
  next();
});

const Pharmacy = models.Pharmacy || model<IPharmacyDocument>("Pharmacy", PharmacySchema);

export default Pharmacy;