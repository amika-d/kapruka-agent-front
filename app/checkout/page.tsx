"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../src/lib/CartContext";
import type { CartItem } from "../../src/lib/CartContext";
import { useChat } from "../../src/lib/chatContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  recipientName: string;
  recipientPhone: string;
  deliveryCityRaw: string;
  deliveryCityResolved: string | null;
  deliveryAddress: string;
  deliveryDate: string;
  giftMessage: string;
  showGiftMessage: boolean;
}

interface CitySearchState {
  results: string[];
  loading: boolean;
  open: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatLKR(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
}) {
  const total = subtotal + deliveryFee;
  return (
    <div className="glass-pane rounded-2xl p-6 flex flex-col gap-5">
      <h2 className="text-[18px] font-semibold text-on-surface">Order Summary</h2>

      <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
        {items.map((item) => (
          <div key={item.product_id} className="flex gap-3 items-start">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 border border-white/5">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-2xl">
                    shopping_bag
                  </span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-on-surface leading-tight line-clamp-2">{item.name}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">Qty: {item.quantity}</p>
            </div>
            <p className="text-[14px] font-semibold text-primary flex-shrink-0">
              {formatLKR(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-2">
        <div className="flex justify-between text-[14px] text-on-surface-variant">
          <span>Subtotal</span>
          <span>{formatLKR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[14px] text-on-surface-variant">
          <span>Delivery</span>
          <span>{deliveryFee > 0 ? formatLKR(deliveryFee) : "Free"}</span>
        </div>
        <div className="flex justify-between text-[16px] font-bold text-on-surface mt-1">
          <span>Total</span>
          <span className="text-primary">{formatLKR(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, total, clearCart } = useCart();
  const { sessionId } = useChat();
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "";

  const [form, setForm] = useState<FormState>({
    recipientName: "",
    recipientPhone: "",
    deliveryCityRaw: "",
    deliveryCityResolved: null,
    deliveryAddress: "",
    deliveryDate: tomorrowISO(),
    giftMessage: "",
    showGiftMessage: false,
  });

  const [citySearch, setCitySearch] = useState<CitySearchState>({
    results: [],
    loading: false,
    open: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cartIssues, setCartIssues] = useState<string[]>([]);
  const [giftSuggesting, setGiftSuggesting] = useState(false);
  const [giftPrompt, setGiftPrompt] = useState("");
  const [showGiftAssist, setShowGiftAssist] = useState(false);

  const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Redirect if cart is empty (unless we just placed an order or are submitting)
  useEffect(() => {
    if (cart.items.length === 0 && !orderPlaced && !submitting) {
      router.replace(sessionId ? `/c/${sessionId}` : "/");
    }
  }, [cart.items.length, router, sessionId, orderPlaced, submitting]);

  // Close city dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCitySearch((s) => ({ ...s, open: false }));
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // City typeahead
  const handleCityInput = useCallback(
    (value: string) => {
      setForm((f) => ({ ...f, deliveryCityRaw: value, deliveryCityResolved: null }));
      setErrors((e) => ({ ...e, city: "" }));

      if (cityDebounce.current) clearTimeout(cityDebounce.current);
      if (value.length < 2) {
        setCitySearch({ results: [], loading: false, open: false });
        return;
      }

      setCitySearch((s) => ({ ...s, loading: true, open: true }));
      cityDebounce.current = setTimeout(async () => {
        try {
          const res = await fetch(`${apiURL}/api/v1/cities?query=${encodeURIComponent(value)}`);
          const data = await res.json();
          setCitySearch({ results: data.cities || [], loading: false, open: true });
        } catch {
          setCitySearch({ results: [], loading: false, open: false });
        }
      }, 350);
    },
    [apiURL]
  );

  function selectCity(city: string) {
    setForm((f) => ({ ...f, deliveryCityRaw: city, deliveryCityResolved: city }));
    setCitySearch({ results: [], loading: false, open: false });
    setErrors((e) => ({ ...e, city: "" }));
  }

  function setField(key: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // AI gift message
  async function handleGiftSuggest() {
    if (!giftPrompt.trim()) return;
    setGiftSuggesting(true);
    try {
      const res = await fetch(`${apiURL}/api/v1/gift-message-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion: "gift", vibe: giftPrompt }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setForm((f) => ({ ...f, giftMessage: data.suggestion }));
        setShowGiftAssist(false);
        setGiftPrompt("");
      }
    } catch {
      // silent
    }
    setGiftSuggesting(false);
  }

  // Validation
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.recipientName.trim()) e.recipientName = "Recipient name is required";
    if (!form.recipientPhone.trim()) e.recipientPhone = "Phone number is required";
    if (!form.deliveryCityResolved) e.city = "Please select a city from the dropdown";
    if (!form.deliveryDate) e.date = "Delivery date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const validationErrors: Record<string, string> = {};

    if (!form.recipientPhone || form.recipientPhone.length < 7) {
      validationErrors.recipientPhone = "Please enter a valid phone number (at least 7 digits)";
    }

    if (!form.deliveryAddress || form.deliveryAddress.trim().length < 3) {
      validationErrors.deliveryAddress = "Please enter a delivery address";
    }

    if (!form.recipientName || form.recipientName.trim().length < 2) {
      validationErrors.recipientName = "Please enter recipient name";
    }

    if (!form.deliveryCityResolved) {
      validationErrors.deliveryCity = "Please select a valid city from the dropdown";
    }

    if (!form.deliveryDate) {
      validationErrors.deliveryDate = "Please select a delivery date";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setCartIssues([]);

    try {
      const res = await fetch(`${apiURL}/api/v1/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image_url: i.image_url,
          })),
          recipient_name: form.recipientName,
          recipient_phone: form.recipientPhone,
          delivery_city: form.deliveryCityResolved,
          delivery_address: form.deliveryAddress,
          delivery_date: form.deliveryDate,
          gift_message: form.giftMessage || null,
          session_id: sessionId || "checkout-page",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        const detail = errData.detail;
        if (typeof detail === "object" && detail.issues) {
          setCartIssues(detail.issues);
        } else {
          setErrors({ submit: typeof detail === "string" ? detail : "Checkout failed. Please try again." });
        }
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      console.log("CHECKOUT RESPONSE:", JSON.stringify(data));
      setOrderPlaced(true);

      // Clear cart and navigate to success
      clearCart();
      const params = new URLSearchParams({
        order_number: data.order_number || "",
        pay_link: data.pay_link || "",
        total: String(data.total || subtotal),
        expires_at: data.expires_at || "",
      });
      console.log("PARAMS:", params.toString());
      router.push(`/checkout/success?${params.toString()}`);
    } catch {
      setErrors({ submit: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0) return null;

  const isFormValid =
    form.recipientName.trim() &&
    form.recipientPhone.trim() &&
    form.deliveryCityResolved &&
    form.deliveryDate;

  return (
    <div className="w-full flex-1 h-screen overflow-y-auto bg-background text-on-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 z-40 flex items-center px-8 gap-4 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <Link
          href={sessionId ? `/c/${sessionId}` : "/"}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="text-[14px]">Back to Chat</span>
        </Link>
        <div className="w-px h-5 bg-outline-variant/30" />
        <h1 className="text-[18px] font-semibold text-on-surface">Checkout</h1>
        <div className="ml-auto flex items-center gap-2 text-[13px] text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          Secure checkout via Kapruka
        </div>
      </header>

      <div className="pt-24 pb-16 px-8 max-w-6xl mx-auto">
        {/* Cart issues banner */}
        {cartIssues.length > 0 && (
          <div className="mb-6 glass-pane border border-error/30 rounded-2xl p-4 flex gap-3 items-start">
            <span className="material-symbols-outlined text-error mt-0.5">warning</span>
            <div>
              <p className="text-[14px] font-semibold text-error mb-1">Some items had issues</p>
              {cartIssues.map((issue, i) => (
                <p key={i} className="text-[13px] text-on-surface-variant">{issue}</p>
              ))}
              <button
                onClick={() => setCartIssues([])}
                className="mt-2 text-[12px] text-primary hover:underline"
              >
                Dismiss and retry with remaining items
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT — Order Summary */}
            <div className="lg:col-span-2">
              <OrderSummary
                items={cart.items}
                subtotal={subtotal}
                deliveryFee={cart.deliveryFee}
              />
            </div>

            {/* RIGHT — Delivery Form */}
            <div className="lg:col-span-3 glass-pane rounded-2xl p-6 flex flex-col gap-5">
              <h2 className="text-[18px] font-semibold text-on-surface">Delivery Details</h2>

              {/* Recipient Name */}
              <Field label="Recipient Name" error={errors.recipientName}>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(e) => setField("recipientName", e.target.value)}
                  placeholder="Full name of the recipient"
                  className={inputCls(!!errors.recipientName)}
                />
              </Field>

              {/* Recipient Phone */}
              <Field label="Recipient Phone" error={errors.recipientPhone}>
                <input
                  type="tel"
                  value={form.recipientPhone}
                  onChange={(e) => setField("recipientPhone", e.target.value)}
                  placeholder="077 123 4567"
                  className={inputCls(!!errors.recipientPhone)}
                />
              </Field>

              {/* Delivery City — typeahead */}
              <Field label="Delivery City" error={errors.city}>
                <div className="relative" ref={cityDropdownRef}>
                  <input
                    type="text"
                    value={form.deliveryCityRaw}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => {
                      if (citySearch.results.length > 0)
                        setCitySearch((s) => ({ ...s, open: true }));
                    }}
                    placeholder="Type a city (e.g. Colombo, Kandy...)"
                    autoComplete="off"
                    className={inputCls(!!errors.city) + " pr-10"}
                  />
                  {/* Resolved indicator */}
                  {form.deliveryCityResolved && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500 text-[18px]">
                      check_circle
                    </span>
                  )}
                  {citySearch.loading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  )}

                  {/* Dropdown */}
                  {citySearch.open && citySearch.results.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-surface-container border border-outline-variant/30 rounded-xl overflow-hidden shadow-2xl">
                      {citySearch.results.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="w-full text-left px-4 py-2.5 text-[14px] text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                  {citySearch.open && !citySearch.loading && citySearch.results.length === 0 && form.deliveryCityRaw.length >= 2 && (
                    <div className="absolute z-50 mt-1 w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-[13px] text-on-surface-variant">
                      No cities found. Try a different spelling.
                    </div>
                  )}
                </div>
              </Field>

              {/* Delivery Address */}
              <Field label="Delivery Address" hint="Optional — include house no, street, area">
                <textarea
                  value={form.deliveryAddress}
                  onChange={(e) => setField("deliveryAddress", e.target.value)}
                  placeholder="No. 10, Galle Road, Colombo 03"
                  rows={2}
                  className={inputCls(false) + " resize-none"}
                />
              </Field>

              {/* Delivery Date */}
              <Field label="Delivery Date" error={errors.date}>
                <input
                  type="date"
                  value={form.deliveryDate}
                  min={tomorrowISO()}
                  onChange={(e) => setField("deliveryDate", e.target.value)}
                  className={inputCls(!!errors.date) + " [color-scheme:dark]"}
                />
              </Field>

              {/* Gift Message */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setField("showGiftMessage", !form.showGiftMessage)}
                  className="flex items-center gap-2 text-[13px] text-primary hover:text-primary/80 transition-colors w-fit"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {form.showGiftMessage ? "expand_less" : "card_giftcard"}
                  </span>
                  {form.showGiftMessage ? "Hide gift message" : "Add a gift message"}
                </button>

                {form.showGiftMessage && (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <textarea
                        value={form.giftMessage}
                        onChange={(e) => setField("giftMessage", e.target.value)}
                        placeholder="Write a personal message for the recipient..."
                        rows={3}
                        className={inputCls(false) + " resize-none pr-32"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowGiftAssist((v) => !v)}
                        className="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[12px] font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        AI Help
                      </button>
                    </div>

                    {/* Gift AI assist panel */}
                    {showGiftAssist && (
                      <div className="flex gap-2 items-center glass-well rounded-xl p-3">
                        <input
                          type="text"
                          value={giftPrompt}
                          onChange={(e) => setGiftPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleGiftSuggest()}
                          placeholder="What's the occasion or vibe? (e.g. birthday, sorry, get well)"
                          className="flex-1 bg-transparent text-[13px] text-on-surface outline-none placeholder:text-on-surface-variant/40"
                        />
                        <button
                          type="button"
                          onClick={handleGiftSuggest}
                          disabled={giftSuggesting || !giftPrompt.trim()}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[12px] font-semibold disabled:opacity-40 transition-opacity"
                        >
                          {giftSuggesting ? "..." : "Generate"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit error */}
              {errors.submit && (
                <p className="text-[13px] text-error">{errors.submit}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isFormValid || submitting || orderPlaced}
                className="mt-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-[15px] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {orderPlaced ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] text-emerald-300">check_circle</span>
                    Order Placed! Redirecting...
                  </>
                ) : submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                    Place Order
                  </>
                )}
              </button>

              <p className="text-center text-[12px] text-on-surface-variant/40">
                No payment is charged now — you'll be redirected to Kapruka's secure payment page.
                Order link expires in 60 minutes.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Atmospheric blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[35%] h-[35%] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[10%] w-[25%] h-[25%] bg-secondary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-on-surface-variant">{label}</label>
      {children}
      {error && <p className="text-[12px] text-error">{error}</p>}
      {hint && !error && <p className="text-[12px] text-on-surface-variant/50">{hint}</p>}
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full glass-well rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 transition-all ${hasError
    ? "ring-1 ring-error/60 focus:ring-error"
    : "focus:ring-primary/50"
  }`;
