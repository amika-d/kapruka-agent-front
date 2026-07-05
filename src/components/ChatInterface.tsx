"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, ThinkingEvent } from "../types/schemas";
import ChatFeed from "./chat/ChatFeed";
import ChatInput from "./chat/ChatInput";
import { useCart } from "../lib/CartContext";
import { useChat } from "../lib/chatContext";
import { useSidebar } from "../lib/SidebarContext";
import LeftSidebar from "./layout/LeftSidebar";

interface ChatInterfaceProps {
  chatId: string;
  initialQuery?: string;
  orderSuccess?: string;
}

export default function ChatInterface({ chatId, initialQuery, orderSuccess }: ChatInterfaceProps) {
  const { messages, setMessages, sessionId, setSessionId, history, setHistory, setSendMessage } = useChat();
  const [isStreaming, setIsStreaming] = useState(false);
  const { cart, itemCount, setIsOpen: openCart } = useCart();
  const { isCollapsed, setIsMobileOpen } = useSidebar();

  const hasSentInitialQuery = useRef(false);
  const historyLoaded = useRef(false);
  const hasTriggeredOrderSuccess = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // When chatId changes, reset all chat state for the new session
  useEffect(() => {
    if (!chatId) return;
    if (abortRef.current && sessionId !== chatId) {
      abortRef.current.abort();
    }
    // Always clear messages and history when mounting a new chat page
    setMessages([]);
    setHistory([]);
    setSessionId(chatId);
    hasSentInitialQuery.current = false;
    historyLoaded.current = false;
    hasTriggeredOrderSuccess.current = false;
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

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
            (m: any, i: number) => ({
              id: `loaded-${i}`,
              role: m.role as "user" | "assistant",
              content: m.content || "",
              thinking: m.thinking,
              ui: m.ui,
            })
          );
          setMessages(loaded);
        }
      })
      .catch(() => { });
  }, [chatId]);

  const handleSendMessage = async (text: string, imageBase64?: string, hiddenUserMessage: boolean = false) => {
    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: text,
      imageBase64: imageBase64,
    };

    const agentMsgId = (Date.now() + 1).toString();
    const agentMsg: ChatMessage = { id: agentMsgId, role: "assistant", content: "" };
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";

    if (hiddenUserMessage) {
      setMessages((prev) => [...prev, agentMsg]);
    } else {
      setMessages((prev) => [...prev, userMsg, agentMsg]);
    }
    setIsStreaming(true);

    if (typeof window !== "undefined" && window.location.pathname === "/") {
      window.history.replaceState(null, "", `/c/${sessionId}`);
    }

    const controller = new AbortController();
    abortRef.current = controller;

    console.log("SENDING TO /chat:", {
      session_id: sessionId,
      message: text,
      history_length: history.length,
      history_last_3: history.slice(-3),
      cart_count: cart.items?.length,
      cart_items: cart.items
    });

    let finalAssistantText = "";  // ← accumulate here

    try {
      const res = await fetch(`${apiURL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          history: history,
          cart: cart.items,
          image_base64: imageBase64 ?? null,
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
                finalAssistantText += data.content;  // ← accumulate
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
              } else if (data.type === "tracking_card") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMsgId
                      ? { ...msg, ui: { component: "OrderTrackingCard", props: { data: data.data } } }
                      : msg
                  )
                );
              } else if (data.type === "pay_link") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMsgId
                      ? { ...msg, ui: { component: "PayLinkCard", props: { url: data.url } } }
                      : msg
                  )
                );
              } else if (data.type === "thinking") {
                const event: ThinkingEvent = {
                  step: data.step,
                  detail: data.detail,
                  status: data.status ?? "done",
                };
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMsgId
                      ? { ...msg, thinking: [...(msg.thinking ?? []), event] }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Failed to parse SSE JSON:", dataStr);
            }
          }
        }
      }

      // ← ADD: update history after stream completes
      setHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: finalAssistantText },
      ]);

    } catch (e: any) {
      if (e?.name === "AbortError") {
        console.log("Chat stream aborted by user or navigation");
      } else {
        console.error(e);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAbort = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  useEffect(() => {
    setSendMessage?.(() => (text: string) => handleSendMessage(text));
    return () => setSendMessage?.(undefined);
  }, [setSendMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasSentInitialQuery.current && sessionId === chatId) {
      // Pick up any image stashed by NewChatScreen before navigation
      const pendingImage = sessionStorage.getItem("pending_image");
      if (pendingImage) sessionStorage.removeItem("pending_image");

      if (initialQuery || pendingImage) {
        hasSentInitialQuery.current = true;
        handleSendMessage(initialQuery || "", pendingImage ?? undefined);
      }
    }
  }, [initialQuery, sessionId]);

  useEffect(() => {
    if (!hasTriggeredOrderSuccess.current && sessionId === chatId && orderSuccess) {
      hasTriggeredOrderSuccess.current = true;
      if (typeof window !== "undefined" && window.history?.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete("order_success");
        window.history.replaceState({}, "", url.toString());
      }
      handleSendMessage(
        `Order completed with order number ${orderSuccess}`,
        undefined,
        true
      );
    }
  }, [orderSuccess, sessionId, chatId]);

  return (
    <>

      <main className={`ml-0 ${isCollapsed ? "md:ml-16" : "md:ml-72"} flex-1 flex flex-col h-screen relative overflow-y-auto no-scrollbar scroll-smooth bg-transparent transition-all duration-300`}>
        {/* Top App Bar */}
        <header className={`fixed top-0 right-0 left-0 ${isCollapsed ? "md:left-16" : "md:left-72"} h-20 flex justify-between items-center px-container-padding-desktop z-40 bg-transparent transition-all duration-300`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
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
            {/* <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              notifications
            </span> */}

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
                src="/rick-dp.jpg"
              />
            </div>
          </div>
        </header>

        <ChatFeed
          messages={messages}
          isStreaming={isStreaming}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          isStreaming={isStreaming}
          onAbort={handleAbort}
        />

        {/* Background Atmospheric Elements */}
        <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse pointer-events-none"></div>
        <div className={`fixed bottom-[-10%] left-0 ${isCollapsed ? "md:left-16" : "md:left-72"} w-[30%] h-[30%] bg-secondary/10 blur-[150px] rounded-full -z-10 pointer-events-none transition-all duration-300`}></div>
      </main>
    </>
  );
}
