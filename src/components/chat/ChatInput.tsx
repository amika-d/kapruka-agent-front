"use client";

import { useState } from "react";

export default function ChatInput({
  onSendMessage,
  disabled,
}: {
  onSendMessage: (msg: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <footer className="fixed bottom-0 left-72 right-0 px-container-padding-desktop bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-8 z-50">
      <div className="max-w-4xl mx-auto relative group">
        {/* Gradient glow behind input */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>

        <div className="relative bg-surface-container-high rounded-2xl flex items-center px-6 py-4 border border-white/10 backdrop-blur-md">
          {/* Attachment */}
          <button className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors mr-4">
            <span className="material-symbols-outlined">attachment</span>
          </button>

          {/* Input */}
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/30 text-[16px] leading-relaxed"
            placeholder={
              disabled
                ? "Agent is thinking..."
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
            <button
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
