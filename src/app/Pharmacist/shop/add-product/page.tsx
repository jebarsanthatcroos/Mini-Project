'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiAlertCircle,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import Image from 'next/image';

// Zod validation schema
const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(val => parseFloat(val) > 0, 'Price must be greater than 0'),
  costPrice: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  image: z.string().min(1, 'Product image is required'),
  inStock: z.boolean().default(true),
  stockQuantity: z
    .string()
    .min(1, 'Stock quantity is required')
    .refine(val => parseInt(val) >= 0, 'Stock quantity cannot be negative'),
  minStockLevel: z.string().default('10'),
  pharmacy: z.string().min(1, 'Pharmacy is required'),
  sku: z.string().min(1, 'SKU is required'),
  manufacturer: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  isControlledSubstance: z.boolean().default(false),
  sideEffects: z.string().optional(),
  dosage: z.string().optional(),
  activeIngredients: z.string().optional(),
  barcode: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Pharmacy {
  _id: string;
  name: string;
  address: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [pharmaciesLoading, setPharmaciesLoading] = useState(true);
  const [pharmaciesError, setPharmaciesError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(
      productSchema
    ) as unknown as Resolver<ProductFormData>,
    defaultValues: {
      inStock: true,
      requiresPrescription: false,
      isControlledSubstance: false,
      minStockLevel: '10',
      name: '',
      description: '',
      price: '',
      costPrice: '',
      category: '',
      image: '',
      stockQuantity: '',
      pharmacy: '',
      sku: '',
      manufacturer: '',
      sideEffects: '',
      dosage: '',
      activeIngredients: '',
      barcode: '',
    },
    mode: 'onChange',
  });

  const categories = [
    'Prescription',
    'OTC',
    'Supplements',
    'Medical Devices',
    'Personal Care',
    'First Aid',
    'Baby Care',
    'Vitamins',
    'Other',
  ];

  const watchedImage = watch('image');
  const watchedRequiresPrescription = watch('requiresPrescription');

  // Fetch pharmacies and generate SKU once on mount
  useEffect(() => {
    fetchPharmacies();
    generateSKU();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update local preview when image field changes
  useEffect(() => {
    if (watchedImage) {
      setImagePreview(watchedImage);
    } else {
      setImagePreview('');
    }
  }, [watchedImage]);

  const fetchPharmacies = async () => {
    try {
      setPharmaciesLoading(true);
      setPharmaciesError('');

      const response = await fetch('/api/pharmacy?limit=50');
      const data = await response.json();

      if (data?.success && data.data?.pharmacies) {
        setPharmacies(data.data.pharmacies);
        if (data.data.pharmacies.length > 0) {
          setValue('pharmacy', data.data.pharmacies[0]._id);
        }
      } else {
        setPharmaciesError(data?.error || 'Failed to load pharmacies');
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setPharmaciesError('Unable to load pharmacies. Please try again.');

      // Fallback: Create a mock pharmacy for testing
      const mockPharmacy: Pharmacy = {
        _id: 'mock-pharmacy-1',
        name: 'Main Pharmacy',
        address: '123 Main Street, Colombo',
      };
      setPharmacies([mockPharmacy]);
      setValue('pharmacy', mockPharmacy._id);
    } finally {
      setPharmaciesLoading(false);
    }
  };

  const generateSKU = () => {
    const sku = `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setValue('sku', sku, { shouldDirty: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue('image', base64String, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('image', '', { shouldValidate: true, shouldDirty: true });
    setImagePreview('');
  };

  const onSubmit: SubmitHandler<ProductFormData> = async data => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        price: parseFloat(data.price as unknown as string),
        costPrice: data.costPrice
          ? parseFloat(data.costPrice as unknown as string)
          : 0,
        stockQuantity: parseInt(data.stockQuantity as unknown as string) || 0,
        minStockLevel: parseInt(data.minStockLevel as unknown as string) || 10,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result?.success) {
        setShowSuccess(true);
        // redirect after a short confirmation
        setTimeout(() => {
          router.push('/Pharmacist/shop');
        }, 1400);
      } else {
        throw new Error(result?.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 md:p-6'>
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='fixed top-4 right-4 z-50'
          >
            <div className='bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3'>
              <FiCheck className='text-xl' />
              <span>Product added successfully! Redirecting...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='space-y-6'
      >
        {/* Header */}
        <motion.div variants={itemVariants} className='mb-6'>
          <button
            onClick={() => router.push('/Pharmacist/shop')}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200 group'
          >
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <FiArrowLeft className='group-hover:text-blue-600 transition-colors' />
            </motion.div>
            <span className='group-hover:text-blue-600 transition-colors'>
              Back to Shop
            </span>
          </button>
          <div className='text-center'>
            <h1 className='text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Add Product
            </h1>
            <p className='text-gray-600 mt-2'>
              Add a new product to your pharmacy inventory
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Column - Image */}
            <motion.div variants={itemVariants} className='lg:col-span-1'>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-6 border border-white/20'>
                <h2 className='text-xl font-semibold mb-4 text-gray-800'>
                  Product Image *
                </h2>

                <div className='space-y-4'>
                  <div className='relative h-80 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300/50 hover:border-blue-400/50 transition-all duration-300 group'>
                    {imagePreview ? (
                      <>
                        <div className='relative w-full h-full'>
                          <Image
                            src={imagePreview}
                            alt='Product preview'
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <button
                          type='button'
                          onClick={removeImage}
                          className='absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200'
                        >
                          <FiX className='text-sm' />
                        </button>
                      </>
                    ) : (
                      <div className='absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors duration-300'>
                        <FiUpload className='text-5xl mb-3' />
                        <p className='text-center text-sm'>
                          Click to upload
                          <br />
                          product image
                        </p>
                      </div>
                    )}
                  </div>

                  <label className='cursor-pointer flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-dashed border-gray-300/50 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group'>
                    <FiUpload className='text-blue-500 group-hover:scale-110 transition-transform duration-200' />
                    <span className='text-blue-600 font-medium'>
                      Choose Product Image
                    </span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='hidden'
                    />
                  </label>

                  <div className='text-xs text-gray-500 text-center space-y-1'>
                    <p>Recommended: 500x500px, JPG or PNG</p>
                    <p>Max file size: 5MB</p>
                  </div>

                  {errors.image && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='text-red-500 text-sm flex items-center gap-2'
                    >
                      <FiAlertCircle />
                      {errors.image.message}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Basic Information */}
              <motion.div
                variants={itemVariants}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'
              >
                <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
                  Basic Information
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Product Name *
                    </label>
                    <input
                      {...register('name')}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='Enter product name'
                    />
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-red-500 text-sm mt-2 flex items-center gap-2'
                      >
                        <FiAlertCircle />
                        {errors.name.message}
                      </motion.p>
                    )}
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none'
                      placeholder='Enter product description'
                    />
                    {errors.description && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-red-500 text-sm mt-2 flex items-center gap-2'
                      >
                        <FiAlertCircle />
                        {errors.description.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Manufacturer
                    </label>
                    <input
                      {...register('manufacturer')}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='Enter manufacturer name'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Category *
                    </label>
                    <select
                      {...register('category')}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                    >
                      <option value=''>Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-red-500 text-sm mt-2 flex items-center gap-2'
                      >
                        <FiAlertCircle />
                        {errors.category.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Pharmacy *
                    </label>
                    {pharmaciesLoading ? (
                      <div className='w-full px-4 py-3 border border-gray-300/50 rounded-xl bg-gray-100/50 animate-pulse'>
                        Loading pharmacies...
                      </div>
                    ) : pharmaciesError ? (
                      <div className='flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50/50 p-3 rounded-xl border border-yellow-200'>
                        <FiAlertCircle />
                        <span>{pharmaciesError}</span>
                      </div>
                    ) : (
                      <select
                        {...register('pharmacy')}
                        className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      >
                        <option value=''>Select Pharmacy</option>
                        {pharmacies.map(pharmacy => (
                          <option key={pharmacy._id} value={pharmacy._id}>
                            {pharmacy.name} - {pharmacy.address}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.pharmacy && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-red-500 text-sm mt-2 flex items-center gap-2'
                      >
                        <FiAlertCircle />
                        {errors.pharmacy.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      SKU (Auto-generated)
                    </label>
                    <input
                      {...register('sku')}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200'
                      readOnly
                    />
                  </div>
                </div>
              </motion.div>

              {/* Pricing & Stock */}
              <motion.div
                variants={itemVariants}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'
              >
                <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
                  Pricing & Stock
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Selling Price (Rs.) *
                    </label>
                    <input
                      type='number'
                      {...register('price')}
                      min='0'
                      step='0.01'
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='0.00'
                    />
                    {errors.price && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-red-500 text-sm mt-2 flex items-center gap-2'
                      >
                        <FiAlertCircle />
                        {errors.price.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Cost Price (Rs.)
                    </label>
                    <input
                      type='number'
                      {...register('costPrice')}
                      min='0'
                      step='0.01'
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='0.00'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Stock Quantity *
                    </label>
                    <input
                      type='number'
                      {...register('stockQuantity')}
                      min='0'
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='0'
                    />
                    {errors.stockQuantity && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-red-500 text-sm mt-2 flex items-center gap-2'
                      >
                        <FiAlertCircle />
                        {errors.stockQuantity.message}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Min Stock Level
                    </label>
                    <input
                      type='number'
                      {...register('minStockLevel')}
                      min='0'
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='10'
                    />
                  </div>

                  <div className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      {...register('inStock')}
                      className='w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300/50'
                    />
                    <label className='text-sm font-medium text-gray-700'>
                      Product is in stock
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Medical Information */}
              <motion.div
                variants={itemVariants}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'
              >
                <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
                  Medical Information
                </h2>
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Active Ingredients
                    </label>
                    <input
                      {...register('activeIngredients')}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200'
                      placeholder='e.g., Paracetamol 500mg'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Dosage Instructions
                    </label>
                    <textarea
                      {...register('dosage')}
                      rows={2}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none'
                      placeholder='e.g., Take 1 tablet every 4-6 hours as needed'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Side Effects
                    </label>
                    <textarea
                      {...register('sideEffects')}
                      rows={2}
                      className='w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none'
                      placeholder='e.g., May cause drowsiness, nausea'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex items-center space-x-3'>
                      <input
                        type='checkbox'
                        {...register('requiresPrescription')}
                        className='w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300/50'
                      />
                      <label className='text-sm font-medium text-gray-700'>
                        Requires prescription
                      </label>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <input
                        type='checkbox'
                        {...register('isControlledSubstance')}
                        className='w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300/50'
                      />
                      <label className='text-sm font-medium text-gray-700'>
                        Controlled substance
                      </label>
                    </div>
                  </div>

                  <AnimatePresence>
                    {watchedRequiresPrescription && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='bg-blue-50/50 border border-blue-200 rounded-xl p-4'
                      >
                        <p className='text-sm text-blue-700 flex items-center gap-2'>
                          <FiAlertCircle />
                          This product requires a valid prescription for
                          purchase.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20'
              >
                <div className='flex flex-col sm:flex-row gap-4 justify-end items-center'>
                  <motion.button
                    type='button'
                    onClick={() => router.push('/Pharmacist/shop')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='w-full sm:w-auto px-8 py-4 border border-gray-300/50 rounded-xl hover:bg-gray-50/50 transition-all duration-200 font-medium text-gray-700'
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type='submit'
                    disabled={loading || pharmaciesLoading || !isDirty}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className='w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl'
                  >
                    <div className='flex items-center justify-center gap-3'>
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className='w-5 h-5 border-2 border-white border-t-transparent rounded-full'
                        />
                      ) : (
                        <FiSave className='text-lg' />
                      )}
                      {loading ? 'Adding Product...' : 'Add Product'}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
