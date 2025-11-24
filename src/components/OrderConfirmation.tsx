'use client';

import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiTruck, FiHome, FiShare2 } from 'react-icons/fi';
import { Order } from '@/types/product';

interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
  onTrackOrder: () => void;
}

export default function OrderConfirmation({ order, onContinueShopping, onTrackOrder }: OrderConfirmationProps) {
  const steps = [
    { status: 'confirmed', label: 'Order Confirmed', icon: FiCheck },
    { status: 'processing', label: 'Processing', icon: FiPackage },
    { status: 'shipped', label: 'Shipped', icon: FiTruck },
    { status: 'delivered', label: 'Delivered', icon: FiHome },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === order.status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheck className="text-4xl text-green-600" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-4">
          Thank you for your purchase. Your order has been received.
        </p>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 inline-block">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="text-2xl font-bold text-gray-900">{order.orderNumber}</p>
          <p className="text-sm text-gray-600 mt-2">
            Estimated Delivery: {new Date(order.estimatedDelivery!).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
        <div className="flex justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10" />
          <div
            className="absolute top-4 left-0 h-1 bg-green-600 -z-10 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center relative"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                >
                  <Icon className="text-sm" />
                </div>
                <p
                  className={`text-sm font-medium mt-2 ${
                    isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FiPackage className="text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount</span>
            <span>Rs. {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinueShopping}
          className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg"
        >
          Continue Shopping
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTrackOrder}
          className="flex-1 border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
        >
          <FiShare2 />
          Track Order
        </motion.button>
      </motion.div>
    </motion.div>
  );
}