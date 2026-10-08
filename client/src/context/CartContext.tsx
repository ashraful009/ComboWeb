import React, { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';

interface CartItem {
  comboId: number;
  quantity: number;
}

const CartItemSchema = z.object({
  comboId: z.number(),
  quantity: z.number().min(1).max(20),
});

const CartStorageSchema = z.array(CartItemSchema);

interface CartContextType {
  cart: CartItem[];
  addToCart: (comboId: number, quantity: number) => void;
  removeFromCart: (comboId: number) => void;
  setQuantity: (comboId: number, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('freshagro_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        return CartStorageSchema.parse(parsed);
      }
    } catch (e) {
      console.warn('Invalid cart in localStorage, resetting.', e);
    }
    return [];
  });

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('freshagro_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (comboId: number, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.comboId === comboId);
      if (existing) {
        return prev.map(item => 
          item.comboId === comboId 
            ? { ...item, quantity: Math.min(item.quantity + quantity, 20) } 
            : item
        );
      }
      return [...prev, { comboId, quantity }];
    });
    setDrawerOpen(true);
  };

  const removeFromCart = (comboId: number) => {
    setCart(prev => prev.filter(item => item.comboId !== comboId));
  };

  const setQuantity = (comboId: number, quantity: number) => {
    if (quantity < 1) return removeFromCart(comboId);
    if (quantity > 20) quantity = 20;
    
    setCart(prev => prev.map(item => 
      item.comboId === comboId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, setQuantity, clearCart, isDrawerOpen, setDrawerOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
