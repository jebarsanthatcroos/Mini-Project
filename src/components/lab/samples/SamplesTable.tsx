import { motion } from 'framer-motion';
import {
  FiEye,
  FiEdit,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { LabSample } from '@/types/lab';

interface SamplesTableProps {
  samples: LabSample[];
  onViewSample: (sampleId: string) => void;
  onEditSample: (sampleId: string) => void;
}

export default function SamplesTable({
  samples,
  onViewSample,
  onEditSample,
}: SamplesTableProps) {
  const getStatusColor = (status: string) => {
    const statusColors = {
      COLLECTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      'bg-gray-100 text-gray-800 border-gray-200'
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

  const getStatusIcon = (status: string) => {
    const statusIcons = {
      COLLECTED: FiClock,
      IN_PROGRESS: FiClock,
      COMPLETED: FiCheckCircle,
      CANCELLED: FiAlertTriangle,
    };
    return statusIcons[status as keyof typeof statusIcons] || FiClock;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeDifference = (dateString: string) => {
    const collectedDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - collectedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'
    >
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Sample Info
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Patient
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Test Details
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Priority
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Collection
              </th>
              <th className='px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {samples.map((sample, index) => {
              const StatusIcon = getStatusIcon(sample.status);

              return (
                <motion.tr
                  key={sample.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='hover:bg-gray-50 transition-colors duration-150 group'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='shrink-0'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            sample.isCritical
                              ? 'bg-red-500'
                              : sample.status === 'COMPLETED'
                                ? 'bg-green-500'
                                : sample.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                          }`}
                        />
                      </div>
                      <div className='ml-3'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-gray-900'>
                            {sample.sampleId}
                          </span>
                          {sample.isCritical && (
                            <FiAlertTriangle
                              className='w-4 h-4 text-red-500'
                              title='Critical Sample'
                            />
                          )}
                        </div>
                        <div className='text-sm text-gray-500 capitalize'>
                          {sample.sampleType.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {sample.patientName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        ID: {sample.patientId}
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {sample.testName}
                    </div>
                    {sample.volume && (
                      <div className='text-sm text-gray-500'>
                        Vol: {sample.volume}
                      </div>
                    )}
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <StatusIcon className='w-4 h-4' />
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sample.status)}`}
                      >
                        {sample.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(sample.priority)}`}
                    >
                      {sample.priority}
                    </span>
                  </td>

                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {formatDate(sample.collectedDate)}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {getTimeDifference(sample.collectedDate)}
                    </div>
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                      <button
                        onClick={() => onViewSample(sample.id)}
                        className='text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50'
                        title='View Sample Details'
                      >
                        <FiEye className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => onEditSample(sample.id)}
                        className='text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50'
                        title='Edit Sample'
                      >
                        <FiEdit className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
