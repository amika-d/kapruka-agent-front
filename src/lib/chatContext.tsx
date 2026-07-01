"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatMessage, ThinkingEvent } from "../types/schemas";



interface ChatContextValue {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    events: ThinkingEvent[];
    setEvents: React.Dispatch<React.SetStateAction<ThinkingEvent[]>>;
    sessionId: string;
    setSessionId: React.Dispatch<React.SetStateAction<string>>;
    history: any[];
    setHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [events, setEvents] = useState<ThinkingEvent[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    // Initialize as empty string — set on client only to avoid SSR hydration mismatch
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        // Only generate a UUID on the client, never on the server
        if (!sessionId) setSessionId(crypto.randomUUID());
    }, []);

    return (
        <ChatContext.Provider value={{
            messages, setMessages,
            events, setEvents,
            sessionId, setSessionId,
            history, setHistory
        }}>
            {children}
        </ChatContext.Provider>
    );
}
export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be inside ChatProvider");
    return ctx;
}