import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiPlus, FiClock } from 'react-icons/fi';
import { Appointment, Patient } from '@/types/patient';
import {
  formatDate,
  formatTime,
  getAppointmentStatusColor,
  getAppointmentStatusText,
} from '@/utils/patientUtils';

interface AppointmentsTabProps {
  appointments: Appointment[];
  patient: Patient;
  onNewAppointment: () => void;
  onViewAppointment: (id: string) => void;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  patient,
  onNewAppointment,
  onViewAppointment,
}) => {
  // You can now use the patient prop in the component
  // For example, display patient name in the header:
  // <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
  //   <FiCalendar className='w-5 h-5 text-blue-600' />
  //   Appointment History - {patient.firstName} {patient.lastName}
  // </h2>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
          <FiCalendar className='w-5 h-5 text-blue-600' />
          Appointment History
          {/* Optional: Display patient name */}
          {/* <span className='text-sm text-gray-500 ml-2'>
            for {patient.firstName} {patient.lastName}
          </span> */}
        </h2>
        <button
          onClick={onNewAppointment}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          <FiPlus className='w-4 h-4' />
          New Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className='text-center py-8'>
          <FiCalendar className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No appointments found
          </h3>
          <p className='text-gray-500 mb-4'>
            {patient.firstName} {patient.lastName} doesn&apos;t have any
            appointments scheduled yet.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}
                    >
                      {getAppointmentStatusText(appointment.status)}
                    </span>
                    <span className='text-sm text-gray-500 capitalize'>
                      {appointment.type.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className='font-medium text-gray-900 mb-1'>
                    {appointment.reason}
                  </h4>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <FiCalendar className='w-4 h-4' />
                      {formatDate(appointment.appointmentDate)}
                    </div>
                    <div className='flex items-center gap-1'>
                      <FiClock className='w-4 h-4' />
                      {formatTime(appointment.appointmentTime)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onViewAppointment(appointment._id)}
                  className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentsTab;
