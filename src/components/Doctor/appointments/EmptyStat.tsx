import React from 'react';
import { FiCalendar, FiSearch, FiPlus } from 'react-icons/fi';

interface EmptyStatProps {
  hasFilters: boolean;
  onNewAppointment: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
}

const EmptyStat: React.FC<EmptyStatProps> = ({
  hasFilters,
  onNewAppointment,
  title,
  description,
  icon,
  actionLabel = 'New Appointment',
}) => {
  const getDefaultContent = () => {
    if (hasFilters) {
      return {
        title: 'No appointments found',
        description:
          "Try adjusting your search or filters to find what you're looking for",
        icon: <FiSearch className='h-12 w-12 text-gray-400' />,
        showAction: false,
      };
    } else {
      return {
        title: 'No appointments yet',
        description: 'Get started by scheduling your first appointment',
        icon: <FiCalendar className='h-12 w-12 text-gray-400' />,
        showAction: true,
      };
    }
  };

  const content = getDefaultContent();

  return (
    <div className='text-center py-12'>
      <div className='flex justify-center'>{icon || content.icon}</div>
      <h3 className='mt-4 text-lg font-medium text-gray-900'>
        {title || content.title}
      </h3>
      <p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
        {description || content.description}
      </p>
      {content.showAction && (
        <div className='mt-6'>
          <button
            onClick={onNewAppointment}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            <FiPlus className='w-4 h-4 mr-2' />
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyStat;
