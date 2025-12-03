'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import PatientSelection from '../../../../components/lab/orders/new/PatientSelection';
import TestSelection from '../../../../components/lab/orders/new/TestSelection';
import OrderDetails from '../../../../components/lab/orders/new/OrderDetails';
import PrioritySettings from '../../../../components/lab/orders/new/PrioritySettings';
import OrderSummary from '../../../../components/lab/orders/new/OrderSummary';
import { NewOrderData, Patient, LabTest } from '@/types/lab';

const defaultOrderData: NewOrderData = {
  patientId: '',
  testId: '',
  priority: 'NORMAL',
  notes: '',
  referral: '',
  isCritical: false,
  requestedDate: new Date().toISOString().split('T')[0],
};

export default function NewLabOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<NewOrderData>(defaultOrderData);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [availableTests, setAvailableTests] = useState<LabTest[]>([]);

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch('/api/lab/lab-tests?activeOnly=true');
      if (!response.ok) throw new Error('Failed to fetch tests');
      const data = await response.json();
      setAvailableTests(data.tests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setOrderData(prev => ({ ...prev, patientId: patient._id }));
  };

  const handleTestSelect = (test: LabTest | null) => {
    setSelectedTest(test);
    setOrderData(prev => ({ ...prev, testId: test?._id || '' }));
  };

  const handleOrderDataChange = (updates: Partial<NewOrderData>) => {
    setOrderData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (): boolean => {
    if (!orderData.patientId) {
      setError('Please select a patient');
      return false;
    }
    if (!orderData.testId) {
      setError('Please select a test');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/lab-test-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      router.push(`/lab/orders/${result.testRequest._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => router.back()}
                className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'
              >
                <FiArrowLeft className='w-5 h-5 mr-2' />
                Back
              </button>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  New Lab Order
                </h1>
                <p className='text-gray-600 mt-1'>
                  Create a new laboratory test request
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mb-6'
          >
            <ErrorComponent message={error} />
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Selection Forms */}
            <div className='lg:col-span-2 space-y-6'>
              <PatientSelection
                selectedPatient={selectedPatient}
                onPatientSelect={handlePatientSelect}
              />

              <TestSelection
                availableTests={availableTests}
                selectedTest={selectedTest}
                onTestSelect={handleTestSelect}
              />

              <OrderDetails
                orderData={orderData}
                onOrderDataChange={handleOrderDataChange}
              />

              <PrioritySettings
                orderData={orderData}
                onOrderDataChange={handleOrderDataChange}
              />
            </div>

            {/* Right Column - Summary & Actions */}
            <div className='lg:col-span-1'>
              <OrderSummary
                selectedPatient={selectedPatient}
                selectedTest={selectedTest}
                orderData={orderData}
                submitting={submitting}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
