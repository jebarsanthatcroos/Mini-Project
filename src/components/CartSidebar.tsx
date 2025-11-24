'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { FaTimes, FaTrash, FaPlus, FaMinus, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';

interface CartItem {
  _id: string;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock?: boolean;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      loadCartItems();
      setIsAnimating(true);
    }
  }, [isOpen]);

  const loadCartItems = () => {
    try {
      const cart = localStorage.getItem('pharmacy-cart');
      const items = cart ? JSON.parse(cart) : [];
      setCartItems(items);
    } catch (error) {
      console.error('Failed to load cart items:', error);
      setCartItems([]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('pharmacy-cart', JSON.stringify(updatedCart));
    
    const event = new CustomEvent('cartUpdated', { detail: updatedCart });
    window.dispatchEvent(event);
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('pharmacy-cart', JSON.stringify(updatedCart));
    
    const event = new CustomEvent('cartUpdated', { detail: updatedCart });
    window.dispatchEvent(event);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('pharmacy-cart');
    
    const event = new CustomEvent('cartUpdated', { detail: [] });
    window.dispatchEvent(event);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    onClose();
    router.push('/Pharmacist/my-cart');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l z-50 flex flex-col transform transition-transform duration-300 ${
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaShoppingBag />
              Shopping Cart ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 px-6">
              <FaShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/60/60';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                    <p className="text-blue-600 font-bold flex items-center text-sm">
                      <MdAttachMoney className="h-3 w-3" />
                      {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t bg-white">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="flex items-center text-blue-600">
                    <MdAttachMoney className="h-5 w-5" />
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FaCreditCard className="h-5 w-5" />
                Proceed to Checkout
              </button>
              
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash className="h-4 w-4" />
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}