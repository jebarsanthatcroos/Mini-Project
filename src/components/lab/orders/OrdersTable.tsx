import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiEye, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import { OrdersTableProps } from '@/types/lab';

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewDetails,
  onStatusUpdate,
  onEditOrder,
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      REQUESTED: 'bg-blue-100 text-blue-800',
      SAMPLE_COLLECTED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      VERIFIED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (orderId: string) => {
    if (onEditOrder) {
      onEditOrder(orderId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'
    >
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Patient & Test
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Doctor
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Priority
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Requested Date
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Technician
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {orders.map((order, index) => (
              <motion.tr
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className='hover:bg-gray-50 transition-colors'
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div>
                    <div className='flex items-center'>
                      <FiUser className='text-gray-400 mr-2' />
                      <span className='font-medium text-gray-900'>
                        {order.patient.name}
                      </span>
                    </div>
                    <div className='text-sm text-gray-500 mt-1'>
                      {order.test.name}
                    </div>
                    <div className='text-xs text-gray-400'>
                      {order.test.category}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {order.doctor.name}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {order.doctor.email}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                  {order.isOverdue && (
                    <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                      Overdue
                    </span>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}
                  >
                    {order.priority}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {formatDate(order.requestedDate)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {order.labTechnician ? (
                    <div>
                      <div className='text-sm text-gray-900'>
                        {order.labTechnician.name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {order.labTechnician.employeeId}
                      </div>
                    </div>
                  ) : (
                    <span className='text-sm text-gray-500'>Unassigned</span>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => onViewDetails(order)}
                      className='text-blue-600 hover:text-blue-900 transition-colors'
                      title='View Details'
                    >
                      <FiEye className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleEdit(order._id)}
                      className='text-green-600 hover:text-green-900 transition-colors'
                      title='Edit Order'
                    >
                      <FiEdit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => onStatusUpdate(order._id, 'CANCELLED')}
                      className='text-red-600 hover:text-red-900 transition-colors'
                      title='Cancel Order'
                    >
                      <FiTrash2 className='w-4 h-4' />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className='text-center py-12'>
          <FiUsers className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-4 text-lg font-medium text-gray-900'>
            No orders found
          </h3>
          <p className='mt-2 text-gray-500'>
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersTable;
