'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import { LabTestRequest } from '@/types/lab';
import OrderDetailsHeader from '@/components/lab/orders/OrderDetailsHeader';
import StatusTimeline from '@/components/lab/orders/StatusTimeline';
import TestResults from '@/components/lab/orders/TestResults';
import OrderInformation from '@/components/lab/orders/OrderInformation';
import PatientInformation from '@/components/lab/orders/PatientInformation';
import ActionButtons from '@/components/lab/orders/ActionButtons';

export default function LabOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<LabTestRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/lab/lab-test-requests/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();

      if (result.success && result.request) {
        setOrder(result.request);
      } else {
        throw new Error(result.message || 'Failed to fetch order data');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load order details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/lab/orders/${orderId}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download order:', orderId);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !order) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <ErrorComponent message={error || 'Order not found'} />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <OrderDetailsHeader
          order={order}
          onBack={() => router.push('/lab/orders')}
        />

        {/* Action Buttons */}
        <ActionButtons
          onEdit={handleEdit}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Status Timeline */}
            <StatusTimeline order={order} />

            {/* Test Results */}
            <TestResults order={order} />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Order Information */}
            <OrderInformation order={order} />

            {/* Patient Information */}
            <PatientInformation order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
