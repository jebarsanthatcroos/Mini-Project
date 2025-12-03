import React from 'react';
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiClock,
} from 'react-icons/fi';
import { Appointment } from '@/types/appointment';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AppointmentCard({
  appointment,
  onView,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UK', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateAge = (dateOfBirth: string | Date) => {
    const today = new Date();
    const birthDate =
      typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className='bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        {/* Patient Info */}
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
              <FiUser className='w-5 h-5 text-blue-600' />
            </div>

            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {appointment.patient.firstName} {appointment.patient.lastName}
              </h3>
              <p className='text-sm text-gray-600'>
                {calculateAge(appointment.patient.dateOfBirth)} years •{' '}
                {appointment.patient.email}
              </p>
            </div>
          </div>

          <p className='text-gray-700'>{appointment.reason}</p>

          {appointment.notes && (
            <p className='text-sm text-gray-600 mt-1'>{appointment.notes}</p>
          )}
        </div>

        {/* Appointment Details */}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <FiCalendar className='w-4 h-4' />
            <span>{formatDate(appointment.appointmentDate)}</span>
          </div>

          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <FiClock className='w-4 h-4' />
            <span>{formatTime(appointment.appointmentTime)}</span>
            <span className='text-gray-400'>•</span>
            <span>{appointment.duration} min</span>
          </div>
        </div>

        {/* Status & Type */}
        <div className='flex flex-col gap-2'>
          <StatusBadge status={appointment.status} />
          <TypeBadge type={appointment.type} />
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          <button
            onClick={onView}
            className='text-blue-600 hover:text-blue-900 p-2 transition-colors rounded-lg hover:bg-blue-50'
            title='View Details'
          >
            <FiEye className='w-4 h-4' />
          </button>

          <button
            onClick={onEdit}
            className='text-green-600 hover:text-green-900 p-2 transition-colors rounded-lg hover:bg-green-50'
            title='Edit Appointment'
          >
            <FiEdit className='w-4 h-4' />
          </button>

          <button
            onClick={onDelete}
            className='text-red-600 hover:text-red-900 p-2 transition-colors rounded-lg hover:bg-red-50'
            title='Delete Appointment'
          >
            <FiTrash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
