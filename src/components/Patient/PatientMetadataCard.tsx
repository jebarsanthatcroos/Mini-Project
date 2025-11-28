import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { Patient, Appointment } from '@/types/patient';
import { formatDate } from '@/utils/patientUtils';

interface PatientMetadataCardProps {
  patient: Patient;
  appointments: Appointment[];
}

const PatientMetadataCard: React.FC<PatientMetadataCardProps> = ({
  patient,
  appointments,
}) => {
  const upcomingAppointments = appointments.filter(
    apt =>
      new Date(apt.appointmentDate) >= new Date() && apt.status === 'SCHEDULED'
  ).length;

  const completedAppointments = appointments.filter(
    apt => apt.status === 'COMPLETED'
  ).length;

  const metadata = [
    {
      label: 'Patient Since',
      value: formatDate(patient.createdAt),
      icon: FiUser,
      color: 'blue',
    },
    {
      label: 'Last Updated',
      value: formatDate(patient.updatedAt),
      icon: FiActivity,
      color: 'green',
    },
    {
      label: 'Patient ID',
      value: patient._id.slice(-8),
      icon: FiUser,
      color: 'purple',
    },
    {
      label: 'Total Appointments',
      value: appointments.length.toString(),
      icon: FiCalendar,
      color: 'orange',
    },
    {
      label: 'Upcoming',
      value: upcomingAppointments.toString(),
      icon: FiClock,
      color: 'blue',
    },
    {
      label: 'Completed',
      value: completedAppointments.toString(),
      icon: FiCalendar,
      color: 'green',
    },
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      case 'orange':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className='bg-white border border-gray-200 rounded-xl p-6'
    >
      <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <FiActivity className='w-5 h-5 text-blue-600' />
        Patient Details
      </h3>

      <div className='space-y-4'>
        {metadata.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(item.color)}`}
                >
                  <Icon className='w-4 h-4' />
                </div>
                <div>
                  <div className='text-sm font-medium text-gray-900'>
                    {item.label}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-sm font-semibold text-gray-900'>
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <h4 className='text-sm font-medium text-gray-900 mb-3'>
          Patient Status
        </h4>
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Active Patient</span>
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
              Active
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Last Visit</span>
            <span className='text-sm text-gray-900'>
              {appointments.length > 0
                ? formatDate(
                    appointments[appointments.length - 1].appointmentDate
                  )
                : 'Never'}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Records Complete</span>
            <span className='text-sm text-gray-900'>
              {patient.medicalHistory && patient.allergies ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientMetadataCard;
