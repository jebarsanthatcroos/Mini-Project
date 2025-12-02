import { z } from 'zod';
import { productSchema } from '@/validation/product';

export type ProductFormData = z.infer<typeof productSchema>;

export interface Pharmacy {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  minStockLevel: number;
  sku: string;
  manufacturer: string;
  requiresPrescription: boolean;
  pharmacy: {
    name: string;
    id: string;
  };
  tags?: string[];
  expiryDate?: string;
  weight?: string;
  dimensions?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'cash' | 'online';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  revenue: number;
}
