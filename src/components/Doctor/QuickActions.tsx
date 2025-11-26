import { 
  FiPlus, 
  FiUser, 
  FiFileText,
  FiMessageSquare,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const actions = [
  {
    name: 'New Appointment',
    icon: FiPlus,
    description: 'Schedule a new patient appointment',
    color: 'blue',
    href: '/doctor/appointments/new'
  },
  {
    name: 'Add Patient',
    icon: FiUser,
    description: 'Register a new patient',
    color: 'green',
    href: '/doctor/patients/new'
  },
  {
    name: 'Write Prescription',
    icon: FiFileText,
    description: 'Create new prescription',
    color: 'purple',
    href: '/doctor/prescriptions/new'
  },
  {
    name: 'Send Message',
    icon: FiMessageSquare,
    description: 'Message patients or staff',
    color: 'orange',
    href: '/doctor/messages/new'
  },
];

export function QuickActions() {
  const router = useRouter();

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
  };

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={() => handleActionClick(action.href)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors border ${colorClasses[action.color as keyof typeof colorClasses]}`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium text-sm">{action.name}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}