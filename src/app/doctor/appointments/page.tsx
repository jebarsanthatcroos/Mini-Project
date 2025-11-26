'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from 'react-icons/fi';

interface Appointment {
  _id: string;
  id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'other';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  today: number;
  upcoming: number;
  averageDuration: number;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/appointments');

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const result = await response.json();

      if (result.success) {
        setAppointments(result.data?.appointments || []);
      } else {
        throw new Error(result.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/doctor/appointments/stats');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    fetchStats();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/doctor/appointments/${appointmentId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchAppointments();
        fetchStats();
      } else {
        alert('Failed to delete appointment: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.patient.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.patient.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.patient.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || appointment.status === filterStatus;

    const matchesType = filterType === 'all' || appointment.type === filterType;

    const matchesDate =
      !selectedDate || appointment.appointmentDate === selectedDate;

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <FiClock className='w-4 h-4' />;
      case 'confirmed':
        return <FiCheckCircle className='w-4 h-4' />;
      case 'completed':
        return <FiCheckCircle className='w-4 h-4' />;
      case 'cancelled':
        return <FiXCircle className='w-4 h-4' />;
      case 'no-show':
        return <FiAlertCircle className='w-4 h-4' />;
      default:
        return <FiLoader className='w-4 h-4' />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-purple-100 text-purple-800';
      case 'follow-up':
        return 'bg-indigo-100 text-indigo-800';
      case 'check-up':
        return 'bg-cyan-100 text-cyan-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
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
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Appointments</h1>
              <p className='text-gray-600 mt-2'>
                Manage and track patient appointments
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className='flex items-center gap-2 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
              <button
                onClick={() => router.push('/doctor/appointments/new')}
                className='flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FiPlus className='w-5 h-5' />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.total}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Total</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-600'>
                  {stats.scheduled}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Scheduled</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.confirmed}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Confirmed</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-600'>
                  {stats.completed}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Completed</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-red-600'>
                  {stats.cancelled}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Cancelled</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-orange-600'>
                  {stats.noShow}
                </p>
                <p className='text-sm text-gray-600 mt-1'>No Show</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-600'>
                  {stats.today}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Today</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold text-indigo-600'>
                  {stats.upcoming}
                </p>
                <p className='text-sm text-gray-600 mt-1'>Upcoming</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Search and Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search patients, reason, or email...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-2'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='scheduled'>Scheduled</option>
                <option value='confirmed'>Confirmed</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
                <option value='no-show'>No Show</option>
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Types</option>
                <option value='consultation'>Consultation</option>
                <option value='follow-up'>Follow-up</option>
                <option value='check-up'>Check-up</option>
                <option value='emergency'>Emergency</option>
                <option value='other'>Other</option>
              </select>

              <input
                type='date'
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />

              <button className='flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                <FiFilter className='w-5 h-5' />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Appointments ({filteredAppointments.length})
            </h2>
          </div>

          <div className='p-6'>
            {loading ? (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className='text-center py-12'>
                <FiCalendar className='mx-auto h-12 w-12 text-gray-400' />
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No appointments found
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {searchTerm ||
                  filterStatus !== 'all' ||
                  filterType !== 'all' ||
                  selectedDate
                    ? 'Try adjusting your search or filters'
                    : 'Get started by scheduling your first appointment'}
                </p>
                <div className='mt-6'>
                  <button
                    onClick={() => router.push('/doctor/appointments/new')}
                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                  >
                    <FiPlus className='w-4 h-4 mr-2' />
                    New Appointment
                  </button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredAppointments.map(appointment => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors'
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                      {/* Patient Info */}
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                            <FiUser className='w-5 h-5 text-blue-600' />
                          </div>
                          <div>
                            <h3 className='text-lg font-semibold text-gray-900'>
                              {appointment.patient.firstName}{' '}
                              {appointment.patient.lastName}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {calculateAge(appointment.patient.dateOfBirth)}{' '}
                              years • {appointment.patient.email}
                            </p>
                          </div>
                        </div>
                        <p className='text-gray-700'>{appointment.reason}</p>
                        {appointment.notes && (
                          <p className='text-sm text-gray-600 mt-1'>
                            {appointment.notes}
                          </p>
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

                      {/* Status and Type */}
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(appointment.status)}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}
                        >
                          {appointment.type
                            .replace('-', ' ')
                            .charAt(0)
                            .toUpperCase() +
                            appointment.type.replace('-', ' ').slice(1)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor/appointments/${appointment._id}`
                            )
                          }
                          className='text-blue-600 hover:text-blue-900 p-2 transition-colors rounded-lg hover:bg-blue-50'
                          title='View Details'
                        >
                          <FiEye className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor/appointments/${appointment._id}/edit`
                            )
                          }
                          className='text-green-600 hover:text-green-900 p-2 transition-colors rounded-lg hover:bg-green-50'
                          title='Edit Appointment'
                        >
                          <FiEdit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAppointment(appointment._id)
                          }
                          className='text-red-600 hover:text-red-900 p-2 transition-colors rounded-lg hover:bg-red-50'
                          title='Delete Appointment'
                        >
                          <FiTrash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
