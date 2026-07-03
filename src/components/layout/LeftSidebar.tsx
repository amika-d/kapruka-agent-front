"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/src/lib/SidebarContext";


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
  const { isCollapsed, isMobileOpen, toggleCollapse, setIsMobileOpen } = useSidebar();

  const navItems: Array<{ href: string; label: string; icon?: string; svg?: React.ReactNode }> = [
    { href: "/", label: "Home", icon: "home" },
    // { href: "/collections", label: "Collections", icon: "dashboard_customize" },

    {
      href: "/try-on",
      label: "Try-On",
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shirt">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      ),
    },
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
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer when navigating
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

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
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`flex flex-col fixed left-0 top-0 py-stack-lg h-screen transition-all duration-300 ease-out rounded-r-xl bg-white/5 dark:bg-black/20 backdrop-blur-3xl border-r border-white/20 shadow-2xl shadow-black/40 z-50 ${
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
        } md:translate-x-0 ${isCollapsed ? "md:w-16" : "md:w-72"}`}
      >
        {/* Toggle & Brand Header */}
        <div className={`px-4 mb-stack-lg flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-headline-md text-headline-md font-bold text-primary mb-1 leading-none">Kiyanna</h1>
              <p className="text-[10px] text-on-surface-variant/60 tracking-widest uppercase truncate">Shopping Agent</p>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors shrink-0 items-center justify-center"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isCollapsed ? "dock_to_right" : "dock_to_left"}
            </span>
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* New Chat CTA */}
        <div className="px-3 mb-stack-lg">
          <Link href="/">
            <button
              title="New Chat"
              className={`w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20 ${
                isCollapsed ? "px-0" : "px-6"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">add_comment</span>
              {!isCollapsed && <span>New Chat</span>}
            </button>
          </Link>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto no-scrollbar space-y-1">
          {/* Navigation Label */}
          {!isCollapsed && (
            <div className="px-2 py-2 text-[10px] text-on-surface-variant/40 uppercase tracking-widest truncate">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-300 ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-white/10 text-primary border-r-2 border-primary"
                    : "text-on-surface-variant/70 hover:bg-white/5"
                }`}
              >
                {item.svg ? (
                  <span className="flex items-center justify-center w-[20px] h-[20px] shrink-0">{item.svg}</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                )}
                {!isCollapsed && <span className="font-body-md truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Recent Chats Section */}
          {isCollapsed ? (
            <button
              onClick={toggleCollapse}
              title="Recent Chats (Click to expand)"
              className="w-full flex items-center justify-center py-3 rounded-lg text-on-surface-variant/70 hover:bg-white/5 hover:text-primary transition-all duration-300 mt-4"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
            </button>
          ) : (
            <>
              <div className="mt-stack-lg px-2 py-2 text-[10px] text-on-surface-variant/40 uppercase tracking-widest truncate">
                Recent Chats
              </div>

              {sessions.length === 0 ? (
                <div className="px-2 py-3 text-[12px] text-on-surface-variant/30 italic">
                  No chats yet
                </div>
              ) : (
                <div className="space-y-0.5">
                  {sessions.map((session) => (
                    <Link
                      key={session.session_id}
                      href={`/c/${session.session_id}`}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                        isActiveChat(session.session_id)
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "text-on-surface-variant/60 hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 shrink-0 transition-opacity ${
                          isActiveChat(session.session_id)
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
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto px-3 pb-stack-lg">
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <button
                key={item.label}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 py-2 rounded-lg text-on-surface-variant/70 hover:bg-white/5 transition-all duration-300 ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                }`}
              >
                <span className="material-symbols-outlined text-lg shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="text-label-md truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
