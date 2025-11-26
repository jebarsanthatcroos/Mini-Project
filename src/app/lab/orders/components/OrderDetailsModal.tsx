import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiX } from 'react-icons/fi';
import { OrderDetailsModalProps, LabTestRequest } from '../types';

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdate,
  onAssignTechnician,
}) => {
  const [availableTechnicians, setAvailableTechnicians] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  useEffect(() => {
    fetchAvailableTechnicians();
  }, []);

  const fetchAvailableTechnicians = async () => {
    try {
      const response = await fetch(`/api/lab-technicians/available/${order.test._id}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTechnicians(data.technicians || []);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FiUser className="text-gray-400 mr-3" />
                  <span className="font-medium">{order.patient.name}</span>
                </div>
                <div className="flex items-center">
                  <FiMail className="text-gray-400 mr-3" />
                  <span className="text-gray-600">{order.patient.email}</span>
                </div>
                {order.patient.phone && (
                  <div className="flex items-center">
                    <FiPhone className="text-gray-400 mr-3" />
                    <span className="text-gray-600">{order.patient.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Test Name:</span>
                  <span className="ml-2 text-gray-600">{order.test.name}</span>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2 text-gray-600">{order.test.category}</span>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2 text-gray-600">{order.test.duration} minutes</span>
                </div>
                <div>
                  <span className="font-medium">Price:</span>
                  <span className="ml-2 text-gray-600">${order.test.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Requested:</span>
                  <span className="ml-2 text-gray-600">{formatDate(order.requestedDate)}</span>
                </div>
                <div>
                  <span className="font-medium">Sample Collected:</span>
                  <span className="ml-2 text-gray-600">{formatDate(order.sampleCollectedDate)}</span>
                </div>
                <div>
                  <span className="font-medium">Started:</span>
                  <span className="ml-2 text-gray-600">{formatDate(order.startedDate)}</span>
                </div>
                <div>
                  <span className="font-medium">Completed:</span>
                  <span className="ml-2 text-gray-600">{formatDate(order.completedDate)}</span>
                </div>
              </div>
            </div>

            {/* Current Assignment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Doctor:</span>
                  <span className="ml-2 text-gray-600">{order.doctor.name}</span>
                </div>
                <div>
                  <span className="font-medium">Technician:</span>
                  <span className="ml-2 text-gray-600">
                    {order.labTechnician ? order.labTechnician.name : 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <span className="ml-2 text-gray-600 capitalize">{order.priority.toLowerCase()}</span>
                </div>
                <div>
                  <span className="font-medium">Critical:</span>
                  <span className="ml-2 text-gray-600">
                    {order.isCritical ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'].map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusUpdate(order._id, status as LabTestRequest['status'])}
                  disabled={order.status === status}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    order.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Technician Assignment */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Technician</h3>
            <div className="flex space-x-4">
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a technician</option>
                {availableTechnicians.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.user.name} ({tech.employeeId}) - Workload: {tech.currentWorkload}/{tech.maxConcurrentTests}
                  </option>
                ))}
              </select>
              <button
                onClick={() => selectedTechnician && onAssignTechnician(order._id, selectedTechnician)}
                disabled={!selectedTechnician}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Results and Notes */}
          {(order.results || order.findings || order.notes) && (
            <div className="mt-6 space-y-4">
              {order.results && (
                <div>
                  <h4 className="font-semibold text-gray-900">Results</h4>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{order.results}</p>
                </div>
              )}
              {order.findings && (
                <div>
                  <h4 className="font-semibold text-gray-900">Findings</h4>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{order.findings}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900">Notes</h4>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailsModal;