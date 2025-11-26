/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  FiArrowLeft,
  FiSave,
  FiPackage,
  FiTag,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiBarChart,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface Pharmacy {
  _id: string;
  id: string;
  name: string;
  address: {
    city: string;
    state: string;
  };
}

const categories = [
  'Prescription Drugs',
  'Over-the-Counter',
  'Medical Supplies',
  'Personal Care',
  'Vitamins & Supplements',
  'First Aid',
  'Baby Care',
  'Senior Care',
  'Diabetes Care',
  'Allergy & Sinus',
  'Pain Relief',
  'Cold & Flu',
  'Digestive Health',
  'Skin Care',
  'Other',
];

export default function NewInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get('pharmacy');

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Prescription Drugs',
    sku: '',
    barcode: '',
    quantity: 0,
    lowStockThreshold: 10,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    expiryDate: '',
    batchNumber: '',
    location: '',
    reorderLevel: 5,
    reorderQuantity: 25,
    notes: '',
  });

  useEffect(() => {
    if (pharmacyId) {
      fetchPharmacy();
    } else {
      setError('Pharmacy ID is required');
      setLoading(false);
    }
  }, [pharmacyId]);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pharmacy/${pharmacyId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch pharmacy');
      }

      const data = await response.json();
      setPharmacy(data.data || data.pharmacy);
    } catch (err) {
      console.error('Error fetching pharmacy:', err);
      setError('Failed to load pharmacy information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const generateSKU = () => {
    const prefix = 'PHARM';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sku = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Product name is required';
    }
    if (!formData.sku.trim()) {
      return 'SKU is required';
    }
    if (formData.quantity < 0) {
      return 'Quantity cannot be negative';
    }
    if (formData.costPrice < 0) {
      return 'Cost price cannot be negative';
    }
    if (formData.sellingPrice < 0) {
      return 'Selling price cannot be negative';
    }
    if (formData.sellingPrice < formData.costPrice) {
      return 'Selling price must be greater than or equal to cost price';
    }
    if (formData.lowStockThreshold < 0) {
      return 'Low stock threshold cannot be negative';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = {
        ...formData,
        pharmacy: pharmacyId,
        sku: formData.sku.toUpperCase(),
        barcode: formData.barcode ? formData.barcode.toUpperCase() : undefined,
        batchNumber: formData.batchNumber
          ? formData.batchNumber.toUpperCase()
          : undefined,
        expiryDate: formData.expiryDate || undefined,
      };

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create inventory item');
      }

      router.push(`/Pharmacist/inventory?pharmacy=${pharmacyId}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating inventory item:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create inventory item'
      );
    } finally {
      setSaving(false);
    }
  };

  const calculateProfit = () => {
    if (formData.costPrice === 0) return 0;
    return (
      ((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100
    );
  };

  const calculateProfitAmount = () => {
    return formData.sellingPrice - formData.costPrice;
  };

  if (loading) return <Loading />;
  if (error && !pharmacy) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-6'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() =>
              router.push(`/Pharmacist/inventory?pharmacy=${pharmacyId}`)
            }
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
          >
            <FiArrowLeft className='w-5 h-5' />
            Back to Inventory
          </button>

          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Add New Inventory Item
              </h1>
              <p className='text-gray-600 mt-2'>
                {pharmacy
                  ? `Adding to ${pharmacy.name}`
                  : 'Loading pharmacy...'}
                {pharmacy?.address && (
                  <span className='text-gray-500'>
                    {' '}
                    • {pharmacy.address.city}, {pharmacy.address.state}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-red-800'>
              <FiAlertCircle className='w-5 h-5' />
              <span className='font-medium'>Error: {error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Basic Information */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiPackage className='w-5 h-5 text-blue-600' />
                  Basic Information
                </h2>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Product Name *
                    </label>
                    <input
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter product name'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Description
                    </label>
                    <textarea
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter product description'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Category *
                      </label>
                      <select
                        name='category'
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Location
                      </label>
                      <input
                        type='text'
                        name='location'
                        value={formData.location}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='e.g., Aisle 3, Shelf B'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiTag className='w-5 h-5 text-green-600' />
                  Identification
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      SKU *
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        name='sku'
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                        className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter SKU'
                      />
                      <button
                        type='button'
                        onClick={generateSKU}
                        className='px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap'
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Barcode
                    </label>
                    <input
                      type='text'
                      name='barcode'
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter barcode'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Batch Number
                    </label>
                    <input
                      type='text'
                      name='batchNumber'
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter batch number'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Supplier
                    </label>
                    <input
                      type='text'
                      name='supplier'
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter supplier name'
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Pricing */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  Stock & Pricing
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Stock Information
                    </h3>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Quantity *
                      </label>
                      <input
                        type='number'
                        name='quantity'
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min='0'
                        required
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Low Stock Threshold *
                      </label>
                      <input
                        type='number'
                        name='lowStockThreshold'
                        value={formData.lowStockThreshold}
                        onChange={handleInputChange}
                        min='0'
                        required
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <p className='text-sm text-gray-500 mt-1'>
                        Alert when stock falls below this level
                      </p>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Reorder Level
                        </label>
                        <input
                          type='number'
                          name='reorderLevel'
                          value={formData.reorderLevel}
                          onChange={handleInputChange}
                          min='0'
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Reorder Qty
                        </label>
                        <input
                          type='number'
                          name='reorderQuantity'
                          value={formData.reorderQuantity}
                          onChange={handleInputChange}
                          min='1'
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Pricing Information
                    </h3>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Cost Price *
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <span className='text-gray-500'>LKR</span>
                        </div>
                        <input
                          type='number'
                          name='costPrice'
                          value={formData.costPrice}
                          onChange={handleInputChange}
                          min='0'
                          step='0.01'
                          required
                          className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Selling Price *
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <span className='text-gray-500'>LKR</span>
                        </div>
                        <input
                          type='number'
                          name='sellingPrice'
                          value={formData.sellingPrice}
                          onChange={handleInputChange}
                          min='0'
                          step='0.01'
                          required
                          className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                    </div>

                    {/* Profit Calculation */}
                    {formData.costPrice > 0 && formData.sellingPrice > 0 && (
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          Profit Analysis
                        </h4>
                        <div className='space-y-1 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-gray-600'>
                              Profit per unit:
                            </span>
                            <span
                              className={`font-medium ${calculateProfitAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatCurrency(calculateProfitAmount())}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-600'>
                              Profit margin:
                            </span>
                            <span
                              className={`font-medium ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {calculateProfit().toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <FiCalendar className='w-5 h-5 text-orange-600' />
                  Additional Information
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Expiry Date
                    </label>
                    <input
                      type='date'
                      name='expiryDate'
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Notes
                    </label>
                    <textarea
                      name='notes'
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Any additional notes or instructions...'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Actions */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Actions
                </h2>

                <div className='space-y-3'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
                  >
                    <FiSave className='w-5 h-5' />
                    {saving ? 'Creating...' : 'Create Item'}
                  </button>

                  <button
                    type='button'
                    onClick={() =>
                      router.push(
                        `/Pharmacist/inventory?pharmacy=${pharmacyId}`
                      )
                    }
                    className='w-full text-gray-600 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <FiBarChart className='w-5 h-5 text-gray-600' />
                  Quick Stats
                </h2>

                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Current Stock Value:</span>
                    <span className='font-medium text-gray-900'>
                      {formatCurrency(formData.quantity * formData.costPrice)}
                    </span>
                  </div>

                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Potential Revenue:</span>
                    <span className='font-medium text-gray-900'>
                      {formatCurrency(
                        formData.quantity * formData.sellingPrice
                      )}
                    </span>
                  </div>

                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Stock Status:</span>
                    <span
                      className={`font-medium ${
                        formData.quantity === 0
                          ? 'text-red-600'
                          : formData.quantity <= formData.lowStockThreshold
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      {formData.quantity === 0
                        ? 'Out of Stock'
                        : formData.quantity <= formData.lowStockThreshold
                          ? 'Low Stock'
                          : 'In Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pharmacy Info */}
              {pharmacy && (
                <div className='bg-blue-50 border border-blue-200 rounded-xl p-6'>
                  <h3 className='font-semibold text-blue-900 mb-3'>
                    Pharmacy Information
                  </h3>

                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center gap-2 text-blue-800'>
                      <FiUser className='w-4 h-4' />
                      <span>{pharmacy.name}</span>
                    </div>
                    <div className='flex items-center gap-2 text-blue-700'>
                      <FiMapPin className='w-4 h-4' />
                      <span>
                        {pharmacy.address.city}, {pharmacy.address.state}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-uk', {
    style: 'currency',
    currency: 'lkr',
  }).format(amount);
}
