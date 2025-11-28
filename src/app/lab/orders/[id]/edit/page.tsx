/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiAlertCircle } from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import { LabTestRequest, LabOrderFormData } from '@/types/lab';
import EditOrderForm from '@/components/lab/orders/edit/EditOrderForm';
import OrderSummaryCard from '@/components/lab/orders/edit/OrderSummaryCard';
import AssignmentCard from '@/components/lab/orders/edit/AssignmentCard';
import HelpCard from '@/components/lab/orders/edit/HelpCard';
import PageHeader from '@/components/lab/orders/edit/PageHeader';

export default function EditLabOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<LabTestRequest | null>(null);
  const [formData, setFormData] = useState<LabOrderFormData>({
    priority: 'NORMAL',
    status: 'REQUESTED',
    notes: '',
    results: '',
    findings: '',
    isCritical: false,
    sampleCollectedDate: '',
    startedDate: '',
    completedDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/lab/lab-test-requests/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const result = await response.json();

      if (result.success && result.request) {
        const orderData = result.request;
        setOrder(orderData);

        setFormData({
          priority: orderData.priority,
          status: orderData.status,
          notes: orderData.notes || '',
          results: orderData.results || '',
          findings: orderData.findings || '',
          isCritical: orderData.isCritical || false,
          sampleCollectedDate:
            orderData.sampleCollectedDate?.split('T')[0] || '',
          startedDate: orderData.startedDate?.split('T')[0] || '',
          completedDate: orderData.completedDate?.split('T')[0] || '',
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/lab/lab-test-requests/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      const result = await response.json();

      if (result.success) {
        router.push(`/lab/orders/${orderId}`);
      } else {
        throw new Error(result.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update order'
      );
    } finally {
      setUpdating(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.sampleCollectedDate && formData.startedDate) {
      if (
        new Date(formData.startedDate) < new Date(formData.sampleCollectedDate)
      ) {
        errors.startedDate =
          'Start date cannot be before sample collection date';
      }
    }

    if (formData.startedDate && formData.completedDate) {
      if (new Date(formData.completedDate) < new Date(formData.startedDate)) {
        errors.completedDate = 'Completion date cannot be before start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
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
      <div className='max-w-4xl mx-auto px-4 sm:px-6'>
        <PageHeader
          orderId={orderId}
          order={order}
          onBack={() => router.push(`/lab/orders/${orderId}`)}
        />

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Form */}
          <div className='lg:col-span-2'>
            <EditOrderForm
              formData={formData}
              formErrors={formErrors}
              updating={updating}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/lab/orders/${orderId}`)}
            />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <OrderSummaryCard order={order} />
            <AssignmentCard order={order} />
            <HelpCard />
          </div>
        </div>
      </div>
    </div>
  );
}
