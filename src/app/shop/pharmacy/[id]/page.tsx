'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import { motion } from 'framer-motion';
import {
  BiArrowBack,
  BiShoppingBag,
  BiCart,
  BiStar,
  BiBraille,
  BiChevronLeft,
  BiChevronRight,
  BiShield,
  BiInfoCircle,
} from 'react-icons/bi';
import ProductCard from '@/components/shop/ProductCard';
import useCartContext, { CartContextType } from '@/context/CartContext';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  costPrice: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  minStockLevel: number;
  manufacturer: string;
  requiresPrescription: boolean;
  isControlledSubstance: boolean;
  sideEffects?: string;
  dosage?: string;
  activeIngredients?: string;
  barcode: string;
  sku: string;
  discountPercentage?: number;
  features?: string[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export default function ProductReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCartContext() as CartContextType;

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Get the ID safely from params
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : null;

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching product with ID:', id);

      // Validate ID before making request
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Product ID is missing');
      }

      // Validate MongoDB ObjectId format (24 hex characters)
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid product ID format');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/products/user/${id}`);

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        } else if (response.status === 400) {
          throw new Error('Invalid product ID');
        } else if (response.status === 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
      }

      const responseData = await response.json();
      console.log('Product API response:', responseData);

      // Handle both response formats: {success: true, data: product} or direct product
      let productData: Product | null = null;

      if (responseData.success && responseData.data) {
        // Format: {success: true, data: product}
        productData = responseData.data;
      } else if (responseData._id) {
        // Format: direct product object
        productData = responseData;
      }

      if (productData && productData._id) {
        setProduct(productData);
        const firstImage = Array.isArray(productData.image)
          ? productData.image[0]
          : productData.image;
        setMainImage(firstImage || '/placeholder-medicine.jpg');
      } else {
        console.warn('Product data is invalid:', responseData);
        throw new Error('Invalid product data received from server');
      }
    } catch (err) {
      console.error('Fetch product error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRelatedProducts = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/products/user/`);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        setProducts([]);
        return;
      }

      const data = await response.json();
      console.log('Related products API response:', data);

      // Safely extract products array
      let productsArray: Product[] = [];

      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.products)) productsArray = data.products;
        else if (Array.isArray(data.data)) productsArray = data.data;
        else if (Array.isArray(data.items)) productsArray = data.items;
        else if (Array.isArray(data.result)) productsArray = data.result;
      }

      // Ensure we have valid products with _id
      const validProducts = productsArray.filter(
        (p: Product) => p && p._id && typeof p._id === 'string'
      );

      setProducts(
        validProducts.filter((p: Product) => p._id !== id).slice(0, 4)
      );
    } catch (err) {
      console.error('Failed to load related products:', err);
      setProducts([]);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null') {
      fetchProduct();
      fetchRelatedProducts();
    } else {
      setError('Product ID is missing or invalid');
      setLoading(false);
    }
  }, [fetchProduct, fetchRelatedProducts, id]);

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;
  if (!product) return <ErrorComponent message='Product not found' />;

  const imageArray = Array.isArray(product.image)
    ? product.image
    : [product.image];
  const discountPercentage = product.discountPercentage || 0;
  const discountedPrice = product.price * (1 - discountPercentage / 100);
  const discountAmount = product.price - discountedPrice;

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % imageArray.length;
    setCurrentImageIndex(newIndex);
    setMainImage(imageArray[newIndex]);
  };

  const prevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + imageArray.length) % imageArray.length;
    setCurrentImageIndex(newIndex);
    setMainImage(imageArray[newIndex]);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stockQuantity) {
      setQuantity(product.stockQuantity);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product.inStock) {
      alert('This product is out of stock');
      return;
    }

    if (product.requiresPrescription) {
      alert(
        'This product requires a prescription. Please consult with a pharmacist.'
      );
      return;
    }

    const productToAdd = {
      _id: product._id,
      name: product.name,
      image: imageArray[0],
      price: product.price,
      quantity: quantity,
      requiresPrescription: product.requiresPrescription,
    };
    addToCart(productToAdd);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/shop/my-cart');
  };

  const getStockStatus = () => {
    if (!product.inStock) {
      return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (product.stockQuantity <= product.minStockLevel) {
      return {
        text: `Low Stock (${product.stockQuantity} left)`,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      };
    }
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className='bg-gray-50 min-h-screen'>
      {/* Navigation Breadcrumb */}
      <div className='bg-white py-4 px-6 md:px-16 lg:px-32 border-b'>
        <div className='flex items-center text-sm text-gray-600'>
          <Link href='/' className='hover:text-blue-600'>
            Home
          </Link>
          <span className='mx-2'>/</span>
          <Link href='/shop' className='hover:text-blue-600'>
            Pharmacy
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-blue-600'>{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className='px-6 md:px-16 lg:px-32 py-10 max-w-7xl mx-auto'>
        <button
          className='flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-8'
          onClick={() => router.back()}
        >
          <BiArrowBack size={20} />
          <span className='font-medium'>Back to products</span>
        </button>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Product Images */}
          <div className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className='relative rounded-xl overflow-hidden bg-white shadow-md'
            >
              <div className='w-full h-96 relative'>
                <Image
                  src={mainImage || '/placeholder-medicine.jpg'}
                  fill
                  className='object-contain p-8'
                  alt={product.name}
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </div>

              {imageArray.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md'
                    aria-label='Previous image'
                  >
                    <BiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md'
                    aria-label='Next image'
                  >
                    <BiChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Stock Status Badge */}
              <div
                className={`absolute top-4 left-4 ${stockStatus.bg} ${stockStatus.color} px-3 py-1 rounded-full text-sm font-medium`}
              >
                {stockStatus.text}
              </div>

              {discountPercentage > 0 && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className='absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium'
                >
                  -{discountPercentage}%
                </motion.div>
              )}

              {/* Prescription Required Badge */}
              {product.requiresPrescription && (
                <div className='absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1'>
                  <BiShield size={16} />
                  Prescription Required
                </div>
              )}
            </motion.div>

            {imageArray.length > 1 && (
              <div className='grid grid-cols-4 gap-3'>
                {imageArray.map((img, index) => (
                  <motion.div
                    key={index}
                    onClick={() => {
                      setMainImage(img);
                      setCurrentImageIndex(index);
                    }}
                    className={`cursor-pointer rounded-lg overflow-hidden bg-white border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                    whileHover={{ scale: 1.06 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.05 * index,
                      type: 'spring',
                      stiffness: 300,
                    }}
                  >
                    <div className='w-full h-20 relative'>
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className='object-contain p-2'
                        sizes='(max-width: 768px) 25vw, 10vw'
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: 'spring', delay: 0.2 }}
            className='space-y-6'
          >
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {product.name}
              </h1>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex items-center gap-1 text-yellow-500'>
                  {[...Array(5)].map((_, i) => (
                    <BiStar key={i} size={18} className='fill-current' />
                  ))}
                </div>
                <span className='text-gray-600 text-sm'>(42 reviews)</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <BiBraille size={16} />
                <span>SKU: {product.sku}</span>
                <span className='mx-2'>•</span>
                <span>Manufacturer: {product.manufacturer}</span>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-4'>
                <p className='text-3xl font-bold text-gray-900'>
                  {formatPrice(discountedPrice)}
                </p>
                {discountPercentage > 0 && (
                  <p className='text-lg text-gray-500 line-through'>
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
              {discountPercentage > 0 && (
                <p className='text-green-600 text-sm'>
                  You save {formatPrice(discountAmount)} ({discountPercentage}%)
                </p>
              )}
            </div>

            {product.description && (
              <p className='text-gray-700 leading-relaxed'>
                {product.description}
              </p>
            )}

            {/* Medical Information */}
            <div className='pt-4'>
              <h3 className='font-medium text-gray-900 mb-2 flex items-center gap-2'>
                <BiInfoCircle size={20} className='text-blue-600' />
                Product Information
              </h3>
              <ul className='space-y-2 text-gray-700'>
                {product.activeIngredients && (
                  <li className='flex items-start'>
                    <span className='text-blue-500 mr-2'>•</span>
                    <span className='font-medium'>Active Ingredients:</span>
                    <span className='ml-2'>{product.activeIngredients}</span>
                  </li>
                )}
                {product.dosage && (
                  <li className='flex items-start'>
                    <span className='text-blue-500 mr-2'>•</span>
                    <span className='font-medium'>Dosage:</span>
                    <span className='ml-2'>{product.dosage}</span>
                  </li>
                )}
                {product.sideEffects && (
                  <li className='flex items-start'>
                    <span className='text-blue-500 mr-2'>•</span>
                    <span className='font-medium'>Side Effects:</span>
                    <span className='ml-2'>{product.sideEffects}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className='pt-4'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm text-gray-600'>Quantity</span>
                  <div className='flex items-center border rounded-md overflow-hidden'>
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className='px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50'
                      aria-label='Decrease quantity'
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className='px-4 py-2 bg-white w-12 text-center'>
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className='px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50'
                      aria-label='Increase quantity'
                      disabled={quantity >= product.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  {product.stockQuantity > 0 && (
                    <span className='text-xs text-gray-500'>
                      {product.stockQuantity} available
                    </span>
                  )}
                </div>

                <div className='flex-1 grid grid-cols-2 gap-3 mt-6'>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || product.requiresPrescription}
                    className='py-3 bg-gray-900 text-white hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed'
                  >
                    <BiShoppingBag size={20} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock || product.requiresPrescription}
                    className='py-3 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed'
                  >
                    <BiCart size={20} />
                    Buy Now
                  </button>
                </div>
              </div>

              <div className='border-t pt-4'>
                <div className='flex items-center gap-4 text-sm text-gray-600'>
                  <span className='font-medium'>Category:</span>
                  <span>{product.category}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Specifications */}
        <div className='mt-16 bg-white rounded-xl shadow-sm p-6 md:p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Specifications
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-medium text-gray-900 mb-3'>General</h3>
              <div className='space-y-2'>
                <div className='flex justify-between border-b pb-2'>
                  <span className='text-gray-600'>Manufacturer</span>
                  <span className='text-gray-900 font-medium'>
                    {product.manufacturer}
                  </span>
                </div>
                <div className='flex justify-between border-b pb-2'>
                  <span className='text-gray-600'>SKU</span>
                  <span className='text-gray-900 font-medium'>
                    {product.sku}
                  </span>
                </div>
                <div className='flex justify-between border-b pb-2'>
                  <span className='text-gray-600'>Barcode</span>
                  <span className='text-gray-900 font-medium'>
                    {product.barcode}
                  </span>
                </div>
                <div className='flex justify-between border-b pb-2'>
                  <span className='text-gray-600'>Category</span>
                  <span className='text-gray-900 font-medium capitalize'>
                    {product.category}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='font-medium text-gray-900 mb-3'>
                Medical Information
              </h3>
              <div className='space-y-2'>
                <div className='flex justify-between border-b pb-2'>
                  <span className='text-gray-600'>Prescription Required</span>
                  <span
                    className={`font-medium ${product.requiresPrescription ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {product.requiresPrescription ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className='flex justify-between border-b pb-2'>
                  <span className='text-gray-600'>Controlled Substance</span>
                  <span
                    className={`font-medium ${product.isControlledSubstance ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {product.isControlledSubstance ? 'Yes' : 'No'}
                  </span>
                </div>
                {product.activeIngredients && (
                  <div className='flex justify-between border-b pb-2'>
                    <span className='text-gray-600'>Active Ingredients</span>
                    <span className='text-gray-900 font-medium text-right max-w-xs'>
                      {product.activeIngredients}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className='mt-16 bg-white rounded-xl shadow-sm p-6 md:p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Customer Reviews
          </h2>

          <div className='flex flex-col md:flex-row gap-8 mb-8'>
            <div className='md:w-1/3 text-center'>
              <div className='text-5xl font-bold text-gray-900 mb-2'>4.8</div>
              <div className='flex justify-center gap-1 text-yellow-500 mb-2'>
                {[...Array(5)].map((_, i) => (
                  <BiStar key={i} size={20} className='fill-current' />
                ))}
              </div>
              <div className='text-gray-600 text-sm'>Based on 42 reviews</div>
            </div>

            <div className='md:w-2/3 space-y-3'>
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className='flex items-center gap-3'>
                  <div className='w-10 text-gray-900 font-medium'>
                    {stars} star
                  </div>
                  <div className='flex-1 bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div
                      className='bg-yellow-500 h-full'
                      style={{ width: `${(stars / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className='w-10 text-gray-600 text-sm'>
                    {((stars / 5) * 42).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className='px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md font-medium transition'>
            Write a Review
          </button>
        </div>

        {/* Related Products */}
        <div className='mt-16'>
          <div className='flex flex-col items-center mb-10'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              You May Also Like
            </h2>
            <div className='w-16 h-1 bg-blue-600 rounded-full'></div>
          </div>

          {products.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {products.map(prod => (
                <ProductCard
                  key={prod._id}
                  product={{
                    ...prod,
                    image: Array.isArray(prod.image)
                      ? prod.image
                      : [prod.image],
                  }}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No related products found
            </div>
          )}

          <div className='text-center mt-10'>
            <Link href='/shop'>
              <button className='px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition'>
                View All Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
