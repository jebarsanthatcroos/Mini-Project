// models/Order.ts
import { Schema, model, models, Document, Types, Model } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  prescriptionVerified: boolean;
  verifiedBy?: Types.ObjectId;
}

export interface IOrder {
  orderNumber: string;
  customer: Types.ObjectId;
  pharmacy: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'insurance';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: string;
  driver?: Types.ObjectId;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define interface for static methods
interface IOrderModel extends Model<IOrderDocument> {
  generateOrderNumber(): Promise<string>;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  prescriptionVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const OrderSchema = new Schema<IOrderDocument, IOrderModel>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Delivery address cannot exceed 500 characters'],
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { _id, __v, ...rest } = ret;
        return {
          id: _id.toString(),
          ...rest,
        };
      },
    },
  }
);

// Indexes
OrderSchema.index({ customer: 1 });
OrderSchema.index({ pharmacy: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'items.product': 1 });

// Static method to generate order number
OrderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');

  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^ORD-${dateString}`),
  }).sort({ orderNumber: -1 });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }

  return `ORD-${dateString}-${sequence.toString().padStart(4, '0')}`;
};

const Order = (models.Order ||
  model<IOrderDocument, IOrderModel>('Order', OrderSchema)) as IOrderModel;

export default Order;
