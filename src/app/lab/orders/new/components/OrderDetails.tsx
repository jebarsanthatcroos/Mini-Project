import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import { OrderDetailsProps } from '../types';

const OrderDetails: React.FC<OrderDetailsProps> = ({
  orderData,
  onOrderDataChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <FiFileText className="w-5 h-5 mr-2 text-blue-600" />
        Order Details
      </h2>

      <div className="space-y-4">
        {/* Requested Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiCalendar className="w-4 h-4 mr-2" />
            Requested Date
          </label>
          <input
            type="date"
            value={orderData.requestedDate}
            onChange={(e) => onOrderDataChange({ requestedDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Referral Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referral Information (Optional)
          </label>
          <input
            type="text"
            placeholder="Referring physician or facility..."
            value={orderData.referral}
            onChange={(e) => onOrderDataChange({ referral: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiUser className="w-4 h-4 mr-2" />
            Clinical Notes (Optional)
          </label>
          <textarea
            placeholder="Any special instructions or clinical context..."
            value={orderData.notes}
            onChange={(e) => onOrderDataChange({ notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetails;