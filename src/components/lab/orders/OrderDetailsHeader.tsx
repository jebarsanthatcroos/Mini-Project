import { FiArrowLeft } from 'react-icons/fi';
import { LabTestRequest } from '@/types/lab';

interface OrderDetailsHeaderProps {
  order: LabTestRequest;
  onBack: () => void;
}

export default function OrderDetailsHeader({
  order,
  onBack,
}: OrderDetailsHeaderProps) {
  const getStatusColor = (status: string) => {
    const statusColors = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      SAMPLE_COLLECTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      VERIFIED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      'bg-gray-100 text-gray-800'
    );
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      STAT: 'bg-red-100 text-red-800',
    };
    return (
      priorityColors[priority as keyof typeof priorityColors] ||
      'bg-gray-100 text-gray-800'
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='mb-8'>
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200'
      >
        <FiArrowLeft className='w-5 h-5' />
        Back to Orders
      </button>

      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Lab Order Details
          </h1>
          <p className='text-gray-600 mt-2'>
            {order.test.name} for {order.patient.name}
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            Requested on {formatDate(order.requestedDate)}
          </p>
        </div>

        <div className='flex flex-wrap gap-2 mt-4 lg:mt-0'>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
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
              Critical
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
