"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface ChatSession {
  session_id: string;
  title: string;
  last_accessed: number;
  message_count: number;
}

export default function LeftSidebar() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const navItems = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/collections", label: "Collections", icon: "dashboard_customize" },

    { href: "/cart", label: "Cart", icon: "shopping_cart" }
  ];

  const bottomItems = [
    { label: "Help", icon: "help" },
    { label: "Setting", icon: "settings" },
    { label: "Sign Out", icon: "logout" },
  ];

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API}/api/v1/sessions`);
      if (res.ok) {
        const data: ChatSession[] = await res.json();
        setSessions(data);
      }
    } catch {
      // backend may not be running; fail silently
    }
  };

  useEffect(() => {
    fetchSessions();
    // Refresh every 10s to pick up new chats
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isActiveChat = (session_id: string) =>
    pathname === `/c/${session_id}`;

  return (
    <aside className="flex flex-col fixed left-0 top-0 py-stack-lg h-screen w-72 rounded-r-xl bg-white/5 dark:bg-black/20 backdrop-blur-3xl border-r border-white/20 shadow-2xl shadow-black/40 z-50">
      {/* Brand */}
      <div className="px-gutter mb-stack-lg">
        <h1 className="font-headline-md text-headline-md font-bold text-primary mb-1">Kiyanna</h1>
        <p className="text-label-sm text-on-surface-variant/60 tracking-widest uppercase">Shopping Agent</p>
      </div>

      {/* New Chat CTA */}
      <div className="px-gutter mb-stack-lg">
        <Link href="/">
          <button className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">add_comment</span>
            New Chat
          </button>
        </Link>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar space-y-1">
        {/* Navigation */}
        <div className="px-gutter py-2 text-label-sm text-on-surface-variant/40 uppercase tracking-widest">Navigation</div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-gutter py-3 rounded-lg transition-all duration-300 ${isActive
                ? "bg-white/10 text-primary border-r-2 border-primary"
                : "text-on-surface-variant/70 hover:bg-white/5"
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          );
        })}

        {/* Recent Chats */}
        <div className="mt-stack-lg px-gutter py-2 text-label-sm text-on-surface-variant/40 uppercase tracking-widest">
          Recent Chats
        </div>

        {sessions.length === 0 ? (
          <div className="px-gutter py-3 text-[12px] text-on-surface-variant/30 italic">
            No chats yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((session) => (
              <Link
                key={session.session_id}
                href={`/c/${session.session_id}`}
                className={`flex items-start gap-3 px-gutter py-3 rounded-lg transition-all group ${isActiveChat(session.session_id)
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-on-surface-variant/60 hover:bg-white/5"
                  }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] mt-0.5 shrink-0 transition-opacity ${isActiveChat(session.session_id)
                    ? "opacity-100 text-primary"
                    : "opacity-40 group-hover:opacity-80"
                    }`}
                >
                  chat_bubble
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-snug truncate">
                    {session.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/30 mt-0.5">
                    {formatTime(session.last_accessed)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-4 pb-stack-lg">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-gutter py-2 rounded-lg text-on-surface-variant/70 hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-label-md">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
