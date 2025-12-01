'use client';
import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[];
  totalPrice: number;
  currency: string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (_id: string) => void;
  clearCart: () => void;
  updateQuantity: (_id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const currency = 'LKR';
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (_id: string) => {
    setCart(prev => prev.filter(item => item._id !== _id));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (_id: string, quantity: number) => {
    setCart(prev =>
      prev.map(item => (item._id === _id ? { ...item, quantity } : item))
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        totalPrice,
        currency,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
