import { FiPlus, FiRefreshCw, FiFilter } from 'react-icons/fi';

interface SamplesHeaderProps {
  samplesCount: number;
  onCreateSample: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  totalSamples?: number;
}

export default function SamplesHeader({
  samplesCount,
  onCreateSample,
  onRefresh,
  refreshing = false,
  totalSamples,
}: SamplesHeaderProps) {
  return (
    <div className='mb-8'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-3xl font-bold text-gray-900'>Lab Samples</h1>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                title='Refresh samples'
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
            )}
          </div>

          <p className='text-gray-600'>Manage and track laboratory samples</p>

          <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
            {samplesCount > 0 ? (
              <>
                <span>
                  Showing{' '}
                  <span className='font-semibold text-gray-700'>
                    {samplesCount}
                  </span>{' '}
                  sample{samplesCount !== 1 ? 's' : ''}
                  {totalSamples && totalSamples !== samplesCount && (
                    <span>
                      {' '}
                      of{' '}
                      <span className='font-semibold text-gray-700'>
                        {totalSamples}
                      </span>
                    </span>
                  )}
                </span>

                {totalSamples && totalSamples !== samplesCount && (
                  <span className='flex items-center gap-1'>
                    <FiFilter className='w-3 h-3' />
                    <span>Filtered</span>
                  </span>
                )}
              </>
            ) : (
              <span>No samples to display</span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 mt-4 lg:mt-0'>
          {/* Optional: Add quick filter indicators or other actions */}

          {/* Create Sample Button */}
          <button
            onClick={onCreateSample}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md'
          >
            <FiPlus className='w-5 h-5' />
            New Sample
          </button>
        </div>
      </div>
    </div>
  );
}
