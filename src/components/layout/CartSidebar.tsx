"use client";

import { useCart } from "../../lib/CartContext";

export default function CartSidebar() {
  const {
    cart,
    isOpen,
    setIsOpen,
    itemCount,
    subtotal,
    total,
    updateQuantity,
    removeFromCart,
    setGiftMessage,
    clearCart,
  } = useCart();

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const handleCheckout = async () => {
    // TODO: wire up real checkout endpoint
    alert("Checkout coming soon!");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed right-0 top-0 h-screen w-[400px] z-50 flex flex-col
          bg-black/60 backdrop-blur-3xl border-l border-white/10
          shadow-2xl shadow-black/60 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
            <h2 className="text-[18px] font-bold text-on-surface">
              Cart
              {itemCount > 0 && (
                <span className="ml-2 text-[13px] font-normal text-on-surface-variant">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[12px] text-error hover:underline transition-all"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
                shopping_cart
              </span>
              <p className="text-on-surface-variant/50 text-[14px]">
                Your cart is empty.<br />Ask Kiyanna to find something!
              </p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 group"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-on-surface truncate">{item.name}</p>
                  <p className="text-primary text-[13px] font-bold mt-0.5">
                    {item.currency} {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">remove</span>
                  </button>
                  <span className="w-6 text-center text-[13px] font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">add</span>
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="w-7 h-7 rounded-lg hover:bg-error/10 flex items-center justify-center transition-all ml-1"
                  >
                    <span className="material-symbols-outlined text-[16px] text-error/70">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gift message */}
        {cart.items.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0">card_giftcard</span>
              <input
                value={cart.giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Add gift message..."
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-on-surface placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>
        )}

        {/* Summary + checkout */}
        {cart.items.length > 0 && (
          <div className="px-4 pb-6 pt-3 border-t border-white/10 space-y-3">
            {/* Breakdown */}
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-on-surface">
                  LKR {subtotal.toLocaleString()}
                </span>
              </div>
              {cart.deliveryCity && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>
                    Delivery to{" "}
                    <span className="text-primary font-semibold">{cart.deliveryCity}</span>
                  </span>
                  <span className="font-semibold text-on-surface">
                    LKR {cart.deliveryFee.toLocaleString()}
                  </span>
                </div>
              )}
              {cart.giftMessage && (
                <div className="flex items-start gap-2 text-on-surface-variant/70">
                  <span className="material-symbols-outlined text-[14px] mt-0.5 text-primary">mail</span>
                  <span className="italic truncate">"{cart.giftMessage}"</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between font-bold text-[15px]">
                <span className="text-on-surface">Total</span>
                <span className="text-primary">LKR {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-[14px] flex items-center justify-center gap-2
                hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              Continue to Checkout
            </button>

            <div className="flex items-center justify-center gap-2 opacity-40">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span className="text-[11px]">Secure payment</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
