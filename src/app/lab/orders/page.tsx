/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import OrdersStats from '@/components/lab/orders/OrdersStats';
import OrdersFilters from '@/components/lab/orders/OrdersFilters';
import OrdersTable from '@/components/lab/orders/OrdersTable';
import OrderDetailsModal from '@/components/lab/orders/OrderDetailsModal';
import { LabTestRequest, Filters } from '@/types/lab';

export default function LabOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<LabTestRequest[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<LabTestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LabTestRequest | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    search: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when orders or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/lab/lab-test-requests');

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(order => order.priority === filters.priority);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.patient.name.toLowerCase().includes(searchLower) ||
          order.test.name.toLowerCase().includes(searchLower) ||
          order.doctor.name.toLowerCase().includes(searchLower) ||
          order.labTechnician?.name?.toLowerCase().includes(searchLower) ||
          order.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        order =>
          new Date(order.requestedDate) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(
        order =>
          new Date(order.requestedDate) <= new Date(filters.dateRange.end)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value,
      },
    }));
  };

  const viewOrderDetails = (order: LabTestRequest) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: LabTestRequest['status']
  ) => {
    try {
      const response = await fetch(`/api/lab/lab-test-requests/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const assignTechnician = async (orderId: string, technicianId: string) => {
    try {
      const response = await fetch(`/api/lab/lab-test-requests/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labTechnician: technicianId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign technician');
      }

      await fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to assign technician'
      );
    }
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/lab/orders/${orderId}/edit`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Lab Orders</h1>
              <p className='text-gray-600 mt-2'>
                Manage and track laboratory test requests
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={fetchOrders}
                className='flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <FiRefreshCw className='mr-2' />
                Refresh
              </button>
              <button
                onClick={() => router.push('/lab/orders/new')}
                className='flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FiPlus className='mr-2' />
                New Order
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <OrdersStats orders={orders} />

        {/* Filters */}
        <OrdersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          onViewDetails={viewOrderDetails}
          onStatusUpdate={updateOrderStatus}
          onEditOrder={handleEditOrder}
        />
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowDetailsModal(false)}
          onStatusUpdate={updateOrderStatus}
          onAssignTechnician={assignTechnician}
        />
      )}
    </div>
  );
}
