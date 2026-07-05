"use client";

import { ChatMessage, ThinkingEvent, ProductCardType } from "../../types/schemas";
import ProductCarousel from "../generative/ProductCarousel";
import OrderTimeline from "../generative/OrderTimeline";
import ThinkingProcess from "./ThinkingProcess";
import { useEffect, useRef } from "react";

interface ChatFeedProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onTryOn?: (product: ProductCardType) => void;
  showTryOnButton?: boolean;
}

export default function ChatFeed({
  messages,
  isStreaming,
  onTryOn,
  showTryOnButton = false,
}: ChatFeedProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp?: string) => {
    if (timestamp) return timestamp;
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };


  return (
    <div className="flex-1 mt-20 pb-48 max-w-5xl mx-auto w-full px-gutter">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-[60vh] opacity-30">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-[64px] text-primary/40">
              auto_awesome
            </span>
            <p className="text-[16px] text-on-surface-variant/40">
              Start a conversation to see the agent in action
            </p>
          </div>
        </div>
      )}

      {messages.map((msg, msgIdx) => (
        <div key={msg.id}>
          {msg.role === "user" ? (
            /* ── User Message ── */
            <div className="flex flex-col gap-2 items-end max-w-[80%] ml-auto my-6">
              <div className="glass-pane p-6 rounded-2xl rounded-tr-none">
                {/* Attached image preview */}
                {msg.imageBase64 && (
                  <div className="mb-3">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-primary/20">
                      <img
                        alt="Attached product"
                        className="w-full h-full object-cover"
                        src={`data:image/jpeg;base64,${msg.imageBase64}`}
                      />
                    </div>
                  </div>
                )}
                {msg.content && (
                  <p className="text-[16px] leading-relaxed text-on-surface whitespace-pre-wrap">
                    {msg.content}
                  </p>
                )}
              </div>
              <span className="text-[10px] leading-none tracking-[0.05em] font-medium text-on-surface-variant/50 self-end">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ) : (
            /* ── Agent Response (clean, no bubble — Claude-style) ── */
            <div className="flex flex-col gap-2 max-w-[90%] my-6">
              {/* Thinking process — stored on each message individually */}
              {(msg.thinking?.length ?? 0) > 0 && (
                <ThinkingProcess
                  events={msg.thinking!}
                  isStreaming={isStreaming && msgIdx === messages.length - 1}
                />
              )}

              {/* Agent text — no box, just clean text */}
              {msg.content && (
                <p className="text-[15px] leading-[1.7] text-on-surface/90 whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}

              {/* Generative UI components */}
              {msg.ui && (
                <div className="mt-3">
                  {msg.ui.component === "ProductCarousel" && msg.content && (
                    <div>
                      <ProductCarousel
                        items={msg.ui.props.items}
                        onTryOn={onTryOn}
                        showTryOnButton={showTryOnButton}
                      />
                      {/* <div className="flex gap-3 mt-5">
                        <button className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-[13px] leading-none tracking-[0.03em] font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                          Purchase via Kiyanna
                        </button>
                        <button className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-on-surface text-[13px] leading-none tracking-[0.03em] font-semibold hover:bg-white/10 transition-all active:scale-95">
                          Add to Collection
                        </button>
                      </div> */}
                    </div>
                  )}

                  {msg.ui.component === "OrderTimeline" && (
                    <OrderTimeline orderStatus={msg.ui.props.orderStatus} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
