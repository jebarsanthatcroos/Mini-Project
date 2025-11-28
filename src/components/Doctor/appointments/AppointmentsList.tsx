import React from 'react';
import { motion } from 'framer-motion';
import { Appointment } from '@/types/appointment';
import AppointmentCard from './AppointmentCard';

interface AppointmentsListProps {
  appointments: Appointment[];
  onViewAppointment: (id: string) => void;
  onEditAppointment: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
}

export default function AppointmentsList({
  appointments,
  onViewAppointment,
  onEditAppointment,
  onDeleteAppointment,
}: AppointmentsListProps) {
  return (
    <div className='space-y-4'>
      {appointments.map((appointment, index) => (
        <motion.div
          key={appointment._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AppointmentCard
            appointment={appointment}
            onView={() => onViewAppointment(appointment._id)}
            onEdit={() => onEditAppointment(appointment._id)}
            onDelete={() => onDeleteAppointment(appointment._id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
