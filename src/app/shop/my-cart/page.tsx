'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BiArrowBack,
  BiTrash,
  BiShoppingBag,
  BiCheckCircle,
  BiMap,
  BiHome,
  BiBuilding,
  BiCurrentLocation,
  BiPhone,
  BiEnvelope,
  BiUser,
} from 'react-icons/bi';
import { motion } from 'framer-motion';
import useCart from '@/context/CartContext';
import Image from 'next/image';

export default function MyCartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    cart: cartItems,
    totalPrice,
    currency,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Shipping address form
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    instructions: '',
  });

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!shippingAddress.name.trim()) {
        throw new Error('Please enter your name');
      }
      if (!shippingAddress.email.trim()) {
        throw new Error('Please enter your email');
      }
      if (!shippingAddress.phone.trim()) {
        throw new Error('Please enter your phone number');
      }
      if (!shippingAddress.address.trim()) {
        throw new Error('Please enter your address');
      }
      if (!shippingAddress.city.trim()) {
        throw new Error('Please enter your city');
      }
      if (!shippingAddress.postalCode.trim()) {
        throw new Error('Please enter your postal code');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const checkoutData = {
        items: cartItems.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: total,
        paymentMethod: 'cash',
        shippingAddress: shippingAddress,
      };

      console.log('Sending checkout data:', checkoutData);

      const response = await fetch(`${apiUrl}/api/check_out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      console.log('Checkout response:', data);

      // Clear cart and show success
      clearCart();
      setCheckoutSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/shop/order-placed');
      }, 3000);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  if (checkoutSuccess) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center'
        >
          <BiCheckCircle className='text-green-500 text-6xl mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Order Confirmed!
          </h1>
          <p className='text-gray-600 mb-6'>
            Thank you for your purchase. Redirecting...
          </p>
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600'></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='flex items-center mb-8'>
          <Link
            href='/shop'
            className='flex items-center text-gray-600 hover:text-orange-600 transition'
          >
            <BiArrowBack className='mr-2' size={20} />
            Back to Shop
          </Link>
          <h1 className='text-3xl font-bold text-gray-900 ml-4'>
            My Cart ({cartItems.length})
          </h1>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className='bg-white rounded-xl shadow-sm p-8 text-center'>
            <BiShoppingBag className='text-gray-400 text-5xl mx-auto mb-4' />
            <h2 className='text-2xl font-medium text-gray-900 mb-2'>
              Your cart is empty
            </h2>
            <p className='text-gray-600 mb-6'>
              Looks like you haven&apos;t added any items yet.
            </p>
            <Link
              href='/shop'
              className='inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium'
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Cart Items */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                <div className='divide-y divide-gray-200'>
                  {cartItems.map(item => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex items-center gap-6 p-6'
                    >
                      <div className='relative w-24 h-24'>
                        <Image
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.name}
                          fill
                          className='object-contain rounded-lg'
                          sizes='96px'
                        />
                      </div>
                      <div className='flex-1'>
                        <div className='flex justify-between'>
                          <Link
                            href={`/shop/pharmacy/${item._id}`}
                            className='text-lg font-medium text-gray-900 hover:text-orange-600'
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className='text-gray-400 hover:text-red-500'
                            aria-label='Remove item'
                          >
                            <BiTrash size={20} />
                          </button>
                        </div>
                        <p className='text-orange-600 font-medium mt-1'>
                          {currency} {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <div className='mt-4 flex items-center'>
                          <div className='flex items-center border rounded-md overflow-hidden'>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity - 1
                                )
                              }
                              className='px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50'
                              disabled={item.quantity <= 1}
                              aria-label='Decrease quantity'
                            >
                              -
                            </button>
                            <span className='px-4 py-1 bg-white w-12 text-center'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              className='px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700'
                              aria-label='Increase quantity'
                            >
                              +
                            </button>
                          </div>
                          <p className='ml-4 text-gray-600'>
                            {currency} {item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary & Shipping Form */}
            <div>
              <div className='bg-white rounded-xl shadow-sm p-6 sticky top-6'>
                <h2 className='text-lg font-medium text-gray-900 mb-4'>
                  Order Summary
                </h2>
                <div className='space-y-4 mb-6'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='text-gray-900'>
                      {currency} {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Shipping</span>
                    <span className='text-gray-900'>
                      {currency} {shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Tax</span>
                    <span className='text-gray-900'>
                      {currency} {tax.toFixed(2)}
                    </span>
                  </div>
                  <div className='border-t border-gray-200 pt-4 flex justify-between'>
                    <span className='font-medium text-gray-900'>Total</span>
                    <span className='font-medium text-orange-600'>
                      {currency} {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Shipping Information Form */}
                <h3 className='text-md font-medium text-gray-900 mb-4'>
                  Shipping Information
                </h3>
                <div className='space-y-3'>
                  {/* Name */}
                  <div className='relative'>
                    <BiUser className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className='pl-10 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full'
                      type='text'
                      placeholder='Full Name *'
                      value={shippingAddress.name}
                      onChange={e =>
                        setShippingAddress({
                          ...shippingAddress,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Email */}
                  <div className='relative'>
                    <BiEnvelope className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className='pl-10 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full'
                      type='email'
                      placeholder='Email *'
                      value={shippingAddress.email}
                      onChange={e =>
                        setShippingAddress({
                          ...shippingAddress,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Phone */}
                  <div className='relative'>
                    <BiPhone className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className='pl-10 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full'
                      type='tel'
                      placeholder='Phone Number *'
                      value={shippingAddress.phone}
                      onChange={e =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Address */}
                  <div className='relative'>
                    <BiHome className='absolute left-3 top-3 text-gray-400' />
                    <textarea
                      className='pl-10 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full resize-none'
                      rows={3}
                      placeholder='Street Address *'
                      value={shippingAddress.address}
                      onChange={e =>
                        setShippingAddress({
                          ...shippingAddress,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* City & Postal Code */}
                  <div className='flex gap-3'>
                    <div className='relative flex-1'>
                      <BiBuilding className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        className='pl-10 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full'
                        type='text'
                        placeholder='City *'
                        value={shippingAddress.city}
                        onChange={e =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className='relative flex-1'>
                      <BiMap className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        className='pl-10 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full'
                        type='text'
                        placeholder='Postal Code *'
                        value={shippingAddress.postalCode}
                        onChange={e =>
                          setShippingAddress({
                            ...shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <textarea
                    className='px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 transition w-full resize-none'
                    rows={2}
                    placeholder='Delivery Instructions (Optional)'
                    value={shippingAddress.instructions}
                    onChange={e =>
                      setShippingAddress({
                        ...shippingAddress,
                        instructions: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Checkout Button */}
                <motion.button
                  type='button'
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className={`mt-6 w-full ${
                    loading || cartItems.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } text-white py-3 px-4 rounded-lg transition font-medium flex items-center justify-center gap-2`}
                  whileHover={loading ? {} : { scale: 1.02 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </motion.button>

                <div className='mt-6 flex justify-center'>
                  <BiCurrentLocation className='text-orange-600 text-5xl' />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
