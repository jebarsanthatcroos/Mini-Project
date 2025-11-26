import {
  FiUser,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
} from 'react-icons/fi';

const activities = [
  {
    id: 1,
    type: 'appointment',
    description: 'New appointment with Sarah Wilson',
    time: '2 hours ago',
    icon: FiCalendar,
    color: 'blue',
  },
  {
    id: 2,
    type: 'patient',
    description: 'Mike Johnson updated medical history',
    time: '4 hours ago',
    icon: FiUser,
    color: 'green',
  },
  {
    id: 3,
    type: 'prescription',
    description: 'Prescription refill for Emily Davis',
    time: '6 hours ago',
    icon: FiFileText,
    color: 'purple',
  },
  {
    id: 4,
    type: 'message',
    description: 'New message from John Doe',
    time: '1 day ago',
    icon: FiMessageSquare,
    color: 'orange',
  },
];

export function RecentActivity() {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Recent Activity
      </h3>
      <div className='space-y-4'>
        {activities.map(activity => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className='flex items-start space-x-3'>
              <div
                className={`p-2 rounded-lg ${colorClasses[activity.color as keyof typeof colorClasses]}`}
              >
                <Icon className='h-4 w-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-gray-900'>{activity.description}</p>
                <p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
