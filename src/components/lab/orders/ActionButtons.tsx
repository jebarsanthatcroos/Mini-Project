import { FiEdit, FiPrinter, FiDownload } from 'react-icons/fi';

interface ActionButtonsProps {
  onEdit: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

export default function ActionButtons({
  onEdit,
  onPrint,
  onDownload,
}: ActionButtonsProps) {
  return (
    <div className='flex flex-wrap gap-3'>
      <button
        onClick={onEdit}
        className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200'
      >
        <FiEdit className='w-4 h-4' />
        Edit Order
      </button>

      <button
        onClick={onPrint}
        className='flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
      >
        <FiPrinter className='w-4 h-4' />
        Print
      </button>

      <button
        onClick={onDownload}
        className='flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200'
      >
        <FiDownload className='w-4 h-4' />
        Download
      </button>
    </div>
  );
}
