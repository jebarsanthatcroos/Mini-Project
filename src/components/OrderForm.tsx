'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiCheck,
} from 'react-icons/fi';


export interface Product {
  _id: string;
  name: string;
  price: number;
  quantity?: number;
}

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
  }),
  paymentMethod: z.enum(['card', 'cash', 'online']),
  specialInstructions: z.string().optional(),
  agreeToTerms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
});

export type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  products: Product[];
  onOrderSubmit: (data: OrderFormData) => void;
  isSubmitting?: boolean;
}


export default function OrderForm({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  products,
  onOrderSubmit,
  isSubmitting = false,
}: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      paymentMethod: 'card',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPaymentMethod = watch('paymentMethod');

  const paymentMethods = [
    { value: 'card', label: 'Credit Card', icon: FiCreditCard },
    { value: 'cash', label: 'Cash on Delivery', icon: FiCheck },
    { value: 'online', label: 'Online Payment', icon: FiCreditCard },
  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <form onSubmit={handleSubmit(onOrderSubmit)} className="space-y-8">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAME */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FiUser className="text-gray-400" />
                Full Name
              </label>
              <input
                {...register('customer.name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
              {errors.customer?.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customer.name.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FiMail className="text-gray-400" />
                Email Address
              </label>
              <input
                {...register('customer.email')}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
              {errors.customer?.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customer.email.message}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="text-gray-400" />
                Phone Number
              </label>
              <input
                {...register('customer.phone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
              {errors.customer?.phone && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customer.phone.message}
                </p>
              )}
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="text-gray-400" />
                Delivery Address
              </label>
              <textarea
                {...register('customer.address')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter complete delivery address"
              />
              {errors.customer?.address && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customer.address.message}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;

              return (
                <motion.label
                  key={method.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value={method.value}
                    className="absolute opacity-0"
                  />

                  <Icon
                    className={`text-2xl mb-2 ${
                      selectedPaymentMethod === method.value
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <span className="font-medium text-gray-900">{method.label}</span>
                </motion.label>
              );
            })}
          </div>
        </motion.div>

    
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Additional Information
          </h2>
          <textarea
            {...register('specialInstructions')}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Any special instructions or notes for delivery..."
          />
        </motion.div>

     
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-start gap-3 mb-6">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
              {errors.agreeToTerms && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Order...
              </div>
            ) : (
              'Place Order'
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
