import React from 'react';
import { FiUser, FiCalendar, FiHeart } from 'react-icons/fi';

interface PatientTabsProps {
  activeTab: 'overview' | 'appointments' | 'medical';
  onTabChange: (tab: 'overview' | 'appointments' | 'medical') => void;
}

const PatientTabs: React.FC<PatientTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: FiUser },
    { id: 'appointments', name: 'Appointments', icon: FiCalendar },
    { id: 'medical', name: 'Medical', icon: FiHeart },
  ];

  return (
    <div className='mb-6 border-b border-gray-200'>
      <nav className='-mb-px flex space-x-8'>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => onTabChange(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className='w-4 h-4' />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default PatientTabs;
