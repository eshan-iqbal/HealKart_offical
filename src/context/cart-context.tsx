'use client';

import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem {
  id: string; // Typically the product ID
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'meditrack_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cart from server or localStorage on initial render
  useEffect(() => {
    async function fetchCart() {
      if (user) {
        // Logged in: fetch from server
        try {
          const res = await fetch('/api/cart', { credentials: 'include' });
          const data = await res.json();
          if (res.ok && Array.isArray(data.cart)) {
            setItems(data.cart);
          }
        } catch (e) {
          // fallback to empty
          setItems([]);
        }
      } else {
        // Guest: load from localStorage
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          try {
            setItems(JSON.parse(storedCart));
          } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        }
      }
    }
    fetchCart();
  }, [user]);

  // Save cart to server or localStorage whenever items change
  useEffect(() => {
    if (user) {
      // Logged in: sync to server
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cart: items })
      });
    } else {
      // Guest: sync to localStorage
      if (items.length > 0 || localStorage.getItem(CART_STORAGE_KEY)) {
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (e: any) {
          if (e.name === 'QuotaExceededError' || e.code === 22) {
            toast({
              title: 'Cart Too Large',
              description: 'Your cart is too large to save. Please remove some items.',
              variant: 'destructive',
            });
          } else {
            console.error('Error saving cart to localStorage:', e);
          }
        }
      }
    }
  }, [items, user, toast]);

  const getItemQuantity = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const addToCart = (itemToAdd: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + itemToAdd.quantity } : item
        );
      } else {
        // Add new item
        return [...prevItems, itemToAdd];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
     const itemToRemove = items.find(item => item.id === itemId);
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      if (itemToRemove) {
        toast({
          title: "Item Removed",
          description: `${itemToRemove.name} has been removed from your cart.`,
          variant: "destructive" // Use a different variant for removal feedback
        });
      }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item // Ensure quantity doesn't go below 0
      ).filter(item => item.quantity > 0) // Remove item if quantity is 0
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY); // Also clear localStorage
     toast({
      title: "Cart Cleared",
      description: "Your shopping cart is now empty.",
    });
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, getItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
