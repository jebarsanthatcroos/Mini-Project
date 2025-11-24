
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiSearch, 
  FiPlus,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
  FiPhone,
  FiMail,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiFilter,
  FiChevronDown
} from 'react-icons/fi';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason: string;
  symptoms?: string;
  notes?: string;
  room?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [pagination.page, statusFilter, dateFilter, typeFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(dateFilter !== 'ALL' && { date: getDateFilterValue(dateFilter) }),
        ...(typeFilter !== 'ALL' && { type: typeFilter })
      });

      const response = await fetch(`/api/doctor/appointments?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.appointments) {
        setAppointments(data.appointments);
        setPagination(data.pagination);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const getDateFilterValue = (filter: string): string => {
    const today = new Date();
    switch (filter) {
      case 'TODAY':
        return today.toISOString().split('T')[0];
      case 'TOMORROW':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      case 'UPCOMING':
        return 'UPCOMING';
      default:
        return filter;
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      setActionLoading(appointmentId);
      const response = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchAppointments();
      } else {
        throw new Error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(appointmentId);
      const response = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAppointments();
      } else {
        throw new Error('Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <FiClock className="w-4 h-4" />;
      case 'CONFIRMED':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <FiXCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FOLLOWUP':
      case 'FOLLOW_UP':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CHECKUP':
      case 'CHECK_UP':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'EMERGENCY':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'EEE, MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatPatientAge = (dateOfBirth: string) => {
    try {
      const birthDate = parseISO(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age}y`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patient.phone.includes(searchTerm)
  );

  const stats = {
    total: pagination.total,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiCalendar className="text-blue-600" />
                Appointments
              </h1>
              <p className="text-gray-600 mt-2">Manage patient appointments and schedules</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchAppointments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={() => router.push('/appointments/new')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiPlus className="w-4 h-4" />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Failed to load appointments</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={fetchAppointments}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients, reasons, or contact info..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                Filters
                <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="ALL">All Status</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="ALL">All Dates</option>
                    <option value="TODAY">Today</option>
                    <option value="TOMORROW">Tomorrow</option>
                    <option value="UPCOMING">Upcoming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="ALL">All Types</option>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="CHECK_UP">Check-up</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiClock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FiXCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {appointment.patient.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(appointment.priority)}`}>
                            {appointment.priority}
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                            {formatPatientAge(appointment.patient.dateOfBirth)}
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200 capitalize">
                            {appointment.patient.gender.toLowerCase()}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(appointment.type)}`}>
                            {appointment.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{appointment.patient.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span>{appointment.patient.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details & Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="text-right sm:text-left">
                      <div className="flex items-center gap-2 mb-1 justify-end sm:justify-start">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 justify-end sm:justify-start">
                        <FiClock className="w-4 h-4" />
                        {formatTime(appointment.time)} • {appointment.duration} min
                        {appointment.room && (
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            Room {appointment.room}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </span>

                      <div className="flex items-center gap-1">
                        {appointment.status === 'SCHEDULED' && (
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
                            disabled={actionLoading === appointment.id}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Confirm Appointment"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                            disabled={actionLoading === appointment.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel Appointment"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Appointment"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          disabled={actionLoading === appointment.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Appointment"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Reason for Visit</h4>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                    {appointment.symptoms && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Symptoms</h4>
                        <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                      </div>
                    )}
                  </div>
                  {appointment.notes && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {format(parseISO(appointment.createdAt), 'MMM dd, yyyy')}</span>
                    <span>Last updated: {format(parseISO(appointment.updatedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'No appointments match your current filters. Try adjusting your search criteria.'
                : 'You don\'t have any appointments scheduled yet. Create your first appointment to get started.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => router.push('/appointments/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiPlus className="w-4 h-4" />
                Create Appointment
              </button>
              {(searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' || typeFilter !== 'ALL') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setDateFilter('ALL');
                    setTypeFilter('ALL');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> appointments
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev || loading}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <FiArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext || loading}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Next
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

