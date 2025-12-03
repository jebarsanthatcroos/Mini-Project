import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiDroplet,
  FiClock,
  FiDollarSign,
  FiSave,
  FiAlertTriangle,
} from 'react-icons/fi';
import { OrderSummaryProps } from '../types';

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedPatient,
  selectedTest,
  orderData,
  submitting,
}) => {
  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'text-gray-600 bg-gray-100',
      NORMAL: 'text-blue-600 bg-blue-100',
      HIGH: 'text-orange-600 bg-orange-100',
      STAT: 'text-red-600 bg-red-100',
    };
    return colors[priority as keyof typeof colors] || colors.NORMAL;
  };

  const canSubmit = selectedPatient && selectedTest;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className='sticky top-8'
    >
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Order Summary
        </h2>

        {/* Patient Summary */}
        <div className='mb-6'>
          <h3 className='font-medium text-gray-700 mb-3 flex items-center'>
            <FiUser className='w-4 h-4 mr-2' />
            Patient
          </h3>
          {selectedPatient ? (
            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='font-medium text-gray-900'>
                {selectedPatient.name}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {selectedPatient.email}
              </p>
              {selectedPatient.medicalRecordNumber && (
                <p className='text-sm text-gray-500'>
                  MRN: {selectedPatient.medicalRecordNumber}
                </p>
              )}
            </div>
          ) : (
            <p className='text-gray-500 text-sm'>No patient selected</p>
          )}
        </div>

        {/* Test Summary */}
        <div className='mb-6'>
          <h3 className='font-medium text-gray-700 mb-3 flex items-center'>
            <FiDroplet className='w-4 h-4 mr-2' />
            Test
          </h3>
          {selectedTest ? (
            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='font-medium text-gray-900'>{selectedTest.name}</p>
              <div className='flex items-center justify-between mt-2 text-sm text-gray-600'>
                <span className='capitalize'>
                  {selectedTest.sampleType.toLowerCase()}
                </span>
                <span className='flex items-center'>
                  <FiClock className='w-3 h-3 mr-1' />
                  {selectedTest.duration}m
                </span>
              </div>
              <div className='flex items-center justify-between mt-1'>
                <span className='text-sm text-gray-500'>
                  {selectedTest.category}
                </span>
                <span className='font-semibold text-green-600 flex items-center'>
                  <FiDollarSign className='w-3 h-3 mr-1' />
                  {selectedTest.price}
                </span>
              </div>
            </div>
          ) : (
            <p className='text-gray-500 text-sm'>No test selected</p>
          )}
        </div>

        {/* Order Details */}
        <div className='space-y-3 border-t border-gray-200 pt-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>Priority:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(orderData.priority)}`}
            >
              {orderData.priority}
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>Critical:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                orderData.isCritical
                  ? 'text-red-600 bg-red-100'
                  : 'text-gray-600 bg-gray-100'
              }`}
            >
              {orderData.isCritical ? 'YES' : 'NO'}
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>Requested Date:</span>
            <span className='text-sm font-medium text-gray-900'>
              {new Date(orderData.requestedDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={!canSubmit || submitting}
          className='w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center'
        >
          {submitting ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Creating Order...
            </>
          ) : (
            <>
              <FiSave className='w-4 h-4 mr-2' />
              Create Lab Order
            </>
          )}
        </button>

        {/* Validation Message */}
        {!canSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mt-4 flex items-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3'
          >
            <FiAlertTriangle className='w-4 h-4 mr-2 shrink-0' />
            Please select both a patient and a test to create the order.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderSummary;
