import { motion } from 'framer-motion';
import { FiSave, FiCalendar, FiClock } from 'react-icons/fi';
import { LabOrderFormData } from '@/types/lab';

interface EditOrderFormProps {
  formData: LabOrderFormData;
  formErrors: Record<string, string>;
  updating: boolean;
  onChange: (
    // eslint-disable-next-line no-undef
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  // eslint-disable-next-line no-undef
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditOrderForm({
  formData,
  formErrors,
  updating,
  onChange,
  onSubmit,
  onCancel,
}: EditOrderFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-6'>
        Order Information
      </h2>

      <form onSubmit={onSubmit} className='space-y-6'>
        {/* Status and Priority */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Status *
            </label>
            <select
              name='status'
              value={formData.status}
              onChange={onChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='REQUESTED'>Requested</option>
              <option value='SAMPLE_COLLECTED'>Sample Collected</option>
              <option value='IN_PROGRESS'>In Progress</option>
              <option value='COMPLETED'>Completed</option>
              <option value='VERIFIED'>Verified</option>
              <option value='CANCELLED'>Cancelled</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Priority *
            </label>
            <select
              name='priority'
              value={formData.priority}
              onChange={onChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='LOW'>Low</option>
              <option value='NORMAL'>Normal</option>
              <option value='HIGH'>High</option>
              <option value='STAT'>STAT</option>
            </select>
          </div>
        </div>

        {/* Critical Flag */}
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='isCritical'
            name='isCritical'
            checked={formData.isCritical}
            onChange={onChange}
            className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
          />
          <label
            htmlFor='isCritical'
            className='ml-2 text-sm font-medium text-gray-700'
          >
            Mark as Critical Result
          </label>
        </div>

        {/* Timeline Dates */}
        <TimelineSection
          formData={formData}
          formErrors={formErrors}
          onChange={onChange}
        />

        {/* Results and Findings */}
        <ResultsSection formData={formData} onChange={onChange} />

        {/* Notes */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Additional Notes
          </label>
          <textarea
            name='notes'
            value={formData.notes}
            onChange={onChange}
            rows={3}
            placeholder='Any additional notes or comments...'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
          />
        </div>

        {/* Form Actions */}
        <FormActions updating={updating} onCancel={onCancel} />
      </form>
    </motion.div>
  );
}

// Sub-components for the form sections
function TimelineSection({
  formData,
  formErrors,
  onChange,
}: {
  formData: LabOrderFormData;
  formErrors: Record<string, string>;
  onChange: (
    // eslint-disable-next-line no-undef
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
        <FiCalendar className='w-5 h-5 text-blue-600' />
        Timeline
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Sample Collected
          </label>
          <input
            type='date'
            name='sampleCollectedDate'
            value={formData.sampleCollectedDate}
            onChange={onChange}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Started Date
          </label>
          <input
            type='date'
            name='startedDate'
            value={formData.startedDate}
            onChange={onChange}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
          {formErrors.startedDate && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.startedDate}
            </p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Completed Date
          </label>
          <input
            type='date'
            name='completedDate'
            value={formData.completedDate}
            onChange={onChange}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
          {formErrors.completedDate && (
            <p className='mt-1 text-sm text-red-600'>
              {formErrors.completedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsSection({
  formData,
  onChange,
}: {
  formData: LabOrderFormData;
  onChange: (
    // eslint-disable-next-line no-undef
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
        <FiClock className='w-5 h-5 text-green-600' />
        Test Results
      </h3>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Results
        </label>
        <textarea
          name='results'
          value={formData.results}
          onChange={onChange}
          rows={4}
          placeholder='Enter test results...'
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Findings
        </label>
        <textarea
          name='findings'
          value={formData.findings}
          onChange={onChange}
          rows={4}
          placeholder='Enter clinical findings...'
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
        />
      </div>
    </div>
  );
}

function FormActions({
  updating,
  onCancel,
}: {
  updating: boolean;
  onCancel: () => void;
}) {
  return (
    <div className='flex justify-end gap-3 pt-6 border-t border-gray-200'>
      <button
        type='button'
        onClick={onCancel}
        disabled={updating}
        className='px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
      >
        Cancel
      </button>
      <button
        type='submit'
        disabled={updating}
        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2'
      >
        {updating ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            Updating...
          </>
        ) : (
          <>
            <FiSave className='w-4 h-4' />
            Update Order
          </>
        )}
      </button>
    </div>
  );
}
