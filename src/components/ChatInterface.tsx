"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, ThinkingEvent } from "../types/schemas";
import ChatFeed from "./chat/ChatFeed";
import ChatInput from "./chat/ChatInput";
import { useCart } from "../lib/CartContext";

interface ChatInterfaceProps {
  chatId: string;
  initialQuery?: string;
}

export default function ChatInterface({ chatId, initialQuery }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [events, setEvents] = useState<ThinkingEvent[]>([]);
  const [sessionId] = useState(() => chatId || crypto.randomUUID());
  const [history, setHistory] = useState([]);
  const { cart, itemCount, setIsOpen: openCart } = useCart();

  const hasSentInitialQuery = useRef(false);
  const historyLoaded = useRef(false);

  // Load existing session history when visiting /c/[id]
  useEffect(() => {
    if (historyLoaded.current || !chatId) return;
    historyLoaded.current = true;

    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${apiURL}/api/v1/sessions/${chatId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.messages?.length) {
          const loaded: ChatMessage[] = data.messages.map(
            (m: { role: string; content: string }, i: number) => ({
              id: `loaded-${i}`,
              role: m.role as "user" | "assistant",
              content: m.content,
            })
          );
          setMessages(loaded);
        }
      })
      .catch(() => {});
  }, [chatId]);

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = { id: userMsgId, role: "user", content: text };

    const agentMsgId = (Date.now() + 1).toString();
    const agentMsg: ChatMessage = { id: agentMsgId, role: "assistant", content: "" };
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";

    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setEvents([]); // Clear previous thinking events
    setIsStreaming(true);

    try {
      const res = await fetch(`${apiURL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          history: history,
          cart: cart.items
        }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");

          buffer = parts.pop() || "";

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const dataStr = trimmed.slice(6).trim();

            if (dataStr === "[DONE]") {
              setIsStreaming(false);
              break;
            }

            try {
              const data = JSON.parse(dataStr);

              if (data.type === "text") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMsgId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              } else if (data.type === "ui") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMsgId
                      ? { ...msg, ui: { component: data.component, props: data.props } }
                      : msg
                  )
                );
              } else if (data.type === "thinking") {
                setEvents((prev) => [...prev, data.payload]);
              }
            } catch (e) {
              console.error("Failed to parse SSE JSON:", dataStr);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (initialQuery && !hasSentInitialQuery.current) {
      hasSentInitialQuery.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  return (
    <>
      <main className="ml-72 flex-1 flex flex-col h-screen relative overflow-y-auto no-scrollbar scroll-smooth bg-transparent">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-72 h-20 flex justify-between items-center px-container-padding-desktop z-40 bg-transparent">
          <div className="flex items-center gap-4">
            <span className="text-[24px] leading-[1.3] font-medium text-primary">
              Chat Console
            </span>
            {/* {isStreaming && (
              <div className="px-3 py-1 rounded-full border border-primary/30 bg-primary/5">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest text-primary"
                  style={{ animation: "shimmer 2s infinite ease-in-out" }}
                >
                  Agent Reasoning Active
                </span>
              </div>
            )} */}
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              notifications
            </span>

            {/* Cart button with badge */}
            <button
              onClick={() => openCart(true)}
              className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 flex items-center justify-center transition-all duration-300"
              aria-label="Open cart"
            >
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">
                shopping_cart
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-black flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <div className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo4F-aHpDD-1ShNjtf3GJjKRDhmsV8cYXZGqkcWsa-Ce3wcsqG6QtXOv0L668MDXmAt4-PrOMl3wmnRMwy3Ruw095Y1CIgcqzBmIs7-RXF4sQHmVA6ZtAp2i0A9089eP-WVgzDs9m9qH3ftQFGm5M_g6t5_pLTbQ8Kin8I17s_WWsUQAP6rLWzYfiL-6Vc0CuPeUUNg837UBHEeZHWnhqjcnl6-LXzkqM-fVXv7qNH_Cs1PFzd7Fnj4lwh_6CdB2QPj7B3MEz5uMA"
              />
            </div>
          </div>
        </header>

        <ChatFeed
          messages={messages}
          thinkingEvents={events}
          isStreaming={isStreaming}
        />
        <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />

        {/* Background Atmospheric Elements */}
        <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-72 w-[30%] h-[30%] bg-secondary/10 blur-[150px] rounded-full -z-10 pointer-events-none"></div>
      </main>
    </>
  );
}

