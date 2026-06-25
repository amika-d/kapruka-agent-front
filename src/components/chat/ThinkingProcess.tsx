"use client";

import { useState, useEffect } from "react";
import { ThinkingEvent } from "../../types/schemas";

interface ThinkingProcessProps {
  events: ThinkingEvent[];
  isStreaming: boolean;
}

export default function ThinkingProcess({ events, isStreaming }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  if (events.length === 0 && !isStreaming) return null;

  const allDone = events.length > 0 && events.every((e) => e.status === "done");
  const isThinking = isStreaming && !allDone;

  // Timer for "Thinking for Xs"
  useEffect(() => {
    if (!isThinking) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isThinking]);

  const getStepIcon = (event: ThinkingEvent) => {
    if (event.icon) return event.icon;
    const step = event.step.toLowerCase();
    if (step.includes("rout")) return "route";
    if (step.includes("search") || step.includes("kapruka_search")) return "travel_explore";
    if (step.includes("product") || step.includes("kapruka_get")) return "shopping_bag";
    if (step.includes("delivery") || step.includes("kapruka_check")) return "local_shipping";
    if (step.includes("reflect")) return "analytics";
    if (step.includes("format")) return "auto_awesome";
    if (step.includes("memory") || step.includes("context")) return "psychology";
    return "neurology";
  };

  return (
    <div className="my-3">
      {/* Toggle button — small, inline, Claude-style */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-on-surface-variant/50 hover:text-on-surface-variant/80 transition-colors group"
      >
        {/* Sparkle / brain icon */}
        <span className="material-symbols-outlined text-[16px] text-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>
          neurology
        </span>

        {/* Label */}
        <span className="text-[13px]">
          {isThinking ? (
            <>
              Thinking
              {elapsed > 0 && <span className="text-on-surface-variant/30"> · {elapsed}s</span>}
              <span className="inline-flex ml-1 gap-[2px]">
                <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "0.15s" }} />
                <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "0.3s" }} />
              </span>
            </>
          ) : (
            <>Thought for {events.length} step{events.length !== 1 ? "s" : ""}</>
          )}
        </span>

        {/* Chevron */}
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant/30 group-hover:text-on-surface-variant/60 transition-transform" style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}>
          expand_more
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-2 ml-[2px] pl-5 border-l border-white/[0.06]">
          <div className="space-y-1">
            {events.map((event, idx) => {
              const isDone = event.status === "done";
              const isRunning = event.status === "running";
              const isError = event.status === "error";

              return (
                <div key={idx} className="flex items-start gap-2 py-[3px]">
                  {/* Status indicator */}
                  <span
                    className={`text-[12px] mt-[2px] shrink-0 ${isDone
                        ? "text-emerald-500/70"
                        : isRunning
                          ? "text-primary/70"
                          : isError
                            ? "text-red-400/70"
                            : "text-on-surface-variant/20"
                      }`}
                  >
                    {isDone ? "✓" : isRunning ? "⟳" : isError ? "✗" : "○"}
                  </span>

                  {/* Step icon */}
                  <span
                    className={`material-symbols-outlined text-[13px] mt-[1px] shrink-0 ${isRunning ? "text-on-surface-variant/50" : "text-on-surface-variant/25"
                      }`}
                  >
                    {getStepIcon(event)}
                  </span>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-[13px] ${isRunning ? "text-on-surface-variant/70" : "text-on-surface-variant/40"
                        }`}
                    >
                      <span className="font-medium">{event.step}</span>
                      {event.detail && (
                        <span className="ml-1 font-normal">— {event.detail}</span>
                      )}
                      {event.duration && (
                        <span className="ml-1.5 text-[11px] text-on-surface-variant/20 font-mono">
                          {event.duration}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Active streaming dots */}
            {isThinking && (
              <div className="flex items-center gap-2 py-[3px] pl-[3px]">
                <span className="text-[12px] text-on-surface-variant/15">○</span>
                <div className="flex gap-[3px]">
                  <div className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <div className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
