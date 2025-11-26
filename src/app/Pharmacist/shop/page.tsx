/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiPackage,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import Image from 'next/image';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  minStockLevel: number;
  sku: string;
  manufacturer: string;
  requiresPrescription: boolean;
  pharmacy: {
    name: string;
  };
}

// Helper function to get product ID
const getProductId = (product: Product): string => {
  return product.id || product._id || '';
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const filterVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export default function PharmacistShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<
    'all' | 'inStock' | 'lowStock' | 'outOfStock'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const categories = [
    'Prescription',
    'OTC',
    'Supplements',
    'Medical Devices',
    'Personal Care',
    'Other',
  ];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, stockFilter, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (stockFilter !== 'all') {
        if (stockFilter === 'inStock') params.append('inStock', 'true');
        if (stockFilter === 'outOfStock') params.append('inStock', 'false');
      }

      const response = await fetch(`/api/products?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.pages);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!productId) {
      setError('Invalid product ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleteLoading(productId);
      setError(null);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchProducts(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete product'
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.inStock || product.stockQuantity === 0) {
      return {
        text: 'Out of Stock',
        color: 'text-red-600 bg-red-50 border-red-200',
      };
    }
    if (product.stockQuantity <= product.minStockLevel) {
      return {
        text: 'Low Stock',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      };
    }
    return {
      text: 'In Stock',
      color: 'text-green-600 bg-green-50 border-green-200',
    };
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setStockFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const retryFetch = () => {
    setError(null);
    fetchProducts();
  };

  // Show loading state
  if (loading) return <Loading />;

  // Show error state
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <div>
              <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text'>
                Product Inventory
              </h1>
              <p className='text-gray-600 mt-2'>
                Manage your pharmacy products efficiently
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/Pharmacist/shop/add-product')}
              className='flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl'
            >
              <FiPlus className='text-xl' />
              Add Product
            </motion.button>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20'
          >
            <div className='flex flex-col lg:flex-row gap-4'>
              <div className='flex-1 relative'>
                <FiSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg' />
                <input
                  type='text'
                  placeholder='Search products by name, SKU, or manufacturer...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300'
                />
              </div>
              <div className='flex gap-2'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50/50 backdrop-blur-sm transition-all duration-300'
                >
                  <FiFilter />
                  Filters
                  {(selectedCategory || stockFilter !== 'all') && (
                    <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                  )}
                </motion.button>
                {(selectedCategory || stockFilter !== 'all' || searchQuery) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearFilters}
                    className='flex items-center gap-2 px-4 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50/50 backdrop-blur-sm transition-all duration-300'
                  >
                    <FiX />
                    Clear
                  </motion.button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  variants={filterVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                  className='mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6'
                >
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300'
                    >
                      <option value=''>All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>
                      Stock Status
                    </label>
                    <select
                      value={stockFilter}
                      onChange={e => setStockFilter(e.target.value as any)}
                      className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300'
                    >
                      <option value='all'>All Products</option>
                      <option value='inStock'>In Stock</option>
                      <option value='lowStock'>Low Stock</option>
                      <option value='outOfStock'>Out of Stock</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3'>
              <FiAlertCircle className='text-red-500 text-xl' />
              <div className='flex-1'>
                <p className='text-red-800 text-sm'>{error}</p>
              </div>
              <button
                onClick={retryFetch}
                className='text-red-600 hover:text-red-800 text-sm font-medium'
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-12 text-center'
          >
            <FiPackage className='mx-auto text-6xl text-gray-300 mb-4' />
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No products found
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchQuery || selectedCategory || stockFilter !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'Start by adding your first product to the inventory'}
            </p>
            <div className='flex gap-3 justify-center'>
              {(searchQuery || selectedCategory || stockFilter !== 'all') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className='inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300'
                >
                  <FiX />
                  Clear Filters
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/Pharmacist/add-product')}
                className='inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300'
              >
                <FiPlus />
                Add Product
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            >
              <AnimatePresence>
                {products.map(product => {
                  const stockStatus = getStockStatus(product);
                  const productId = getProductId(product);

                  return (
                    <motion.div
                      key={productId || product.sku}
                      layout
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-white/20'
                    >
                      <div className='relative h-48 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden'>
                        <Image
                          src={product.image || '/placeholder-product.jpg'}
                          alt={product.name}
                          fill
                          className='object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                        {product.requiresPrescription && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='absolute top-3 left-3 bg-linear-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg'
                          >
                            Prescription
                          </motion.span>
                        )}
                        <motion.div
                          className={`absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full border ${stockStatus.color} backdrop-blur-sm`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {stockStatus.text}
                        </motion.div>
                      </div>

                      <div className='p-5'>
                        <div className='mb-3'>
                          <h3 className='font-semibold text-gray-900 line-clamp-2 text-lg mb-1 group-hover:text-blue-600 transition-colors'>
                            {product.name}
                          </h3>
                          <p className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
                            {product.description}
                          </p>
                        </div>

                        <div className='space-y-2 mb-4'>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>SKU:</span>
                            <span className='font-mono font-medium bg-gray-100 px-2 py-1 rounded'>
                              {product.sku}
                            </span>
                          </div>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>Stock:</span>
                            <span className='font-semibold'>
                              {product.stockQuantity} units
                            </span>
                          </div>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>Price:</span>
                            <span className='font-bold text-green-600 text-lg'>
                              Rs. {product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className='flex gap-2'>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (productId) {
                                router.push(`/Pharmacist/shop/${productId}`);
                              } else {
                                setError('Invalid product ID');
                              }
                            }}
                            disabled={!productId}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200'
                          >
                            <FiEdit className='text-sm' />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => productId && handleDelete(productId)}
                            disabled={!productId || deleteLoading === productId}
                            className='flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200'
                          >
                            {deleteLoading === productId ? (
                              <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
                            ) : (
                              <FiTrash2 className='text-sm' />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='mt-8 flex justify-center gap-3'
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/50 backdrop-blur-sm transition-all duration-300'
                >
                  Previous
                </motion.button>
                <div className='flex items-center gap-2'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      page =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <div key={page} className='flex items-center'>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className='px-2 text-gray-400'>...</span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </motion.button>
                      </div>
                    ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/50 backdrop-blur-sm transition-all duration-300'
                >
                  Next
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
