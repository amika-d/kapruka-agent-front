"use client";

import { useRef, useState } from "react";

export default function ChatInput({
  onSendMessage,
  disabled,
  isStreaming,
  onAbort,
  variant = "fixed",
}: {
  onSendMessage: (msg: string, imageBase64?: string) => void;
  disabled: boolean;
  isStreaming?: boolean;
  onAbort?: () => void;
  variant?: "fixed" | "inline";
}) {
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip "data:image/jpeg;base64,"
      };
      reader.readAsDataURL(file);
    });

    setPendingImage(base64);
    setImageLoading(false);
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if ((input.trim() || pendingImage) && !disabled) {
      onSendMessage(input.trim(), pendingImage ?? undefined);
      setInput("");
      setPendingImage(null);
    }
  };

  const canSend = (input.trim().length > 0 || !!pendingImage) && !disabled;

  return (
    <footer className={variant === "fixed"
      ? "fixed bottom-0 left-72 right-0 px-container-padding-desktop bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-10 z-50"
      : "relative w-full max-w-3xl mx-auto"
    }>
      <div className="max-w-4xl mx-auto relative group">
        {/* Gradient glow behind input */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>

        <div className="relative bg-surface-container-high rounded-full border border-white/10 backdrop-blur-md overflow-hidden">

          {/* Image Preview Row — Claude-style, above the text input */}
          {pendingImage && (
            <div className="px-6 pt-4 pb-2">
              <div className="relative group/preview inline-block">
                {/* Thumbnail with glass styling */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-primary/30 shadow-lg shadow-primary/5">
                  <img
                    alt="Uploaded product"
                    className="w-full h-full object-cover"
                    src={`data:image/jpeg;base64,${pendingImage}`}
                  />
                  {/* Scanning overlay animation */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                      className="w-full h-1 bg-primary/60 blur-[2px] absolute top-0"
                      style={{ animation: "image-scan 2s infinite ease-in-out" }}
                    ></div>
                  </div>
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                  {/* File type badge */}
                  <div className="absolute bottom-1 left-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      IMG
                    </span>
                  </div>
                </div>

                {/* Remove button — visible on hover */}
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full border border-white/10 bg-surface-container-highest/90 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:bg-red-500/80 hover:text-white hover:border-red-500/50 transition-all duration-200 shadow-lg opacity-0 group-hover/preview:opacity-100"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                </button>
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center px-6 py-4">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || imageLoading}
              className="text-on-surface-variant/40 hover:text-primary transition-colors mr-4 disabled:opacity-30"
              title="Upload an image"
            >
              <span className="material-symbols-outlined">
                {imageLoading ? "hourglass_top" : pendingImage ? "check_circle" : "add_photo_alternate"}
              </span>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Text input */}
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/30 text-[16px] leading-relaxed"
              placeholder={
                disabled
                  ? "Agent is thinking..."
                  : pendingImage
                    ? "Describe what you're looking for…"
                    : "Ask Kiyanna anything..."
              }
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={disabled}
            />

            {/* Action buttons */}
            <div className="flex items-center gap-3 ml-4">
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  mic
                </span>
              </button>
              {isStreaming && onAbort ? (
                <button
                  onClick={onAbort}
                  className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  title="Stop generation"
                >
                  <span className="material-symbols-outlined text-xl">stop</span>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="material-symbols-outlined text-xl">arrow_upward</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scanning animation keyframes */}
      <style jsx>{`
        @keyframes image-scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(76px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </footer>
  );
}
