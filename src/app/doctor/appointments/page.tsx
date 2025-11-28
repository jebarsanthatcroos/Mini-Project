'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Components
import AppointmentsHeader from '@/components/Doctor/appointments/AppointmentsHeader';
import StatsGrid from '@/components/Doctor/appointments/StatsGrid';
import SearchFilters from '@/components/Doctor/appointments/SearchFilters';
import AppointmentsList from '@/components/Doctor/appointments/AppointmentsList';
import LoadingSpinner from '@/components/Loading';
import EmptyState from '@/components/Doctor/appointments/EmptyStat';

// Types
import { Appointment, AppointmentStats } from '@/types/appointment';

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

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <AppointmentsHeader
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onNewAppointment={() => router.push('/doctor/appointments/new')}
        />

        {/* Stats Grid */}
        {stats && <StatsGrid stats={stats} />}

        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterType={filterType}
          onTypeChange={setFilterType}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Appointments List */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Appointments ({filteredAppointments.length})
            </h2>
          </div>

          <div className='p-6'>
            {loading ? (
              <LoadingSpinner />
            ) : filteredAppointments.length === 0 ? (
              <EmptyState
                hasFilters={
                  !!searchTerm ||
                  filterStatus !== 'all' ||
                  filterType !== 'all' ||
                  !!selectedDate
                }
                onNewAppointment={() => router.push('/doctor/appointments/new')}
              />
            ) : (
              <AppointmentsList
                appointments={filteredAppointments}
                onViewAppointment={id =>
                  router.push(`/doctor/appointments/${id}`)
                }
                onEditAppointment={id =>
                  router.push(`/doctor/appointments/${id}/edit`)
                }
                onDeleteAppointment={handleDeleteAppointment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
