/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiAlertTriangle,
  FiShoppingCart,
  FiTrendingUp,
  FiRefreshCw,
  FiEye,
  FiBarChart,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiUpload,
} from 'react-icons/fi';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';

interface InventoryItem {
  _id: string;
  id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  expiryDate?: string;
  batchNumber?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  pharmacy: {
    _id: string;
    name: string;
    address: {
      city: string;
      state: string;
    };
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  location?: string;
  reorderLevel?: number;
  reorderQuantity?: number;
  notes?: string;
}

interface Pharmacy {
  _id: string;
  id: string;
  name: string;
  address: {
    city: string;
    state: string;
  };
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiredCount: number;
  categoryDistribution: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get('pharmacy');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<
    'name' | 'quantity' | 'sellingPrice' | 'updatedAt'
  >('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (pharmacyId) {
      fetchInventory();
      fetchPharmacy();
    } else {
      setError('Pharmacy ID is required');
      setLoading(false);
    }
  }, [pharmacyId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        pharmacy: pharmacyId!,
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/inventory?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch inventory');
      }

      const data = await response.json();
      setInventory(data.data?.inventory || []);
      setStats(data.data?.statistics || null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPharmacy = async () => {
    try {
      const response = await fetch(`/api/pharmacy/${pharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setPharmacy(data.data || data.pharmacy);
      }
    } catch (err) {
      console.error('Error fetching pharmacy:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const handleDelete = async (itemId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      setInventory(prev => prev.filter(item => item._id !== itemId));
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort inventory
  const filteredAndSortedInventory = inventory
    .filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === 'all' || item.category === filterCategory;

      const matchesStatus =
        filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'sellingPrice':
          aValue = a.sellingPrice;
          bValue = b.sellingPrice;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get unique categories for filter
  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DISCONTINUED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'In Stock';
      case 'LOW_STOCK':
        return 'Low Stock';
      case 'OUT_OF_STOCK':
        return 'Out of Stock';
      case 'DISCONTINUED':
        return 'Discontinued';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSort = (
    field: 'name' | 'quantity' | 'sellingPrice' | 'updatedAt'
  ) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: 'name' | 'quantity' | 'sellingPrice' | 'updatedAt';
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className='flex items-center gap-1 hover:text-gray-700 transition-colors'
    >
      {children}
      {sortBy === field &&
        (sortOrder === 'asc' ? (
          <FiChevronUp className='w-4 h-4' />
        ) : (
          <FiChevronDown className='w-4 h-4' />
        ))}
    </button>
  );

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <button
              onClick={() => router.push('/Pharmacist/pharmacies')}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
            >
              <FiArrowLeft className='w-5 h-5' />
              Back to Pharmacies
            </button>
          </div>

          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Inventory Management
              </h1>
              <p className='text-gray-600 mt-2'>
                {pharmacy
                  ? `Managing inventory for ${pharmacy.name}`
                  : 'Loading pharmacy...'}
                {pharmacy?.address && (
                  <span className='text-gray-500'>
                    {' '}
                    • {pharmacy.address.city}, {pharmacy.address.state}
                  </span>
                )}
              </p>
            </div>
            <div className='flex gap-3'>
              <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} transition-colors`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} transition-colors`}
                >
                  Grid
                </button>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className='flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/Pharmacist/inventory/new?pharmacy=${pharmacyId}`
                  )
                }
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FiPlus className='w-4 h-4' />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Items
                  </p>
                  <p className='text-2xl font-bold text-gray-900 mt-1'>
                    {stats.totalItems}
                  </p>
                </div>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <FiPackage className='w-6 h-6 text-blue-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Inventory Value
                  </p>
                  <p className='text-2xl font-bold text-gray-900 mt-1'>
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                  <FiTrendingUp className='w-6 h-6 text-green-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Low Stock</p>
                  <p className='text-2xl font-bold text-yellow-600 mt-1'>
                    {stats.lowStockCount}
                  </p>
                </div>
                <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
                  <FiAlertTriangle className='w-6 h-6 text-yellow-600' />
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Out of Stock
                  </p>
                  <p className='text-2xl font-bold text-red-600 mt-1'>
                    {stats.outOfStockCount}
                  </p>
                </div>
                <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center'>
                  <FiShoppingCart className='w-6 h-6 text-red-600' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search items by name, SKU, category, or barcode...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-2'>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='IN_STOCK'>In Stock</option>
                <option value='LOW_STOCK'>Low Stock</option>
                <option value='OUT_OF_STOCK'>Out of Stock</option>
                <option value='DISCONTINUED'>Discontinued</option>
              </select>

              <button className='flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                <FiFilter className='w-5 h-5' />
                More
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
            <button className='flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm'>
              <FiDownload className='w-4 h-4' />
              Export
            </button>
            <button className='flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm'>
              <FiUpload className='w-4 h-4' />
              Import
            </button>
            <button className='flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm'>
              <FiBarChart className='w-4 h-4' />
              Reports
            </button>
          </div>
        </div>

        {/* Inventory Content */}
        {viewMode === 'list' ? (
          /* List View */
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      <SortButton field='name'>Product</SortButton>
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      SKU & Barcode
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      <SortButton field='quantity'>Quantity</SortButton>
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      <SortButton field='sellingPrice'>Price</SortButton>
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      <SortButton field='updatedAt'>Last Updated</SortButton>
                    </th>
                    <th className='px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  <AnimatePresence>
                    {filteredAndSortedInventory.map(item => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className='hover:bg-gray-50 transition-colors group'
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={() =>
                                setExpandedItem(
                                  expandedItem === item._id ? null : item._id
                                )
                              }
                              className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                              {expandedItem === item._id ? (
                                <FiChevronUp className='w-4 h-4' />
                              ) : (
                                <FiChevronDown className='w-4 h-4' />
                              )}
                            </button>
                            <div>
                              <div className='text-sm font-medium text-gray-900'>
                                {item.name}
                              </div>
                              {item.description && (
                                <div className='text-sm text-gray-500 truncate max-w-xs'>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900 font-mono'>
                            {item.sku}
                          </div>
                          {item.barcode && (
                            <div className='text-xs text-gray-500'>
                              📊 {item.barcode}
                            </div>
                          )}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {item.category}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {item.quantity}
                          </div>
                          <div className='text-xs text-gray-500'>
                            Low at: {item.lowStockThreshold}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {formatCurrency(item.sellingPrice)}
                          </div>
                          <div className='text-xs text-gray-500'>
                            Cost: {formatCurrency(item.costPrice)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatDate(item.updatedAt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                          <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button
                              onClick={() =>
                                router.push(`/Pharmacist/inventory/${item._id}`)
                              }
                              className='text-blue-600 hover:text-blue-900 p-2 transition-colors rounded-lg hover:bg-blue-50'
                              title='View Details'
                            >
                              <FiEye className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/Pharmacist/inventory/${item._id}/edit`
                                )
                              }
                              className='text-green-600 hover:text-green-900 p-2 transition-colors rounded-lg hover:bg-green-50'
                              title='Edit Item'
                            >
                              <FiEdit className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDeleteModal(true);
                              }}
                              className='text-red-600 hover:text-red-900 p-2 transition-colors rounded-lg hover:bg-red-50'
                              title='Delete Item'
                            >
                              <FiTrash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Expanded Item Details */}
            <AnimatePresence>
              {expandedItem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='border-t border-gray-200 bg-gray-50'
                >
                  {(() => {
                    const item = inventory.find(i => i._id === expandedItem);
                    if (!item) return null;

                    return (
                      <div className='p-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                          <div>
                            <h4 className='text-sm font-medium text-gray-500 mb-2'>
                              Supplier Info
                            </h4>
                            <p className='text-sm text-gray-900'>
                              {item.supplier || 'No supplier'}
                            </p>
                          </div>
                          <div>
                            <h4 className='text-sm font-medium text-gray-500 mb-2'>
                              Batch & Expiry
                            </h4>
                            <p className='text-sm text-gray-900'>
                              {item.batchNumber || 'No batch'}
                              {item.expiryDate && (
                                <span
                                  className={`block ${new Date(item.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-600'}`}
                                >
                                  Expires: {formatDate(item.expiryDate)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <h4 className='text-sm font-medium text-gray-500 mb-2'>
                              Location
                            </h4>
                            <p className='text-sm text-gray-900'>
                              {item.location || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <h4 className='text-sm font-medium text-gray-500 mb-2'>
                              Reorder Info
                            </h4>
                            <p className='text-sm text-gray-900'>
                              Level: {item.reorderLevel || 5}
                              <br />
                              Qty: {item.reorderQuantity || 25}
                            </p>
                          </div>
                        </div>
                        {item.notes && (
                          <div className='mt-4'>
                            <h4 className='text-sm font-medium text-gray-500 mb-2'>
                              Notes
                            </h4>
                            <p className='text-sm text-gray-900'>
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredAndSortedInventory.length === 0 && (
              <div className='text-center py-12'>
                <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FiPackage className='w-12 h-12 text-gray-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  {searchTerm ||
                  filterCategory !== 'all' ||
                  filterStatus !== 'all'
                    ? 'No items match your criteria'
                    : 'No inventory items found'}
                </h3>
                <p className='text-gray-600 mb-6'>
                  {searchTerm ||
                  filterCategory !== 'all' ||
                  filterStatus !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by adding your first inventory item.'}
                </p>
                {searchTerm ||
                filterCategory !== 'all' ||
                filterStatus !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setFilterStatus('all');
                    }}
                    className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      router.push(
                        `/Pharmacist/inventory/new?pharmacy=${pharmacyId}`
                      )
                    }
                    className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Add New Item
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            <AnimatePresence>
              {filteredAndSortedInventory.map(item => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all'
                >
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900 truncate'>
                        {item.name}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        {item.category}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </div>

                  <div className='space-y-3 mb-4'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-500'>SKU:</span>
                      <span className='font-mono text-gray-900'>
                        {item.sku}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-500'>Quantity:</span>
                      <span className='font-semibold text-gray-900'>
                        {item.quantity}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-500'>Price:</span>
                      <span className='font-semibold text-green-600'>
                        {formatCurrency(item.sellingPrice)}
                      </span>
                    </div>
                    {item.expiryDate && (
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>Expires:</span>
                        <span
                          className={`font-medium ${new Date(item.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-600'}`}
                        >
                          {formatDate(item.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='flex justify-between pt-4 border-t border-gray-200'>
                    <button
                      onClick={() =>
                        router.push(`/Pharmacist/inventory/${item._id}/edit`)
                      }
                      className='text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/Pharmacist/inventory/${item._id}`)
                      }
                      className='text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors'
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Results Count */}
        {filteredAndSortedInventory.length > 0 && (
          <div className='mt-4 text-sm text-gray-500'>
            Showing {filteredAndSortedInventory.length} of {inventory.length}{' '}
            items
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-xl p-6 max-w-md w-full'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <FiAlertTriangle className='w-5 h-5 text-red-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Delete Item
                </h3>
              </div>

              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete{' '}
                <strong>{selectedItem.name}</strong>? This action cannot be
                undone and will permanently remove this item from the inventory.
              </p>

              <div className='flex gap-3 justify-end'>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedItem(null);
                  }}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedItem._id)}
                  disabled={deleting}
                  className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors'
                >
                  {deleting ? 'Deleting...' : 'Delete Item'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
