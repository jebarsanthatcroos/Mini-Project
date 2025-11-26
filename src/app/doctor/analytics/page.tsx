/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/doctor/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import {
  FaUserInjured,
  FaUsers,
  FaCalendarAlt,
  FaStar,
  FaDollarSign,
  FaChartBar,
  FaChartLine,
  FaUserFriends,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaStethoscope,
  FaArrowUp,
  FaArrowDown,
  FaSync,
} from 'react-icons/fa';

interface AnalyticsData {
  overview: {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageRating: number;
    totalRevenue: number;
    newPatients: number;
    returningPatients: number;
  };
  monthlyStats: Array<{
    month: string;
    year: number;
    appointments: number;
    patients: number;
    revenue: number;
    growth: number;
  }>;
  patientDemographics: {
    ageGroups: {
      under18: number;
      age18to35: number;
      age36to60: number;
      over60: number;
    };
    genderDistribution: {
      male: number;
      female: number;
      other: number;
    };
  };
  appointmentTrends: {
    byDay: Array<{
      day: string;
      count: number;
    }>;
    byTime: Array<{
      time: string;
      count: number;
    }>;
  };
  commonDiagnoses: Array<{
    diagnosis: string;
    count: number;
    percentage: number;
  }>;
  revenueAnalysis: {
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      growth: number;
    }>;
    byService: Array<{
      service: string;
      revenue: number;
      percentage: number;
    }>;
  };
}

export default function DoctorAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<
    '7days' | '30days' | '90days' | '1year'
  >('30days');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (session?.user?.role !== 'DOCTOR') {
      router.push('/unauthorized');
    }

    if (session?.user) {
      fetchAnalytics();
    }
  }, [session, status, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/doctor/analytics?range=${timeRange}`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <FaArrowUp className='text-green-500' />;
    } else if (growth < 0) {
      return <FaArrowDown className='text-red-500' />;
    }
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Show loading component
  if (status === 'loading' || loading) {
    return <Loading />;
  }

  // Show error component
  if (error) {
    return <ErrorComponent message={error} />;
  }

  // Show loading while no analytics data
  if (!analytics) {
    return <Loading />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center'>
              <FaChartBar className='h-8 w-8 text-blue-600 mr-3' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Practice Analytics
                </h1>
                <p className='mt-1 text-sm text-gray-600'>
                  Insights and statistics about your medical practice
                </p>
              </div>
            </div>
            <div className='mt-4 sm:mt-0 flex space-x-3'>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value as any)}
                className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
              >
                <option value='7days'>Last 7 days</option>
                <option value='30days'>Last 30 days</option>
                <option value='90days'>Last 90 days</option>
                <option value='1year'>Last year</option>
              </select>
              <Link
                href='/doctor/dashboard'
                className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Total Patients */}
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='shrink-0'>
                  <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
                    <FaUserInjured className='w-5 h-5 text-white' />
                  </div>
                </div>
                <div className='ml-4 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Total Patients
                    </dt>
                    <dd className='text-2xl font-bold text-gray-900'>
                      {analytics.overview.totalPatients}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className='mt-2 flex items-center text-sm text-green-600'>
                <span>{analytics.overview.newPatients} new this month</span>
              </div>
            </div>
          </div>

          {/* Total Appointments */}
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='shrink-0'>
                  <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center'>
                    <FaCalendarAlt className='w-5 h-5 text-white' />
                  </div>
                </div>
                <div className='ml-4 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Total Appointments
                    </dt>
                    <dd className='text-2xl font-bold text-gray-900'>
                      {analytics.overview.totalAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className='mt-2 text-sm text-gray-500'>
                {analytics.overview.completedAppointments} completed •{' '}
                {analytics.overview.cancelledAppointments} cancelled
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='shrink-0'>
                  <div className='w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center'>
                    <FaStar className='w-5 h-5 text-white' />
                  </div>
                </div>
                <div className='ml-4 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Average Rating
                    </dt>
                    <dd className='text-2xl font-bold text-gray-900'>
                      {analytics.overview.averageRating.toFixed(1)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className='mt-2 flex items-center text-yellow-400'>
                {'★'.repeat(Math.floor(analytics.overview.averageRating))}
                {'☆'.repeat(5 - Math.floor(analytics.overview.averageRating))}
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='p-5'>
              <div className='flex items-center'>
                <div className='shrink-0'>
                  <div className='w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center'>
                    <FaDollarSign className='w-5 h-5 text-white' />
                  </div>
                </div>
                <div className='ml-4 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-gray-500 truncate'>
                      Total Revenue
                    </dt>
                    <dd className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(analytics.overview.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className='mt-2 text-sm text-green-600'>
                12% from last month
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className='mb-6'>
          <nav className='flex space-x-8'>
            {[
              { id: 'overview', name: 'Overview', icon: FaChartBar },
              { id: 'patients', name: 'Patients', icon: FaUsers },
              {
                id: 'appointments',
                name: 'Appointments',
                icon: FaCalendarCheck,
              },
              { id: 'revenue', name: 'Revenue', icon: FaMoneyBillWave },
              { id: 'diagnoses', name: 'Diagnoses', icon: FaStethoscope },
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className='mr-2' />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='bg-white shadow rounded-lg'>
          <div className='p-6'>
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-medium text-gray-900 flex items-center'>
                  <FaChartBar className='mr-2' />
                  Practice Overview
                </h3>

                {/* Monthly Stats */}
                <div>
                  <h4 className='text-md font-medium text-gray-900 mb-4 flex items-center'>
                    <FaChartLine className='mr-2' />
                    Monthly Performance
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {analytics.monthlyStats.slice(-4).map((stat, index) => (
                      <div key={index} className='border rounded-lg p-4'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <p className='text-sm font-medium text-gray-600'>
                              {stat.month}
                            </p>
                            <p className='text-2xl font-bold text-gray-900'>
                              {stat.appointments}
                            </p>
                            <p className='text-sm text-gray-500'>
                              appointments
                            </p>
                          </div>
                          <div
                            className={`flex items-center ${getGrowthColor(stat.growth)}`}
                          >
                            {getGrowthIcon(stat.growth)}
                            <span className='text-sm ml-1'>
                              {Math.abs(stat.growth)}%
                            </span>
                          </div>
                        </div>
                        <div className='mt-2 text-sm text-gray-500'>
                          {formatCurrency(stat.revenue)} revenue
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-blue-50 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <FaUserFriends className='text-blue-600 mr-3' />
                      <div>
                        <p className='text-sm font-medium text-blue-900'>
                          Patient Types
                        </p>
                        <p className='text-lg font-bold text-blue-700'>
                          {analytics.overview.newPatients} New /{' '}
                          {analytics.overview.returningPatients} Returning
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='bg-green-50 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <FaCalendarCheck className='text-green-600 mr-3' />
                      <div>
                        <p className='text-sm font-medium text-green-900'>
                          Completion Rate
                        </p>
                        <p className='text-lg font-bold text-green-700'>
                          {formatPercentage(
                            analytics.overview.completedAppointments /
                              analytics.overview.totalAppointments
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='bg-purple-50 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <FaMoneyBillWave className='text-purple-600 mr-3' />
                      <div>
                        <p className='text-sm font-medium text-purple-900'>
                          Avg. Revenue/Appointment
                        </p>
                        <p className='text-lg font-bold text-purple-700'>
                          {formatCurrency(
                            analytics.overview.totalRevenue /
                              analytics.overview.completedAppointments
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-medium text-gray-900 flex items-center'>
                  <FaUsers className='mr-2' />
                  Patient Analytics
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Age Distribution */}
                  <div>
                    <h4 className='text-md font-medium text-gray-900 mb-4'>
                      Age Distribution
                    </h4>
                    <div className='space-y-3'>
                      {Object.entries(
                        analytics.patientDemographics.ageGroups
                      ).map(([ageGroup, count]) => (
                        <div
                          key={ageGroup}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm text-gray-600 capitalize'>
                            {ageGroup.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className='text-sm font-medium text-gray-900'>
                            {count} patients
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender Distribution */}
                  <div>
                    <h4 className='text-md font-medium text-gray-900 mb-4'>
                      Gender Distribution
                    </h4>
                    <div className='space-y-3'>
                      {Object.entries(
                        analytics.patientDemographics.genderDistribution
                      ).map(([gender, count]) => (
                        <div
                          key={gender}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm text-gray-600 capitalize'>
                            {gender}
                          </span>
                          <span className='text-sm font-medium text-gray-900'>
                            {count} patients
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-medium text-gray-900 flex items-center'>
                  <FaCalendarCheck className='mr-2' />
                  Appointment Analytics
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* By Day */}
                  <div>
                    <h4 className='text-md font-medium text-gray-900 mb-4'>
                      Appointments by Day
                    </h4>
                    <div className='space-y-3'>
                      {analytics.appointmentTrends.byDay.map((trend, index) => (
                        <div
                          key={index}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm text-gray-600 capitalize'>
                            {trend.day}
                          </span>
                          <span className='text-sm font-medium text-gray-900'>
                            {trend.count} appointments
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Time */}
                  <div>
                    <h4 className='text-md font-medium text-gray-900 mb-4'>
                      Peak Hours
                    </h4>
                    <div className='space-y-3'>
                      {analytics.appointmentTrends.byTime
                        .slice(0, 5)
                        .map((trend, index) => (
                          <div
                            key={index}
                            className='flex justify-between items-center'
                          >
                            <span className='text-sm text-gray-600'>
                              {trend.time}
                            </span>
                            <span className='text-sm font-medium text-gray-900'>
                              {trend.count} appointments
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-medium text-gray-900 flex items-center'>
                  <FaMoneyBillWave className='mr-2' />
                  Revenue Analytics
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Monthly Revenue */}
                  <div>
                    <h4 className='text-md font-medium text-gray-900 mb-4'>
                      Monthly Revenue
                    </h4>
                    <div className='space-y-3'>
                      {analytics.revenueAnalysis.monthlyRevenue
                        .slice(-6)
                        .map((revenue, index) => (
                          <div
                            key={index}
                            className='flex justify-between items-center'
                          >
                            <span className='text-sm text-gray-600'>
                              {revenue.month}
                            </span>
                            <div className='flex items-center space-x-2'>
                              <span className='text-sm font-medium text-gray-900'>
                                {formatCurrency(revenue.revenue)}
                              </span>
                              <span
                                className={`text-xs ${getGrowthColor(revenue.growth)}`}
                              >
                                {revenue.growth > 0 ? '+' : ''}
                                {revenue.growth}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Revenue by Service */}
                  <div>
                    <h4 className='text-md font-medium text-gray-900 mb-4'>
                      Revenue by Service
                    </h4>
                    <div className='space-y-3'>
                      {analytics.revenueAnalysis.byService.map(
                        (service, index) => (
                          <div
                            key={index}
                            className='flex justify-between items-center'
                          >
                            <span className='text-sm text-gray-600'>
                              {service.service}
                            </span>
                            <div className='flex items-center space-x-2'>
                              <span className='text-sm font-medium text-gray-900'>
                                {formatCurrency(service.revenue)}
                              </span>
                              <span className='text-xs text-gray-500'>
                                ({formatPercentage(service.percentage)})
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'diagnoses' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-medium text-gray-900 flex items-center'>
                  <FaStethoscope className='mr-2' />
                  Common Diagnoses
                </h3>

                <div className='space-y-4'>
                  {analytics.commonDiagnoses.map((diagnosis, index) => (
                    <div
                      key={index}
                      className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {diagnosis.diagnosis}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {diagnosis.count} cases
                        </p>
                      </div>
                      <div className='w-20 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{ width: `${diagnosis.percentage * 100}%` }}
                        ></div>
                      </div>
                      <span className='text-sm font-medium text-gray-700 ml-3 w-12'>
                        {formatPercentage(diagnosis.percentage)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className='mt-6 flex justify-end'>
          <button
            onClick={fetchAnalytics}
            className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
          >
            <FaSync className='mr-2' />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
