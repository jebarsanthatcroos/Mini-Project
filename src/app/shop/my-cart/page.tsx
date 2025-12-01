'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BiArrowBack,
  BiTrash,
  BiShoppingBag,
  BiCheckCircle,
  BiMap,
  BiHome,
  BiBuilding,
  BiCurrentLocation,
} from 'react-icons/bi';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import useCart from '@/context/CartContext';
import Image from 'next/image';

export default function MyCartPage() {
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  type Address = {
    pincode: string;
    area: string;
    city: string;
    state: string;
  };

  const [address, setAddress] = useState<Address>({
    pincode: '',
    area: '',
    city: '',
    state: '',
  });

  const [error, setError] = useState<string | null>(null);
  const {
    cart: cartItems,
    totalPrice,
    currency,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/allproduct`);

        if (!response.ok) throw new Error('Failed to fetch cart');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      setLoading(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/allproduct/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      updateQuantity(productId, newQuantity);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update quantity'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setLoading(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/allproduct/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      removeFromCart(productId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/check_out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          total: totalPrice,
          address,
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');

      setCheckoutSuccess(true);
      clearCart();
      setAddress({
        pincode: '',
        area: '',
        city: '',
        state: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  if (loading) return <Loading />;
  if (error) return <ErrorComponent message={error} />;

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
          <p className='text-gray-600 mb-6'>Thank you for your purchase.</p>
          <Link
            href='/shop'
            className='inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium'
          >
            Continue Shopping
          </Link>
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
                      <Image
                        src={item.image}
                        alt={item.name}
                        className='w-24 h-24 object-contain rounded-lg'
                        width={96}
                        height={96}
                        unoptimized
                      />
                      <div className='flex-1'>
                        <div className='flex justify-between'>
                          <Link
                            href={`/products/${item._id}`}
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
                              className='px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700'
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

            <div>
              <div className='bg-white rounded-xl shadow-sm p-6 sticky top-6'>
                <h2 className='text-lg font-medium text-gray-900 mb-4'>
                  Order Summary
                </h2>
                <div className='space-y-4'>
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

                <div className='mb-4 mt-6'>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className='relative'
                  >
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                      <BiMap />
                    </span>
                    <input
                      className='pl-10 px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500'
                      type='text'
                      placeholder='Pin code'
                      onChange={e =>
                        setAddress({ ...address, pincode: e.target.value })
                      }
                      value={address.pincode}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                    className='relative'
                  >
                    <span className='absolute left-3 top-4 text-gray-400'>
                      <BiHome />
                    </span>
                    <textarea
                      className='pl-10 px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none'
                      rows={4}
                      placeholder='Address (Area and Street)'
                      onChange={e =>
                        setAddress({ ...address, area: e.target.value })
                      }
                      value={address.area}
                    ></textarea>
                  </motion.div>
                  <div className='flex space-x-3'>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className='relative w-1/2'
                    >
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                        <BiBuilding />
                      </span>
                      <input
                        className='pl-10 px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500'
                        type='text'
                        placeholder='City/District/Town'
                        onChange={e =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        value={address.city}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 }}
                      className='relative w-1/2'
                    >
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                        <BiMap />
                      </span>
                      <input
                        className='pl-10 px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500'
                        type='text'
                        placeholder='State'
                        onChange={e =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        value={address.state}
                      />
                    </motion.div>
                  </div>
                </div>
                <motion.button
                  type='button'
                  onClick={handleCheckout}
                  disabled={
                    loading ||
                    cartItems.length === 0 ||
                    !address.pincode.trim() ||
                    !address.area.trim() ||
                    !address.city.trim() ||
                    !address.state.trim()
                  }
                  className={`mt-2 w-full ${
                    loading ||
                    cartItems.length === 0 ||
                    !address.pincode.trim() ||
                    !address.area.trim() ||
                    !address.city.trim() ||
                    !address.state.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } text-white py-3 px-4 rounded-md transition font-medium`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </motion.button>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className='md:mr-16 mt-8 flex justify-center items-center text-orange-600 text-6xl'
                >
                  <BiCurrentLocation />
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
