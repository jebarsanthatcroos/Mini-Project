import { motion } from 'framer-motion';
import {
  FiEye,
  FiEdit,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiUser,
} from 'react-icons/fi';
import { LabSample } from '@/types/lab';

interface SamplesTableProps {
  samples: LabSample[];
  onViewSample: (sampleId: string) => void;
  onEditSample: (sampleId: string) => void;
  refreshing?: boolean;
}

export default function SamplesTable({
  samples,
  onViewSample,
  onEditSample,
  refreshing = false,
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

  const getStatusText = (status: string) => {
    const statusText = {
      COLLECTED: 'Awaiting Analysis',
      IN_PROGRESS: 'Analysis in Progress',
      COMPLETED: 'Analysis Complete',
      CANCELLED: 'Cancelled',
    };
    return (
      statusText[status as keyof typeof statusText] || status.replace('_', ' ')
    );
  };

  if (refreshing) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='text-gray-500 mt-2'>Refreshing samples...</p>
      </div>
    );
  }

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
              const isRecent = isRecentSample(sample.collectedDate);

              return (
                <motion.tr
                  key={sample.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 transition-colors duration-150 group ${
                    isRecent ? 'bg-blue-50 hover:bg-blue-100' : ''
                  }`}
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='shrink-0'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            sample.isCritical
                              ? 'bg-red-500 animate-pulse'
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
                          <span className='text-sm font-medium text-gray-900 font-mono'>
                            {sample.sampleId}
                          </span>
                          {sample.isCritical && (
                            <FiAlertTriangle
                              className='w-4 h-4 text-red-500'
                              title='Critical Sample'
                            />
                          )}
                          {isRecent && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              New
                            </span>
                          )}
                        </div>
                        <div className='text-sm text-gray-500 capitalize flex items-center gap-1'>
                          <span>{sample.sampleType.toLowerCase()}</span>
                          {sample.containerType && (
                            <>
                              <span>•</span>
                              <span>{sample.containerType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                        <FiUser className='w-4 h-4 text-gray-600' />
                      </div>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {sample.patientName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {sample.patientId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {sample.testName}
                    </div>
                    <div className='text-sm text-gray-500 flex items-center gap-2 mt-1'>
                      {sample.volume && <span>Vol: {sample.volume}</span>}
                      {sample.storageLocation && (
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                          {sample.storageLocation}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <StatusIcon
                        className={`w-4 h-4 ${
                          sample.status === 'COMPLETED'
                            ? 'text-green-600'
                            : sample.status === 'IN_PROGRESS'
                              ? 'text-blue-600'
                              : sample.status === 'CANCELLED'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                        }`}
                      />
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sample.status)}`}
                        >
                          {getStatusText(sample.status)}
                        </span>
                        {sample.technicianName && (
                          <div className='text-xs text-gray-500 mt-1'>
                            {sample.technicianName}
                          </div>
                        )}
                      </div>
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
                    {sample.collectedBy && (
                      <div className='text-xs text-gray-400 mt-1'>
                        by {sample.collectedBy}
                      </div>
                    )}
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
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

      {/* Table Footer */}
      <div className='bg-gray-50 px-6 py-3 border-t border-gray-200'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500'>
          <div>
            Showing {samples.length} sample{samples.length !== 1 ? 's' : ''}
          </div>
          <div className='flex items-center gap-4 mt-2 sm:mt-0'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span>Completed</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              <span>In Progress</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
              <span>Collected</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Utility function to check if sample is recent (collected in last 2 hours)
function isRecentSample(dateString: string): boolean {
  const sampleDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - sampleDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 2;
}
