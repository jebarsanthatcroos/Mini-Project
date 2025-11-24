'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
  FiPhone,
  FiClock,
  FiActivity,
  FiBarChart2
} from 'react-icons/fi';

interface Pharmacy {
  _id: string;
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  pharmacistName: string;
  licenseNumber: string;
  operatingHours: {
    open: string;
    close: string;
  };
  services: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

interface DashboardStats {
  totalPharmacies: number;
  activePharmacies: number;
  totalProducts: number;
  monthlyRevenue: number;
  pendingOrders: number;
  totalPatients: number;
}

export default function PharmacistDashboard() {
  const { data: session } = useSession();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalPharmacies: 0,
    activePharmacies: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    totalPatients: 0
  });

  useEffect(() => {
    fetchPharmacies();
    fetchStats();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pharmacy?limit=6');
      const result = await response.json();
      
      if (result.success) {
        setPharmacies(result.data.pharmacies);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock stats for demonstration - in real app, fetch from API
    setStats({
      totalPharmacies: 8,
      activePharmacies: 7,
      totalProducts: 342,
      monthlyRevenue: 28450,
      pendingOrders: 23,
      totalPatients: 1567
    });
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.pharmacistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleDeletePharmacy = async (pharmacyId: string) => {
    if (!confirm('Are you sure you want to delete this pharmacy?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pharmacy/${pharmacyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchPharmacies(); // Refresh the list
        fetchStats(); // Refresh stats
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access the dashboard</h1>
          <Link href="/auth/signin" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {session.user?.name || 'Pharmacist'}!
            </p>
          </div>
          <Link
            href="/Pharmacist/add-new-pharmacy"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Add New Pharmacy
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pharmacies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPharmacies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiActivity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Pharmacies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePharmacies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pharmacies */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Pharmacies</h2>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-8">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pharmacies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first pharmacy'}
              </p>
              <div className="mt-6">
                <Link
                  href="/Pharmacist/add-new-pharmacy"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Pharmacy
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pharmacy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pharmacy.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {pharmacy.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pharmacy.pharmacistName}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <FiPhone className="w-4 h-4 mr-1" />
                          {pharmacy.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {formatTime(pharmacy.operatingHours.open)} - {formatTime(pharmacy.operatingHours.close)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pharmacy.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : pharmacy.status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {pharmacy.status.charAt(0).toUpperCase() + pharmacy.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/Pharmacist/${pharmacy._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePharmacy(pharmacy._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Pharmacy"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/Pharmacist/shop?pharmacy=${pharmacy._id}`}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Manage Products"
                          >
                            <FiPackage className="w-4 h-4" />
                          </Link>
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
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/Pharmacist/shop"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Products</h3>
              <p className="text-gray-600 mt-1">Add, edit, or remove products from your inventory</p>
            </div>
          </div>
        </Link>

        <Link
          href="/Pharmacist/orders"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">View Orders</h3>
              <p className="text-gray-600 mt-1">Manage and track customer orders</p>
            </div>
          </div>
        </Link>

        <Link
          href="/Pharmacist/analytics"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiBarChart2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
              <p className="text-gray-600 mt-1">View sales reports and analytics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}