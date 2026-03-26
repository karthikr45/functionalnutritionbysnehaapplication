'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  quantity: number;
  stock: number;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, loaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, item.stock);
        return prev.map((i) => i.productId === item.productId ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i));
  };

  const clearCart = () => setItems([]);

  const getCartTotal = () => items.reduce((sum, i) => sum + (i.salePrice || i.price) * i.quantity, 0);

  const getCartCount = () => items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
}
