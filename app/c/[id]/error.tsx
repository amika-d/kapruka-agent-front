"use client";

import { useEffect } from "react";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the full error to the console so you can see it in Render/Vercel logs
    console.error("ChatPage crashed:", error.message, error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center gap-6 px-8">
      <div className="glass-pane rounded-3xl p-8 max-w-lg w-full flex flex-col items-center gap-4 text-center">
        <span className="material-symbols-outlined text-error text-[48px]">
          error
        </span>
        <h2 className="text-[20px] font-bold text-on-surface">Something went wrong</h2>

        {/* Show the actual error message so you can debug it */}
        <code className="text-[12px] text-error/70 bg-error/5 border border-error/20 rounded-lg px-4 py-3 w-full text-left break-all">
          {error.message || "Unknown error"}
          {error.digest && (
            <span className="block mt-1 text-on-surface-variant/40">
              digest: {error.digest}
            </span>
          )}
        </code>

        <button
          onClick={reset}
          className="mt-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-[14px] hover:opacity-90 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
