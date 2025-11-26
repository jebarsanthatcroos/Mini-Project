import { FiClock, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';

const appointments = [
  {
    id: 1,
    patientName: 'John Doe',
    time: '09:00 AM',
    type: 'Consultation',
    status: 'confirmed',
    phone: '+1 (555) 123-4567',
    location: 'Room 201',
  },
  {
    id: 2,
    patientName: 'Sarah Wilson',
    time: '10:30 AM',
    type: 'Follow-up',
    status: 'confirmed',
    phone: '+1 (555) 234-5678',
    location: 'Room 203',
  },
  {
    id: 3,
    patientName: 'Mike Johnson',
    time: '02:15 PM',
    type: 'Check-up',
    status: 'pending',
    phone: '+1 (555) 345-6789',
    location: 'Room 205',
  },
  {
    id: 4,
    patientName: 'Emily Davis',
    time: '04:00 PM',
    type: 'Consultation',
    status: 'confirmed',
    phone: '+1 (555) 456-7890',
    location: 'Room 201',
  },
];

export function UpcomingAppointments() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm'>
      <div className='p-6 border-b border-gray-200'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Upcoming Appointments
        </h2>
        <p className='text-sm text-gray-600 mt-1'>Today&apos;s schedule</p>
      </div>

      <div className='divide-y divide-gray-200'>
        {appointments.map(appointment => (
          <div
            key={appointment.id}
            className='p-6 hover:bg-gray-50 transition-colors'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='shrink-0'>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <FiUser className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>
                    {appointment.patientName}
                  </h3>
                  <div className='flex items-center mt-1 space-x-4 text-sm text-gray-600'>
                    <div className='flex items-center'>
                      <FiClock className='h-4 w-4 mr-1' />
                      {appointment.time}
                    </div>
                    <div className='flex items-center'>
                      <FiMapPin className='h-4 w-4 mr-1' />
                      {appointment.location}
                    </div>
                    <div className='flex items-center'>
                      <FiPhone className='h-4 w-4 mr-1' />
                      {appointment.phone}
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                >
                  {appointment.status}
                </span>
                <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                  {appointment.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='p-4 border-t border-gray-200'>
        <button className='w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2'>
          View All Appointments
        </button>
      </div>
    </div>
  );
}
