/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiEdit,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiUser,
  FiPackage,
  FiCalendar,
  FiTrash2,
  FiPlus,
  FiActivity,
} from 'react-icons/fi';

interface Pharmacy {
  _id: string;
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
  description?: string;
  website?: string;
  emergencyContact?: string;
  insuranceProviders: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PharmacyStats {
  totalProducts: number;
  activeOrders: number;
  monthlyRevenue: number;
  patientCount: number;
}

export default function PharmacyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [stats, setStats] = useState<PharmacyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pharmacyId = params.id as string;

  useEffect(() => {
    if (pharmacyId) {
      fetchPharmacy();
      fetchPharmacyStats();
    }
  }, [pharmacyId]);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/pharmacy/${pharmacyId}`);
      const result = await response.json();

      if (result.success) {
        setPharmacy(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
      setError('Failed to fetch pharmacy details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacyStats = async () => {
    // Mock stats for demonstration
    setStats({
      totalProducts: 156,
      activeOrders: 23,
      monthlyRevenue: 12500,
      patientCount: 342,
    });
  };

  const handleDeletePharmacy = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this pharmacy? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/pharmacy/${pharmacyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/pharmacy');
      } else {
        alert('Failed to delete pharmacy: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      alert('Failed to delete pharmacy');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-300 rounded w-1/4 mb-6'></div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 space-y-4'>
                <div className='h-64 bg-gray-300 rounded'></div>
                <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                <div className='h-4 bg-gray-300 rounded w-1/2'></div>
              </div>
              <div className='space-y-4'>
                <div className='h-32 bg-gray-300 rounded'></div>
                <div className='h-32 bg-gray-300 rounded'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex items-center gap-4 mb-6'>
            <Link
              href='/Pharmacist/dashboard'
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
            >
              <FiArrowLeft className='w-5 h-5' />
              Back to Dashboard
            </Link>
          </div>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
            <h2 className='text-xl font-semibold text-red-800 mb-2'>
              Error Loading Pharmacy
            </h2>
            <p className='text-red-600 mb-4'>{error || 'Pharmacy not found'}</p>
            <button
              onClick={() => router.push('/Pharmacist/dashboard')}
              className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
          <div className='flex items-center gap-4'>
            <Link
              href='/Pharmacist/dashboard'
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
            >
              <FiArrowLeft className='w-5 h-5' />
              Back to Dashboard
            </Link>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleDeletePharmacy}
              disabled={deleteLoading}
              className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors'
            >
              <FiTrash2 className='w-4 h-4' />
              {deleteLoading ? 'Deleting...' : 'Delete Pharmacy'}
            </button>
            <button
              onClick={() =>
                router.push(`/Pharmacist/pharmacy/${pharmacy._id}/edit`)
              }
              className='flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors'
            >
              <FiEdit className='w-4 h-4' />
              Edit Pharmacy
            </button>
          </div>
        </div>

        {/* Pharmacy Stats */}
        {stats && (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-blue-100 rounded-lg'>
                  <FiPackage className='w-6 h-6 text-blue-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Products
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-green-100 rounded-lg'>
                  <FiActivity className='w-6 h-6 text-green-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Active Orders
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.activeOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-purple-100 rounded-lg'>
                  <FiUser className='w-6 h-6 text-purple-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Patients</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.patientCount}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-orange-100 rounded-lg'>
                  <FiActivity className='w-6 h-6 text-orange-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Monthly Revenue
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pharmacy Details */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Basic Information */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2 sm:mb-0'>
                  {pharmacy.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pharmacy.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : pharmacy.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {pharmacy.status.charAt(0).toUpperCase() +
                    pharmacy.status.slice(1)}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                <div className='flex items-start gap-3'>
                  <FiMapPin className='w-5 h-5 text-gray-400 mt-1' />
                  <div>
                    <h3 className='font-semibold text-gray-900'>Address</h3>
                    <p className='text-gray-600 mt-1'>{pharmacy.address}</p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <FiPhone className='w-5 h-5 text-gray-400 mt-1' />
                  <div>
                    <h3 className='font-semibold text-gray-900'>Phone</h3>
                    <p className='text-gray-600 mt-1'>{pharmacy.phone}</p>
                  </div>
                </div>

                {pharmacy.email && (
                  <div className='flex items-start gap-3'>
                    <FiMail className='w-5 h-5 text-gray-400 mt-1' />
                    <div>
                      <h3 className='font-semibold text-gray-900'>Email</h3>
                      <p className='text-gray-600 mt-1'>{pharmacy.email}</p>
                    </div>
                  </div>
                )}

                <div className='flex items-start gap-3'>
                  <FiClock className='w-5 h-5 text-gray-400 mt-1' />
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      Operating Hours
                    </h3>
                    <p className='text-gray-600 mt-1'>
                      {formatTime(pharmacy.operatingHours.open)} -{' '}
                      {formatTime(pharmacy.operatingHours.close)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pharmacist Information */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FiUser className='w-5 h-5 text-blue-600' />
                Pharmacist Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-medium text-gray-900'>Pharmacist Name</h3>
                  <p className='text-gray-600 mt-1'>
                    {pharmacy.pharmacistName}
                  </p>
                </div>
                <div>
                  <h3 className='font-medium text-gray-900'>License Number</h3>
                  <p className='text-gray-600 mt-1 font-mono'>
                    {pharmacy.licenseNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            {pharmacy.services.length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Services Offered
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {pharmacy.services.map((service, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {pharmacy.description && (
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Description
                </h2>
                <p className='text-gray-600 leading-relaxed'>
                  {pharmacy.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <Link
                  href={`/Pharmacist/shop?pharmacy=${pharmacy._id}`}
                  className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <FiPackage className='w-5 h-5 text-blue-600' />
                  <span>Manage Products</span>
                </Link>
                <Link
                  href={`/Pharmacist/orders?pharmacy=${pharmacy._id}`}
                  className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <FiActivity className='w-5 h-5 text-green-600' />
                  <span>View Orders</span>
                </Link>
                <Link
                  href={`/Pharmacist/shop/add-product?pharmacy=${pharmacy._id}`}
                  className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <FiPlus className='w-5 h-5 text-purple-600' />
                  <span>Add New Product</span>
                </Link>
              </div>
            </div>

            {/* Insurance Providers */}
            {pharmacy.insuranceProviders.length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Insurance Providers
                </h3>
                <div className='space-y-2'>
                  {pharmacy.insuranceProviders.map((provider, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-gray-600'
                    >
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      {provider}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Additional Information
              </h3>
              <div className='space-y-3 text-sm'>
                {pharmacy.website && (
                  <div>
                    <span className='font-medium text-gray-900'>Website:</span>
                    <a
                      href={pharmacy.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline ml-2'
                    >
                      {pharmacy.website}
                    </a>
                  </div>
                )}
                {pharmacy.emergencyContact && (
                  <div>
                    <span className='font-medium text-gray-900'>
                      Emergency Contact:
                    </span>
                    <span className='text-gray-600 ml-2'>
                      {pharmacy.emergencyContact}
                    </span>
                  </div>
                )}
                <div>
                  <span className='font-medium text-gray-900'>Created By:</span>
                  <span className='text-gray-600 ml-2'>
                    {pharmacy.createdBy.name}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-gray-600'>
                  <FiCalendar className='w-4 h-4' />
                  <span>
                    Added on {new Date(pharmacy.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className='font-medium text-gray-900'>
                    Last Updated:
                  </span>
                  <span className='text-gray-600 ml-2'>
                    {new Date(pharmacy.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
