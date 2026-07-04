"use client";

interface ProgressStep {
  timestamp: string;
  description: string;
}

interface OrderStatus {
  order_number?: string | null;
  status?: string | null;
  total?: number | null;
  delivery_date?: string | null;
  recipient_name?: string | null;
  address?: string | null;
  greeting?: string | null;
  progress: ProgressStep[];
  error?: boolean;
  error_message?: string;
  currency?: string;
}

interface OrderTimelineProps {
  orderStatus: OrderStatus;
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") return "text-emerald-400";
  if (s === "dispatched" || s === "shipped") return "text-sky-400";
  if (s === "processing" || s === "pending") return "text-amber-400";
  if (s === "cancelled") return "text-error";
  return "text-primary";
}

function statusBg(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-500/10 border-emerald-500/30";
  if (s === "dispatched" || s === "shipped") return "bg-sky-500/10 border-sky-500/30";
  if (s === "processing" || s === "pending") return "bg-amber-500/10 border-amber-500/30";
  if (s === "cancelled") return "bg-error/10 border-error/30";
  return "bg-primary/10 border-primary/30";
}

export default function OrderTimeline({ orderStatus }: OrderTimelineProps) {
  // ── Error state ────────────────────────────────────────────────────────────
  if (orderStatus.error) {
    return (
      <div className="glass-pane p-5 rounded-2xl border border-error/20">
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined text-error mt-0.5 flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <div>
            <p className="font-semibold text-on-surface">Order not found</p>
            <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
              {orderStatus.error_message ||
                "This order may have expired or the number might be incorrect."}
              {" "}Try{" "}
              <span className="text-primary font-mono font-bold">VPAY827982BA</span>{" "}
              to see a completed delivery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Most recent first, cap at 7
  const steps = [...(orderStatus.progress || [])].reverse().slice(0, 7);
  const status = orderStatus.status || "Unknown";
  const currency = orderStatus.currency || "LKR";

  return (
    <div className="glass-pane p-6 rounded-3xl relative overflow-hidden group mt-3">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/8 transition-colors pointer-events-none" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-on-surface-variant/50 font-medium mb-1">
            Order
          </p>
          <h3 className="font-bold text-[20px] text-on-surface font-mono tracking-tight">
            {orderStatus.order_number || "—"}
          </h3>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider flex-shrink-0 ${statusBg(status)}`}>
          <span className={statusColor(status)}>{status}</span>
        </div>
      </div>

      {/* ── Details grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-outline-variant/15 py-5 mb-6">
        {orderStatus.recipient_name && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1">
              Recipient
            </p>
            <p className="text-[14px] font-semibold text-on-surface leading-tight">
              {orderStatus.recipient_name}
            </p>
          </div>
        )}

        {orderStatus.delivery_date && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1">
              Delivery Date
            </p>
            <p className="text-[14px] font-semibold text-on-surface leading-tight">
              {orderStatus.delivery_date}
            </p>
          </div>
        )}

        {orderStatus.total != null && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1">
              Total
            </p>
            <p className="text-[14px] font-bold text-primary">
              {currency} {orderStatus.total.toLocaleString()}
            </p>
          </div>
        )}

        {orderStatus.address && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-1">
              Delivery Address
            </p>
            <p className="text-[13px] text-on-surface-variant leading-snug">
              {orderStatus.address}
            </p>
          </div>
        )}
      </div>

      {/* ── Greeting card ──────────────────────────────────────────────────── */}
      {orderStatus.greeting && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-1.5">
            Gift Message
          </p>
          <p className="text-[14px] text-primary/90 italic leading-relaxed">
            "{orderStatus.greeting}"
          </p>
        </div>
      )}

      {/* ── Timeline ───────────────────────────────────────────────────────── */}
      {steps.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-4">
            Progress
          </p>
          <div className="relative pl-5">
            {/* Vertical line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-outline-variant/20" />

            <div className="flex flex-col gap-5">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[19px] top-[5px] w-2.5 h-2.5 rounded-full transition-all ${
                      i === 0
                        ? "bg-primary shadow-[0_0_8px_2px_rgba(var(--color-primary)/0.4)]"
                        : "bg-outline-variant/40"
                    }`}
                  />
                  <p
                    className={`text-[11px] font-mono font-bold ${
                      i === 0 ? "text-primary" : "text-on-surface-variant/50"
                    }`}
                  >
                    {step.timestamp}
                  </p>
                  <p
                    className={`text-[13px] mt-0.5 leading-snug ${
                      i === 0 ? "text-on-surface" : "text-on-surface-variant/70"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
