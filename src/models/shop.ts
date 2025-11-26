import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  inStock?: boolean;
  category?: string;
  email?: string; // If you have email field
  createdAt: Date;
}

const shopSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
  },
  email: {
    type: String,
    // Remove index: true if you use schema.index() below
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Remove this line if you have index: true in the schema above
// shopSchema.index({ email: 1 });

export default mongoose.models.Shop ||
  mongoose.model<IShop>('Shop', shopSchema);
