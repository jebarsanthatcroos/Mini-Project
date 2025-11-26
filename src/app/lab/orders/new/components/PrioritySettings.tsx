import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiFlag, FiCheckCircle } from 'react-icons/fi';
import { PrioritySettingsProps } from '../types';

const PrioritySettings: React.FC<PrioritySettingsProps> = ({
  orderData,
  onOrderDataChange,
}) => {
  const priorityOptions = [
    {
      value: 'LOW' as const,
      label: 'Low Priority',
      description: 'Routine testing, no urgency',
      color: 'text-gray-600 bg-gray-100',
      icon: FiCheckCircle,
    },
    {
      value: 'NORMAL' as const,
      label: 'Normal Priority',
      description: 'Standard turnaround time',
      color: 'text-blue-600 bg-blue-100',
      icon: FiFlag,
    },
    {
      value: 'HIGH' as const,
      label: 'High Priority',
      description: 'Urgent testing required',
      color: 'text-orange-600 bg-orange-100',
      icon: FiAlertTriangle,
    },
    {
      value: 'STAT' as const,
      label: 'STAT Priority',
      description: 'Immediate attention needed',
      color: 'text-red-600 bg-red-100',
      icon: FiAlertTriangle,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Priority & Urgency
      </h2>

      <div className="space-y-4">
        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Test Priority
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onOrderDataChange({ priority: option.value })}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    orderData.priority === option.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-2 ${option.color.split(' ')[0]}`} />
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Critical Flag */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Critical Results
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Mark as critical for immediate notification
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={orderData.isCritical}
              onChange={(e) => onOrderDataChange({ isCritical: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* Priority Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Priority Guidelines:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>LOW:</strong> Routine checkups, annual exams</li>
            <li>• <strong>NORMAL:</strong> Most diagnostic testing</li>
            <li>• <strong>HIGH:</strong> Emergency department, inpatient</li>
            <li>• <strong>STAT:</strong> Life-threatening conditions</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default PrioritySettings;