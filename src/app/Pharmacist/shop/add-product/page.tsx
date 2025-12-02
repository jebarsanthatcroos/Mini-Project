/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessNotification from '@/components/products/SuccessNotification';
import ProductImageUpload from '@/components/products/ProductImageUpload';
import BasicInformationForm from '@/components/products/Form/BasicInformationForm';
import PricingStockForm from '@/components/products/Form/PricingStockForm';
import MedicalInformationForm from '@/components/products/Form/MedicalInformationForm';
import FormActions from '@/components/products/Form/FormActions';
import { ProductFormData } from '@/types/product';
import { productSchema } from '@/validation/product';

const CATEGORIES = [
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

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
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
    resolver: zodResolver(productSchema) as any,
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

  const watchedImage = watch('image');
  const watchedRequiresPrescription = watch('requiresPrescription');
  useEffect(() => {
    fetchPharmacies();
    generateSKU();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (watchedImage) {
      setImagePreview(watchedImage);
    } else {
      setImagePreview('');
    }
  }, [watchedImage]);
  const formatAddress = (address: any): string => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street && address.street.trim())
        parts.push(address.street.trim());
      if (address.city && address.city.trim()) parts.push(address.city.trim());
      if (address.state && address.state.trim())
        parts.push(address.state.trim());
      if (address.zipCode && address.zipCode.trim())
        parts.push(address.zipCode.trim());
      return parts.join(', ');
    }
    return '';
  };

  const fetchPharmacies = async () => {
    try {
      setPharmaciesLoading(true);
      setPharmaciesError('');

      const response = await fetch('/api/pharmacy?limit=50');
      const data = await response.json();

      if (data?.success && data.data?.pharmacies) {
        const formattedPharmacies = data.data.pharmacies.map(
          (pharmacy: any) => ({
            _id: pharmacy._id || `pharmacy-${Date.now()}-${Math.random()}`,
            name: pharmacy.name || 'Unknown Pharmacy',
            address: pharmacy.address || {},
          })
        );
        setPharmacies(formattedPharmacies);
        if (formattedPharmacies.length > 0) {
          setValue('pharmacy', formattedPharmacies[0]._id);
        }
      } else {
        setPharmaciesError(data?.error || 'Failed to load pharmacies');
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setPharmaciesError('Unable to load pharmacies. Please try again.');
      // Add mock pharmacy for development
      const mockPharmacy = {
        _id: 'mock-pharmacy-1',
        name: 'Main Pharmacy',
        address: {
          street: '123 Main Street',
          city: 'Colombo',
          state: 'Western Province',
          zipCode: '00100',
          country: 'Sri Lanka',
        },
      };
      setPharmacies([mockPharmacy]);
      setValue('pharmacy', mockPharmacy._id);
    } finally {
      setPharmaciesLoading(false);
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sku = `SKU-${timestamp}-${random}`;
    setValue('sku', sku, { shouldDirty: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
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
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('image', '', { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        price: parseFloat(data.price),
        costPrice: data.costPrice ? parseFloat(data.costPrice) : 0,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        minStockLevel: parseInt(data.minStockLevel) || 10,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result?.success) {
        setShowSuccess(true);
        setTimeout(() => router.push('/Pharmacist/shop'), 1400);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 md:p-6'>
      <AnimatePresence>
        <SuccessNotification show={showSuccess} />
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='space-y-6'
      >
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <motion.div variants={itemVariants} className='lg:col-span-1'>
              <ProductImageUpload
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                error={errors.image?.message}
              />
            </motion.div>

            <div className='lg:col-span-2 space-y-6'>
              <motion.div variants={itemVariants}>
                <BasicInformationForm
                  register={register}
                  errors={errors}
                  pharmacies={pharmacies}
                  pharmaciesLoading={pharmaciesLoading}
                  pharmaciesError={pharmaciesError}
                  categories={CATEGORIES}
                  formatAddress={formatAddress}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PricingStockForm register={register} errors={errors} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <MedicalInformationForm
                  register={register}
                  watchedRequiresPrescription={watchedRequiresPrescription}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormActions
                  loading={loading}
                  isDirty={isDirty}
                  pharmaciesLoading={pharmaciesLoading}
                  onSubmit={handleSubmit(onSubmit)}
                />
              </motion.div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
