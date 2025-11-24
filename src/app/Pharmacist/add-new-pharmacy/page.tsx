/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiUser, 
  FiShield,
  FiGlobe,
  FiAlertCircle
} from 'react-icons/fi';

interface PharmacyFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  pharmacistName: string;
  licenseNumber: string;
  operatingHours: {
    open: string;
    close: string;
  };
  services: string[];
  description: string;
  website: string;
  emergencyContact: string;
  insuranceProviders: string[];
}

interface FormErrors {
  name?: string;
  address?: string;
  phone?: string;
  pharmacistName?: string;
  licenseNumber?: string;
  operatingHours?: string;
}

export default function AddNewPharmacy() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<PharmacyFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    pharmacistName: '',
    licenseNumber: '',
    operatingHours: {
      open: '09:00',
      close: '18:00'
    },
    services: [],
    description: '',
    website: '',
    emergencyContact: '',
    insuranceProviders: []
  });

  const serviceOptions = [
    'Prescription Dispensing',
    'Medication Counseling',
    'Health Screening',
    'Vaccinations',
    'Home Delivery',
    'Compounding Services',
    'Chronic Disease Management',
    'Emergency Supply',
    'Blood Pressure Monitoring',
    'Diabetes Care',
    'Smoking Cessation',
    'Travel Health',
    'Weight Management',
    'First Aid Supplies'
  ];

  const insuranceOptions = [
    'Medicare',
    'Medicaid',
    'Blue Cross Blue Shield',
    'Aetna',
    'UnitedHealthcare',
    'Cigna',
    'Humana',
    'Kaiser Permanente',
    'CVS Health',
    'Express Scripts'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pharmacy name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.pharmacistName.trim()) {
      newErrors.pharmacistName = 'Pharmacist name is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (formData.operatingHours.open >= formData.operatingHours.close) {
      newErrors.operatingHours = 'Opening time must be before closing time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleNestedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');

    setFormData(prev => {
      if (parent === 'operatingHours') {
        // operatingHours is known to be an object, so safely spread it
        const current = prev.operatingHours || { open: '09:00', close: '18:00' };
        return {
          ...prev,
          operatingHours: {
            ...current,
            [child]: value
          }
        };
      }

      // Fallback for other nested keys: treat previous value as any to avoid spreading non-object types
      return {
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      };
    });

    // Clear operating hours error when user changes time
    if (parent === 'operatingHours' && errors.operatingHours) {
      setErrors(prev => ({
        ...prev,
        operatingHours: undefined
      }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleInsuranceToggle = (insurance: string) => {
    setFormData(prev => ({
      ...prev,
      insuranceProviders: prev.insuranceProviders.includes(insurance)
        ? prev.insuranceProviders.filter(i => i !== insurance)
        : [...prev.insuranceProviders, insurance]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/pharmacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Pharmacy added successfully!');
        router.push('dashboard/pharmacy');
      } else {
        alert('Failed to add pharmacy: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding pharmacy:', error);
      alert('Failed to add pharmacy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/Pharmacist/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Pharmacy</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Register your pharmacy to start managing medications, inventory, and patient services.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Pharmacy Basic Information */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-blue-600" />
                  Pharmacy Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacy Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter pharmacy name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter full address including street, city, state, and zip code"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="pharmacy@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiGlobe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Pharmacist Information */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-green-600" />
                  Pharmacist Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pharmacistName" className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacist Name *
                    </label>
                    <input
                      type="text"
                      id="pharmacistName"
                      name="pharmacistName"
                      required
                      value={formData.pharmacistName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.pharmacistName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter pharmacist full name"
                    />
                    {errors.pharmacistName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.pharmacistName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      required
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter license number"
                    />
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {errors.licenseNumber}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Operating Hours */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-orange-600" />
                  Operating Hours
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="operatingHours.open" className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Time *
                    </label>
                    <input
                      type="time"
                      id="operatingHours.open"
                      name="operatingHours.open"
                      required
                      value={formData.operatingHours.open}
                      onChange={handleNestedInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.operatingHours ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="operatingHours.close" className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Time *
                    </label>
                    <input
                      type="time"
                      id="operatingHours.close"
                      name="operatingHours.close"
                      required
                      value={formData.operatingHours.close}
                      onChange={handleNestedInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.operatingHours ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                {errors.operatingHours && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.operatingHours}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Current hours: {formData.operatingHours.open} - {formData.operatingHours.close}
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-purple-600" />
                  Services Offered
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceOptions.map((service) => (
                    <div key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`service-${service}`}
                        className="ml-3 text-sm text-gray-700"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.services.length > 0 && (
                  <p className="mt-4 text-sm text-gray-600">
                    Selected services: {formData.services.join(', ')}
                  </p>
                )}
              </section>

              {/* Insurance Providers */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Insurance Providers
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insuranceOptions.map((insurance) => (
                    <div key={insurance} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`insurance-${insurance}`}
                        checked={formData.insuranceProviders.includes(insurance)}
                        onChange={() => handleInsuranceToggle(insurance)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`insurance-${insurance}`}
                        className="ml-3 text-sm text-gray-700"
                      >
                        {insurance}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.insuranceProviders.length > 0 && (
                  <p className="mt-4 text-sm text-gray-600">
                    Accepted insurance: {formData.insuranceProviders.join(', ')}
                  </p>
                )}
              </section>

              {/* Description */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Additional Information
                </h2>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Pharmacy Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Describe your pharmacy, specializations, areas of expertise, or any additional information that would be helpful for patients..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </section>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Link
                  href="/Pharmacist/dashboard"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding Pharmacy...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      Add Pharmacy
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at support@pharmacare.com or call +1 (800) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
}