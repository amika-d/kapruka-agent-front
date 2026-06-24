"use client";

import { useCart } from "../../lib/CartContext";

export default function CartFab() {
  const { itemCount, setIsOpen, isOpen } = useCart();

  if (isOpen) return null; // hide when cart is already open

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-8 right-8 z-30 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary font-bold shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all duration-300"
    >
      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
      {itemCount > 0 ? (
        <>
          <span className="text-[14px]">Cart</span>
          <span className="bg-on-primary text-primary text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        </>
      ) : (
        <span className="text-[14px]">Cart</span>
      )}
    </button>
  );
}
