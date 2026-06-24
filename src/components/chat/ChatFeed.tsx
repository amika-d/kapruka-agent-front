import { ChatMessage, ThinkingEvent } from "@/types/schemas";
import ProductCarousel from "../generative/ProductCarousel";
import ThinkingProcess from "./ThinkingProcess";
import { useEffect, useRef } from "react";

interface ChatFeedProps {
  messages: ChatMessage[];
  thinkingEvents: ThinkingEvent[];
  isStreaming: boolean;
}

export default function ChatFeed({ messages, thinkingEvents, isStreaming }: ChatFeedProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinkingEvents]);

  const formatTime = (timestamp?: string) => {
    if (timestamp) return timestamp;
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Find the index of the last user message to show thinking events after it
  const lastUserMsgIndex = messages.reduce(
    (acc, msg, idx) => (msg.role === "user" ? idx : acc),
    -1
  );

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
                <p className="text-[16px] leading-relaxed text-on-surface whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
              <span className="text-[10px] leading-none tracking-[0.05em] font-medium text-on-surface-variant/50 self-end">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ) : (
            /* ── Agent Response (clean, no bubble — Claude-style) ── */
            <div className="flex flex-col gap-2 max-w-[90%] my-6">
              {/* Show thinking events before the first assistant message after the last user message */}
              {msgIdx === lastUserMsgIndex + 1 &&
                thinkingEvents.length > 0 && (
                  <ThinkingProcess events={thinkingEvents} isStreaming={isStreaming} />
                )}

              {/* Agent text — no box, just clean text */}
              {msg.content && (
                <p className="text-[15px] leading-[1.7] text-on-surface/90 whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}

              {/* Product Carousel — only show after text has started streaming */}
              {msg.content && msg.ui && msg.ui.component === "ProductCarousel" && (
                <div className="mt-4">
                  <ProductCarousel items={msg.ui.props.items} />

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-5">
                    <button className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-[13px] leading-none tracking-[0.03em] font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                      Purchase via Kiyanna
                    </button>
                    <button className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-on-surface text-[13px] leading-none tracking-[0.03em] font-semibold hover:bg-white/10 transition-all active:scale-95">
                      Add to Collection
                    </button>
                  </div>
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
