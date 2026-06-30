"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function formatLKR(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

function useCountdown(targetISO: string | null) {
  const [remaining, setRemaining] = useState<string>("59:59");

  useEffect(() => {
    if (!targetISO) {
      // Default: 60 min from now
      const target = Date.now() + 60 * 60 * 1000;
      const tick = () => {
        const diff = Math.max(0, target - Date.now());
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRemaining(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }

    const target = new Date(targetISO).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  return remaining;
}

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  const orderNumber = params.get("order_number") || "";
  const payLink = params.get("pay_link") || "";
  const total = parseFloat(params.get("total") || "0");
  const expiresAt = params.get("expires_at") || null;

  const countdown = useCountdown(expiresAt);
  const [copied, setCopied] = useState(false);

  function copyOrderNumber() {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const trackUrl = orderNumber
    ? `/?q=track+order+${encodeURIComponent(orderNumber)}`
    : "/";

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center px-6 py-16">
      {/* Glow */}
      <div className="fixed top-[-15%] left-1/2 -translate-x-1/2 w-[50%] h-[40%] bg-primary/10 blur-[150px] rounded-full -z-10 pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Success card */}
        <div className="glass-pane rounded-3xl p-8 flex flex-col items-center gap-5 text-center">
          {/* Checkmark */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>

          <div>
            <h1 className="text-[28px] font-bold text-on-surface">Order Created!</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Your order has been placed successfully on Kapruka.
            </p>
          </div>

          {/* Order number */}
          {orderNumber && (
            <div className="w-full glass-well rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant/60 font-medium">Order Number</p>
                <p className="text-[20px] font-bold text-primary font-mono tracking-tight mt-0.5">{orderNumber}</p>
              </div>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[12px] font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {/* Total */}
          {total > 0 && (
            <div className="text-center">
              <p className="text-[13px] text-on-surface-variant">Grand Total</p>
              <p className="text-[28px] font-bold text-on-surface">{formatLKR(total)}</p>
            </div>
          )}

          {/* Notice */}
          <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 text-left">
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              <span className="text-primary font-semibold">This is a real Kapruka order.</span>{" "}
              Click "Pay Now" to complete payment securely on Kapruka's website. No payment is
              required to test this flow — the order auto-expires if unpaid.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-error/60">timer</span>
            <span className="text-[13px]">
              Expires in{" "}
              <span className="font-mono font-bold text-on-surface">{countdown}</span>
            </span>
          </div>

          {/* Pay Now CTA */}
          {payLink ? (
            <a
              href={payLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-[15px] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              Pay Now on Kapruka →
            </a>
          ) : (
            <div className="w-full py-4 rounded-xl bg-surface-container text-on-surface-variant/60 text-[14px] text-center">
              No payment link returned — order may have been created in demo mode
            </div>
          )}
        </div>

        {/* Secondary actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {orderNumber && (
            <Link
              href={trackUrl}
              className="flex-1 py-3 rounded-xl border border-outline-variant/30 bg-white/5 hover:bg-white/10 text-on-surface text-[14px] font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
              Track this Order
            </Link>
          )}
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl border border-outline-variant/30 bg-white/5 hover:bg-white/10 text-on-surface text-[14px] font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">home</span>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
