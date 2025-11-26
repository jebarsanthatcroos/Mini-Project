/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiBarChart2,
  FiArrowUp,
  FiRefreshCw,
} from 'react-icons/fi';

interface AppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  monthlyAppointments: number;
  averageDuration: number;
  totalRevenue: number;
  monthlyRevenue: number;
  appointmentTypes: {
    type: string;
    count: number;
    revenue: number;
  }[];
  weeklyTrend: {
    date: string;
    appointments: number;
    revenue: number;
  }[];
}

export default function AppointmentStatsPage() {
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/doctor/appointments/stats?range=${timeRange}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Appointment Statistics
              </h1>
              <p className='text-gray-600 mt-2'>
                Overview of your appointment performance and trends
              </p>
            </div>
            <div className='flex gap-3'>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value as any)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='week'>This Week</option>
                <option value='month'>This Month</option>
                <option value='year'>This Year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className='flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50'
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Appointments
                    </p>
                    <p className='text-2xl font-bold text-gray-900 mt-2'>
                      {stats.totalAppointments}
                    </p>
                    <p className='text-sm text-green-600 mt-1 flex items-center'>
                      <FiArrowUp className='w-4 h-4 mr-1' />
                      {stats.monthlyAppointments} this month
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                    <FiCalendar className='w-6 h-6 text-blue-600' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Completed
                    </p>
                    <p className='text-2xl font-bold text-gray-900 mt-2'>
                      {stats.completedAppointments}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      {(
                        (stats.completedAppointments /
                          stats.totalAppointments) *
                        100
                      ).toFixed(1)}
                      % completion rate
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                    <FiUsers className='w-6 h-6 text-green-600' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Today&apos;s Appointments
                    </p>
                    <p className='text-2xl font-bold text-gray-900 mt-2'>
                      {stats.todayAppointments}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      {stats.pendingAppointments} pending
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                    <FiClock className='w-6 h-6 text-orange-600' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Revenue
                    </p>
                    <p className='text-2xl font-bold text-gray-900 mt-2'>
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <p className='text-sm text-green-600 mt-1 flex items-center'>
                      <FiTrendingUp className='w-4 h-4 mr-1' />
                      {formatCurrency(stats.monthlyRevenue)} this month
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                    <FiDollarSign className='w-6 h-6 text-purple-600' />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Additional Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Average Duration
                    </p>
                    <p className='text-2xl font-bold text-gray-900 mt-2'>
                      {formatDuration(stats.averageDuration)}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      per appointment
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center'>
                    <FiClock className='w-6 h-6 text-indigo-600' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Cancelled
                    </p>
                    <p className='text-2xl font-bold text-red-600 mt-2'>
                      {stats.cancelledAppointments}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      {(
                        (stats.cancelledAppointments /
                          stats.totalAppointments) *
                        100
                      ).toFixed(1)}
                      % cancellation rate
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center'>
                    <FiTrendingUp className='w-6 h-6 text-red-600' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Appointment Types
                    </p>
                    <p className='text-2xl font-bold text-gray-900 mt-2'>
                      {stats.appointmentTypes.length}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      different types
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center'>
                    <FiBarChart2 className='w-6 h-6 text-teal-600' />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Appointment Types Breakdown */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Appointment Types
                </h3>
                <div className='space-y-3'>
                  {stats.appointmentTypes.map(type => (
                    <div
                      key={type.type}
                      className='flex justify-between items-center'
                    >
                      <span className='text-sm font-medium text-gray-700'>
                        {type.type}
                      </span>
                      <div className='flex items-center gap-4'>
                        <span className='text-sm text-gray-600'>
                          {type.count} appointments
                        </span>
                        <span className='text-sm font-medium text-green-600'>
                          {formatCurrency(type.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Weekly Trend */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
              >
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Weekly Trend
                </h3>
                <div className='space-y-3'>
                  {stats.weeklyTrend.map(day => (
                    <div
                      key={day.date}
                      className='flex justify-between items-center'
                    >
                      <span className='text-sm font-medium text-gray-700'>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                        })}
                      </span>
                      <div className='flex items-center gap-4'>
                        <span className='text-sm text-gray-600'>
                          {day.appointments} appointments
                        </span>
                        <span className='text-sm font-medium text-green-600'>
                          {formatCurrency(day.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Revenue vs Appointments Chart Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
            >
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Performance Overview
              </h3>
              <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
                <div className='text-center'>
                  <FiBarChart2 className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                  <p className='text-gray-500'>
                    Chart visualization would be implemented here
                  </p>
                  <p className='text-sm text-gray-400'>
                    Showing data for {timeRange}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
