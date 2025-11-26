import { Schema, model, models, Document, Types } from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  minStockLevel: number;
  pharmacy: Types.ObjectId;
  sku: string;
  manufacturer: string;
  requiresPrescription: boolean;
  isControlledSubstance: boolean;
  sideEffects?: string;
  dosage?: string;
  activeIngredients?: string;
  barcode: string;
  createdBy: Types.ObjectId;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: [true, 'Pharmacy is required'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true, // This automatically creates an index
      trim: true,
      uppercase: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
      maxlength: [100, 'Manufacturer name cannot exceed 100 characters'],
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    isControlledSubstance: {
      type: Boolean,
      default: false,
    },
    sideEffects: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        'Side effects description cannot exceed 1000 characters',
      ],
    },
    dosage: {
      type: String,
      trim: true,
      maxlength: [500, 'Dosage information cannot exceed 500 characters'],
    },
    activeIngredients: {
      type: String,
      trim: true,
      maxlength: [500, 'Active ingredients cannot exceed 500 characters'],
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const { _id, __v, ...rest } = ret;
        return {
          id: _id.toString(),
          ...rest,
        };
      },
    },
  }
);

// Indexes for better query performance
// REMOVED DUPLICATE: ProductSchema.index({ sku: 1 }, { unique: true });
// The unique: true on the sku field already creates this index
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ pharmacy: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Compound index for unique product names per pharmacy
ProductSchema.index({ name: 1, pharmacy: 1 }, { unique: true });

const Product =
  models.Product || model<IProductDocument>('Product', ProductSchema);

export default Product;
