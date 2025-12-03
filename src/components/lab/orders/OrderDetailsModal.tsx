import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTag,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';
import { OrderDetailsModalProps, LabTestRequest } from '@/types/lab';

interface LabTechnician {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  employeeId: string;
  currentWorkload: number;
  maxConcurrentTests: number;
  specialization?: string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdate,
  onAssignTechnician,
}) => {
  const [availableTechnicians, setAvailableTechnicians] = useState<
    LabTechnician[]
  >([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.test._id]);

  const fetchAvailableTechnicians = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/lab-technicians/available/${order.test._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableTechnicians(data.technicians || []);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    const colors = {
      REQUESTED: 'bg-blue-100 text-blue-800 border-blue-200',
      SAMPLE_COLLECTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      colors[status as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      STAT: 'bg-red-100 text-red-800',
    };
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const handleAssignTechnician = () => {
    if (selectedTechnician) {
      onAssignTechnician(order._id, selectedTechnician);
      setSelectedTechnician('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'
        onClick={e => e.stopPropagation()}
      >
        <div className='p-6'>
          {/* Header */}
          <div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-200'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Order Details
              </h2>
              <div className='flex items-center gap-4 mt-2'>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}
                >
                  {order.status.replace('_', ' ')}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}
                >
                  {order.priority}
                </span>
                {order.isCritical && (
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'>
                    <FiAlertTriangle className='w-4 h-4 mr-1' />
                    Critical
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg'
            >
              <FiX className='w-6 h-6' />
            </button>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left Column */}
            <div className='space-y-6'>
              {/* Patient Information */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                  <FiUser className='w-5 h-5 mr-2 text-blue-600' />
                  Patient Information
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Name:</span>
                    <span className='text-gray-600'>{order.patient.name}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Email:</span>
                    <span className='text-gray-600 flex items-center'>
                      <FiMail className='w-4 h-4 mr-1' />
                      {order.patient.email}
                    </span>
                  </div>
                  {order.patient.phone && (
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>Phone:</span>
                      <span className='text-gray-600 flex items-center'>
                        <FiPhone className='w-4 h-4 mr-1' />
                        {order.patient.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Information */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                  <FiTag className='w-5 h-5 mr-2 text-green-600' />
                  Test Information
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Test Name:</span>
                    <span className='text-gray-600'>{order.test.name}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Category:</span>
                    <span className='text-gray-600'>{order.test.category}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Duration:</span>
                    <span className='text-gray-600 flex items-center'>
                      <FiClock className='w-4 h-4 mr-1' />
                      {order.test.duration} minutes
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Price:</span>
                    <span className='text-gray-600 flex items-center'>
                      <FiDollarSign className='w-4 h-4 mr-1' />$
                      {order.test.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* Timeline Information */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                  <FiCalendar className='w-5 h-5 mr-2 text-purple-600' />
                  Timeline
                </h3>
                <div className='space-y-3 text-sm'>
                  {[
                    { label: 'Requested', date: order.requestedDate },
                    {
                      label: 'Sample Collected',
                      date: order.sampleCollectedDate,
                    },
                    { label: 'Started', date: order.startedDate },
                    { label: 'Completed', date: order.completedDate },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <span className='font-medium'>{item.label}:</span>
                      <span className='text-gray-600'>
                        {formatDate(item.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Information */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Assignment
                </h3>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Doctor:</span>
                    <span className='text-gray-600'>{order.doctor.name}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Technician:</span>
                    <span className='text-gray-600'>
                      {order.labTechnician ? (
                        <span className='flex items-center'>
                          <FiUser className='w-4 h-4 mr-1' />
                          {order.labTechnician.name}
                          <span className='text-xs text-gray-500 ml-2'>
                            ({order.labTechnician.employeeId})
                          </span>
                        </span>
                      ) : (
                        <span className='text-orange-600'>Unassigned</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className='mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <FiCheckCircle className='w-5 h-5 mr-2 text-blue-600' />
              Update Status
            </h3>
            <div className='flex flex-wrap gap-2'>
              {[
                'REQUESTED',
                'SAMPLE_COLLECTED',
                'IN_PROGRESS',
                'COMPLETED',
                'VERIFIED',
              ].map(status => (
                <button
                  key={status}
                  onClick={() =>
                    onStatusUpdate(
                      order._id,
                      status as LabTestRequest['status']
                    )
                  }
                  disabled={order.status === status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    order.status === status
                      ? 'bg-blue-600 text-white cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Technician Assignment */}
          <div className='mt-6 p-6 bg-orange-50 rounded-lg border border-orange-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Assign Technician
            </h3>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <select
                  value={selectedTechnician}
                  onChange={e => setSelectedTechnician(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  disabled={loading || availableTechnicians.length === 0}
                >
                  <option value=''>Select a technician</option>
                  {availableTechnicians.map(tech => (
                    <option key={tech._id} value={tech._id}>
                      {tech.user.name} ({tech.employeeId}) -{' '}
                      {tech.currentWorkload}/{tech.maxConcurrentTests} workload
                      {tech.specialization && ` - ${tech.specialization}`}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className='text-sm text-gray-500 mt-1'>
                    Loading technicians...
                  </p>
                )}
                {!loading && availableTechnicians.length === 0 && (
                  <p className='text-sm text-orange-600 mt-1'>
                    No available technicians for this test type
                  </p>
                )}
              </div>
              <button
                onClick={handleAssignTechnician}
                disabled={!selectedTechnician || loading}
                className='px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap'
              >
                Assign Technician
              </button>
            </div>
          </div>

          {/* Results and Notes */}
          {(order.results || order.findings || order.notes) && (
            <div className='mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Additional Information
              </h3>
              <div className='space-y-4'>
                {order.results && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Results
                    </h4>
                    <div className='bg-white p-4 rounded border'>
                      <p className='text-gray-600 whitespace-pre-wrap'>
                        {order.results}
                      </p>
                    </div>
                  </div>
                )}
                {order.findings && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Findings
                    </h4>
                    <div className='bg-white p-4 rounded border'>
                      <p className='text-gray-600 whitespace-pre-wrap'>
                        {order.findings}
                      </p>
                    </div>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>Notes</h4>
                    <div className='bg-white p-4 rounded border'>
                      <p className='text-gray-600 whitespace-pre-wrap'>
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailsModal;
