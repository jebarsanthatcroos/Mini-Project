/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiClock,
  FiMail,
  FiActivity,
  FiEye,
  FiShoppingCart,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';

interface Pharmacy {
  _id: string;
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email?: string;
    emergencyPhone?: string;
  };
  operatingHours: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  services: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  is24Hours: boolean;
  createdAt: string;
  updatedAt: string;
  inventory?: {
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
}

interface DashboardStats {
  totalPharmacies: number;
  activePharmacies: number;
  totalProducts: number;
  monthlyRevenue: number;
  pendingOrders: number;
  totalPatients: number;
  lowStockAlerts: number;
  totalInventoryValue: number;
}

export default function PharmacistDashboard() {
  const { data: session } = useSession();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalPharmacies: 0,
    activePharmacies: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    totalPatients: 0,
    lowStockAlerts: 0,
    totalInventoryValue: 0,
  });

  useEffect(() => {
    fetchPharmacies();
    fetchPatients();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pharmacy?limit=6');

      if (!response.ok) {
        throw new Error('Failed to fetch pharmacies');
      }

      const result = await response.json();

      if (result.success) {
        const pharmaciesData = result.data?.pharmacies || [];
        setPharmacies(pharmaciesData);
        calculateStats(pharmaciesData);
      } else {
        throw new Error(result.message || 'Failed to fetch pharmacies');
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPatients = async () => {
    try {
      // Fetch patients count from your API
      const response = await fetch('/api/pharmacy/patients');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(prev => ({
            ...prev,
            totalPatienTRts: result.data?.count || 0,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const calculateStats = (pharmaciesData: Pharmacy[]) => {
    const totalPharmacies = pharmaciesData.length;
    const activePharmacies = pharmaciesData.filter(
      p => p.status === 'ACTIVE'
    ).length;

    const totalProducts = pharmaciesData.reduce(
      (sum, pharmacy) => sum + (pharmacy.inventory?.totalProducts || 0),
      0
    );

    const lowStockAlerts = pharmaciesData.reduce(
      (sum, pharmacy) => sum + (pharmacy.inventory?.lowStockItems || 0),
      0
    );

    const totalInventoryValue = pharmaciesData.reduce((sum, pharmacy) => {
      const pharmacyValue = (pharmacy.inventory?.totalProducts || 0) * 100; // Mock average price
      return sum + pharmacyValue;
    }, 0);

    setStats(prev => ({
      ...prev,
      totalPharmacies,
      activePharmacies,
      totalProducts,
      lowStockAlerts,
      totalInventoryValue,
      monthlyRevenue: 28450, // Mock data
      pendingOrders: 23, // Mock data
    }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPharmacies();
    fetchPatients();
  };

  const filteredPharmacies = pharmacies.filter(
    pharmacy =>
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.contact.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'MAINTENANCE':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPharmacyAddress = (pharmacy: Pharmacy) => {
    if (!pharmacy?.address) return 'Address not available';
    const { street, city, state } = pharmacy.address;
    return `${street || ''}, ${city || ''}, ${state || ''}`.trim();
  };

  const handleDeletePharmacy = async (pharmacyId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this pharmacy? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/pharmacy/${pharmacyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchPharmacies();
      } else {
        alert('Failed to delete pharmacy: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      alert('Failed to delete pharmacy');
    }
  };

  if (!session) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Please sign in to access the dashboard
          </h1>
          <Link
            href='/auth/signin'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Pharmacy Dashboard
              </h1>
              <p className='text-gray-600 mt-2'>
                Welcome back, {session.user?.name || 'Pharmacist'}!
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
              <Link
                href='/Pharmacist/pharmacies/new'
                className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FiPlus className='w-5 h-5' />
                Add Pharmacy
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Pharmacies
                </p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {stats.totalPharmacies}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <FiPackage className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Pharmacies
                </p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {stats.activePharmacies}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                <FiActivity className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Products
                </p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {stats.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                <FiPackage className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Inventory Value
                </p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {formatCurrency(stats.totalInventoryValue)}
                </p>
              </div>
              <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                <FiDollarSign className='w-6 h-6 text-orange-600' />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Monthly Revenue
                </p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {formatCurrency(stats.monthlyRevenue)}
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
            transition={{ delay: 0.5 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Patients
                </p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {stats.totalPatients.toLocaleString()}
                </p>
              </div>
              <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center'>
                <FiUsers className='w-6 h-6 text-indigo-600' />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Low Stock Alerts
                </p>
                <p className='text-2xl font-bold text-yellow-600 mt-2'>
                  {stats.lowStockAlerts}
                </p>
              </div>
              <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
                <FiAlertTriangle className='w-6 h-6 text-yellow-600' />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Pharmacies */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Recent Pharmacies
              </h2>
              <div className='relative w-full sm:w-64'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiSearch className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  placeholder='Search pharmacies...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>

          <div className='p-6'>
            {loading ? (
              <div className='flex justify-center items-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : filteredPharmacies.length === 0 ? (
              <div className='text-center py-8'>
                <FiPackage className='mx-auto h-12 w-12 text-gray-400' />
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No pharmacies found
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by creating your first pharmacy'}
                </p>
                <div className='mt-6'>
                  <Link
                    href='/Pharmacist/pharmacies/new'
                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                  >
                    <FiPlus className='w-4 h-4 mr-2' />
                    Add Pharmacy
                  </Link>
                </div>
              </div>
            ) : (
              <div className='overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Pharmacy
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Contact
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Location
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredPharmacies.map(pharmacy => (
                      <tr key={pharmacy._id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {pharmacy.name}
                            </div>
                            <div className='text-sm text-gray-500 flex items-center mt-1'>
                              <FiClock className='w-4 h-4 mr-1' />
                              {pharmacy.is24Hours ? '24/7' : 'Standard Hours'}
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>
                            {pharmacy.contact.phone}
                          </div>
                          <div className='text-sm text-gray-500 flex items-center mt-1'>
                            <FiMail className='w-4 h-4 mr-1' />
                            {pharmacy.contact.email || 'No email'}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900 flex items-center'>
                            <FiMapPin className='w-4 h-4 mr-1' />
                            {getPharmacyAddress(pharmacy)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pharmacy.status)}`}
                          >
                            {getStatusText(pharmacy.status)}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex items-center space-x-2'>
                            <Link
                              href={`/Pharmacist/pharmacies/${pharmacy._id}`}
                              className='text-blue-600 hover:text-blue-900 p-1 transition-colors'
                              title='View Details'
                            >
                              <FiEye className='w-4 h-4' />
                            </Link>
                            <Link
                              href={`/Pharmacist/pharmacies/${pharmacy._id}/edit`}
                              className='text-green-600 hover:text-green-900 p-1 transition-colors'
                              title='Edit Pharmacy'
                            >
                              <FiEdit className='w-4 h-4' />
                            </Link>
                            <Link
                              href={`/Pharmacist/inventory?pharmacy=${pharmacy._id}`}
                              className='text-purple-600 hover:text-purple-900 p-1 transition-colors'
                              title='Manage Inventory'
                            >
                              <FiShoppingCart className='w-4 h-4' />
                            </Link>
                            <button
                              onClick={() => handleDeletePharmacy(pharmacy._id)}
                              className='text-red-600 hover:text-red-900 p-1 transition-colors'
                              title='Delete Pharmacy'
                            >
                              <FiTrash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Link
            href='/Pharmacist/pharmacies'
            className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all'
          >
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <FiPackage className='w-6 h-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  All Pharmacies
                </h3>
                <p className='text-gray-600 mt-1'>
                  View and manage all your pharmacy locations
                </p>
              </div>
            </div>
          </Link>

          <Link
            href='/Pharmacist/inventory'
            className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all'
          >
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                <FiTrendingUp className='w-6 h-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-medium text-gray-900'>Inventory</h3>
                <p className='text-gray-600 mt-1'>
                  Manage products and stock levels
                </p>
              </div>
            </div>
          </Link>

          <Link
            href='/Pharmacist/patients'
            className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all'
          >
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                <FiUsers className='w-6 h-6 text-purple-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-medium text-gray-900'>Patients</h3>
                <p className='text-gray-600 mt-1'>
                  Manage patient records and prescriptions
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
