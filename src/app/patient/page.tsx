/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import PatientSidebar from '@/components/Patient/PatientSidebar';
import {
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiMessageSquare,
  FiArrowUp,
  FiArrowDown,
  FiMenu,
} from 'react-icons/fi';

interface DashboardStats {
  upcomingAppointments: number;
  pendingPayments: number;
  unreadMessages: number;
  medicalRecords: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'payment' | 'message' | 'record';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled' | 'upcoming';
}

interface HealthMetric {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  unit: string;
}

const PatientDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    pendingPayments: 0,
    unreadMessages: 0,
    medicalRecords: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    const fetchDashboardData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        upcomingAppointments: 2,
        pendingPayments: 1,
        unreadMessages: 3,
        medicalRecords: 12,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'appointment',
          title: 'Annual Checkup',
          description: 'With Dr. Smith',
          date: '2024-01-15T10:00:00',
          status: 'upcoming',
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Processed',
          description: 'Card ending in 4242',
          date: '2024-01-10T14:30:00',
          status: 'completed',
        },
        {
          id: '3',
          type: 'message',
          title: 'New Message',
          description: 'From Nurse Johnson',
          date: '2024-01-10T09:15:00',
          status: 'pending',
        },
        {
          id: '4',
          type: 'record',
          title: 'Lab Results',
          description: 'Blood test available',
          date: '2024-01-08T16:45:00',
          status: 'completed',
        },
      ]);

      setHealthMetrics([
        {
          name: 'Blood Pressure',
          value: '120/80',
          change: -2,
          trend: 'down',
          unit: 'mmHg',
        },
        {
          name: 'Heart Rate',
          value: '72',
          change: 1,
          trend: 'up',
          unit: 'bpm',
        },
        {
          name: 'Weight',
          value: '68.5',
          change: -0.5,
          trend: 'down',
          unit: 'kg',
        },
        {
          name: 'Blood Sugar',
          value: '95',
          change: -5,
          trend: 'down',
          unit: 'mg/dL',
        },
      ]);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    color: string;
    href: string;
  }> = ({ icon, title, value, color, href }) => (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const ActivityIcon: React.FC<{ type: string; status: string }> = ({
    type,
    status,
  }) => {
    const baseClasses = 'p-2 rounded-lg';

    switch (type) {
      case 'appointment':
        return (
          <div
            className={`${baseClasses} ${
              status === 'upcoming'
                ? 'bg-blue-100 text-blue-600'
                : status === 'completed'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
            }`}
          >
            <FiCalendar className='text-lg' />
          </div>
        );
      case 'payment':
        return (
          <div
            className={`${baseClasses} ${
              status === 'completed'
                ? 'bg-green-100 text-green-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            <FiDollarSign className='text-lg' />
          </div>
        );
      case 'message':
        return (
          <div className={`${baseClasses} bg-purple-100 text-purple-600`}>
            <FiMessageSquare className='text-lg' />
          </div>
        );
      case 'record':
        return (
          <div className={`${baseClasses} bg-indigo-100 text-indigo-600`}>
            <FiFileText className='text-lg' />
          </div>
        );
      default:
        return null;
    }
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      upcoming: { color: 'bg-blue-100 text-blue-800', label: 'Upcoming' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <div className='flex-1 lg:ml-0'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <FiMenu className='text-gray-600 text-xl' />
              </button>
              <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='relative p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                <FiMessageSquare className='text-gray-600 text-xl' />
                {stats.unreadMessages > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className='p-6'>
          {/* Welcome Banner */}
          <div className='bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8'>
            <h2 className='text-2xl font-bold mb-2'>Good morning, John!</h2>
            <p className='text-blue-100'>
              Here&apos;s your health overview for today
            </p>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <StatCard
              icon={<FiCalendar className='text-white text-xl' />}
              title='Upcoming Appointments'
              value={stats.upcomingAppointments}
              color='bg-blue-500'
              href='/patient/appointments'
            />
            <StatCard
              icon={<FiDollarSign className='text-white text-xl' />}
              title='Pending Payments'
              value={stats.pendingPayments}
              color='bg-yellow-500'
              href='/patient/billing'
            />
            <StatCard
              icon={<FiMessageSquare className='text-white text-xl' />}
              title='Unread Messages'
              value={stats.unreadMessages}
              color='bg-purple-500'
              href='/patient/messages'
            />
            <StatCard
              icon={<FiFileText className='text-white text-xl' />}
              title='Medical Records'
              value={stats.medicalRecords}
              color='bg-green-500'
              href='/patient/medical-records'
            />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Recent Activity */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Recent Activity
                </h3>
                <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                  View All
                </button>
              </div>
              <div className='space-y-4'>
                {recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className='flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <ActivityIcon
                      type={activity.type}
                      status={activity.status}
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {activity.title}
                      </p>
                      <p className='text-sm text-gray-500 truncate'>
                        {activity.description}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-gray-500'>
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Metrics */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Health Metrics
                </h3>
                <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                  See Details
                </button>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {healthMetrics.map((metric, index) => (
                  <div key={index} className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-600'>
                        {metric.name}
                      </span>
                      <div
                        className={`flex items-center space-x-1 ${
                          metric.trend === 'up'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {metric.trend === 'up' ? (
                          <FiArrowUp className='text-sm' />
                        ) : (
                          <FiArrowDown className='text-sm' />
                        )}
                        <span className='text-xs font-medium'>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                    <div className='flex items-baseline space-x-1'>
                      <span className='text-xl font-bold text-gray-900'>
                        {metric.value}
                      </span>
                      <span className='text-sm text-gray-500'>
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='mt-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Quick Actions
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <button className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center'>
                <FiCalendar className='text-blue-600 text-xl mx-auto mb-2' />
                <span className='text-sm font-medium text-gray-900'>
                  Book Appointment
                </span>
              </button>
              <button className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center'>
                <FiMessageSquare className='text-purple-600 text-xl mx-auto mb-2' />
                <span className='text-sm font-medium text-gray-900'>
                  Message Doctor
                </span>
              </button>
              <button className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center'>
                <FiFileText className='text-green-600 text-xl mx-auto mb-2' />
                <span className='text-sm font-medium text-gray-900'>
                  View Records
                </span>
              </button>
              <button className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center'>
                <FiDollarSign className='text-yellow-600 text-xl mx-auto mb-2' />
                <span className='text-sm font-medium text-gray-900'>
                  Make Payment
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
