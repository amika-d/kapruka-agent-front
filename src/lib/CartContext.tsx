"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ProductCardType } from "../types/schemas";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem extends ProductCardType {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  deliveryCity: string | null;
  deliveryFee: number;
  giftMessage: string;
}

interface CartContextValue {
  cart: CartState;
  addToCart: (product: ProductCardType) => void;
  removeFromCart: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  setDelivery: (city: string, fee: number) => void;
  setGiftMessage: (msg: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  total: number;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "kiyanna_cart";

const defaultCart: CartState = {
  items: [],
  deliveryCity: null,
  deliveryFee: 0,
  giftMessage: "",
};

function loadCart(): CartState {
  if (typeof window === "undefined") return defaultCart;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultCart;
  } catch {
    return defaultCart;
  }
}

function saveCart(state: CartState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCartState] = useState<CartState>(defaultCart);
  const [isOpen, setIsOpen] = useState(false);

  // Load from sessionStorage once on mount
  useEffect(() => {
    setCartState(loadCart());
  }, []);

  const setCart = useCallback((updater: (prev: CartState) => CartState) => {
    setCartState((prev) => {
      const next = updater(prev);
      saveCart(next);
      return next;
    });
  }, []);

  const addToCart = useCallback((product: ProductCardType) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.product_id === product.product_id);
      const items = existing
        ? prev.items.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
        : [...prev.items, { ...product, quantity: 1 }];
      return { ...prev, items };
    });
    setIsOpen(true); // auto-open sidebar on add
  }, [setCart]);

  const removeFromCart = useCallback((product_id: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.product_id !== product_id),
    }));
  }, [setCart]);

  const updateQuantity = useCallback((product_id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.product_id === product_id ? { ...i, quantity } : i
      ),
    }));
  }, [setCart]);

  const setDelivery = useCallback((city: string, fee: number) => {
    setCart((prev) => ({ ...prev, deliveryCity: city, deliveryFee: fee }));
  }, [setCart]);

  const setGiftMessage = useCallback((msg: string) => {
    setCart((prev) => ({ ...prev, giftMessage: msg }));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart(() => defaultCart);
  }, [setCart]);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + cart.deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setDelivery,
        setGiftMessage,
        clearCart,
        isOpen,
        setIsOpen,
        itemCount,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
