import { FiArrowLeft } from 'react-icons/fi';
import { LabTestRequest } from '@/types/lab';

interface PageHeaderProps {
  orderId: string;
  order: LabTestRequest;
  onBack: () => void;
}

export default function PageHeader({
  order,
  onBack,
  orderId,
}: PageHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='mb-8'>
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200'
      >
        <FiArrowLeft className='w-5 h-5' />
        Back to Order Details
      </button>

      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Edit Lab Order</h1>
        <p className='text-gray-600 mt-2'>
          For {order.patient.name} • {order.test.name}
        </p>
        <p className='text-sm text-gray-500 mt-1'>
          Requested on {formatDate(order.requestedDate)}
        </p>
        <p className='text-xs text-gray-400 mt-1'>Order ID: {orderId}</p>
      </div>
    </div>
  );
}
