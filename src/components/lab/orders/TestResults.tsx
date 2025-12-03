import { motion } from 'framer-motion';
import { FiFileText, FiAlertTriangle } from 'react-icons/fi';
import { LabTestRequest } from '@/types/lab';

interface TestResultsProps {
  order: LabTestRequest;
}

export default function TestResults({ order }: TestResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <FiFileText className='w-5 h-5 text-green-600' />
        Test Results & Findings
      </h2>

      <div className='space-y-6'>
        {order.isCritical && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertTriangle className='w-5 h-5' />
              <span className='font-semibold'>Critical Result</span>
            </div>
            <p className='text-red-700 text-sm mt-1'>
              This result has been marked as critical and requires immediate
              attention.
            </p>
          </div>
        )}

        {/* Results */}
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-3'>Results</h3>
          {order.results ? (
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-gray-700 whitespace-pre-wrap'>
                {order.results}
              </p>
            </div>
          ) : (
            <p className='text-gray-500 italic'>No results available yet.</p>
          )}
        </div>

        {/* Findings */}
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-3'>
            Clinical Findings
          </h3>
          {order.findings ? (
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-gray-700 whitespace-pre-wrap'>
                {order.findings}
              </p>
            </div>
          ) : (
            <p className='text-gray-500 italic'>No findings recorded yet.</p>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>
              Additional Notes
            </h3>
            <div className='bg-blue-50 rounded-lg p-4'>
              <p className='text-gray-700 whitespace-pre-wrap'>{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
