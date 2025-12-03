/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import {
  FaPlus,
  FaTimes,
  FaSpinner,
  FaImage,
  FaIdCard,
  FaTag,
  FaDollarSign,
} from 'react-icons/fa';
import { IoMdMedical } from 'react-icons/io';

interface ShopFormData {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FormErrors {
  id?: string;
  name?: string;
  price?: string;
  image?: string;
}

interface AddShopFormProps {
  isOpen: boolean;
  onClose: () => void;
  onShopAdded: () => void;
}

export default function AddShopForm({
  isOpen,
  onClose,
  onShopAdded,
}: AddShopFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ShopFormData>({
    id: '',
    name: '',
    price: 0,
    image: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';

    // Validate URL format
    if (formData.image.trim() && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // For development - using mock API response
      // Replace this with your actual API call when ready
      console.log('Submitting shop data:', formData);

      // Mock API call - remove this when real API is ready
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock success response
      const mockResponse = {
        success: true,
        message: 'Shop added successfully!',
        data: { ...formData, createdAt: new Date().toISOString() },
      };

      if (mockResponse.success) {
        setFormData({ id: '', name: '', price: 0, image: '' });
        onShopAdded();
        onClose();
        alert('Shop added successfully!');
      } else {
        alert(`Error: ${mockResponse.message}`);
      }

      const response = await fetch('/api/Pharmacist/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFormData({ id: '', name: '', price: 0, image: '' });
        onShopAdded();
        onClose();
        alert('Shop added successfully!');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to add shop:', error);
      alert('Failed to add shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-2'>
              <IoMdMedical className='h-6 w-6 text-blue-600' />
              <h2 className='text-2xl font-bold'>Add New Pharmacy</h2>
            </div>
            <button
              onClick={onClose}
              className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
              disabled={loading}
            >
              <FaTimes className='h-5 w-5' />
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Shop ID */}
            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FaIdCard className='text-blue-500' />
                Shop ID *
              </label>
              <input
                type='text'
                name='id'
                value={formData.id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='pharmacy-001'
                disabled={loading}
              />
              {errors.id && (
                <p className='text-red-500 text-sm mt-1'>{errors.id}</p>
              )}
            </div>

            {/* Shop Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 items-center gap-2'>
                <FaTag className='text-green-500' />
                Shop Name *
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='City Pharmacy'
                disabled={loading}
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 items-center gap-2'>
                <FaDollarSign className='text-yellow-500' />
                Price *
              </label>
              <input
                type='number'
                name='price'
                value={formData.price}
                onChange={handleChange}
                step='0.01'
                min='0'
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='0.00'
                disabled={loading}
              />
              {errors.price && (
                <p className='text-red-500 text-sm mt-1'>{errors.price}</p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FaImage className='text-purple-500' />
                Image URL *
              </label>
              <input
                type='url'
                name='image'
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='https://example.com/image.jpg'
                disabled={loading}
              />
              {errors.image && (
                <p className='text-red-500 text-sm mt-1'>{errors.image}</p>
              )}
            </div>

            {/* Image Preview */}
            {formData.image && isValidUrl(formData.image) && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Image Preview
                </label>
                <div className='border rounded-lg p-2 bg-gray-50'>
                  <div className='relative w-full h-32 bg-gray-100 rounded flex items-center justify-center'>
                    <img
                      src={formData.image}
                      alt='Preview'
                      className='w-full h-full object-cover rounded'
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const errorDiv = (e.target as HTMLImageElement)
                          .nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.classList.remove('hidden');
                      }}
                    />
                    <div className='hidden text-center text-gray-500 text-sm'>
                      <FaImage className='mx-auto h-8 w-8 mb-2 text-gray-300' />
                      Unable to load image preview
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
                disabled={loading}
              >
                <FaTimes className='h-4 w-4' />
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <FaSpinner className='h-4 w-4 animate-spin' />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className='h-4 w-4' />
                    Add Shop
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
