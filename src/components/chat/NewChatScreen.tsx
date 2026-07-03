"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInput from "./ChatInput";

const TYPEWRITER_PHRASES = [
  "Hello there.",

  "Let's go shopping.",
];

function useTypewriter(phrases: string[], typingSpeed = 55, pauseMs = 1600, deletingSpeed = 30) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(() => {
        setText((t) =>
          isDeleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
        );
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases, typingSpeed, pauseMs, deletingSpeed]);

  return text;
}

export default function NewChatScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const router = useRouter();
  const typedText = useTypewriter(TYPEWRITER_PHRASES);

  const quickActions = [
    { label: "Find gifts for my mom", icon: "card_giftcard" },
    { label: "Compare Smartphones", icon: "smartphone" },
    { label: "Check my orders", icon: "package_2" },
    { label: "Surprise me", icon: "auto_awesome" },
  ];

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Navigate only after the input bar has visually docked to the bottom
  const launch = (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;
    setIsLaunching(true);
    const newSessionId = crypto.randomUUID();
    const url = text.trim()
      ? `/c/${newSessionId}?q=${encodeURIComponent(text.trim())}`
      : `/c/${newSessionId}`;

    // Stash image in sessionStorage so ChatInterface can pick it up after navigation
    if (imageBase64) {
      sessionStorage.setItem("pending_image", imageBase64);
    }

    setTimeout(() => {
      router.push(url);
    }, 420); // matches the transition duration below
  };

  const handleSendMessage = (text: string, imageBase64?: string) => launch(text, imageBase64);
  const handleChipClick = (text: string) => launch(text);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 right-0 left-72 h-20 flex justify-between items-center px-gutter z-20">
        <div className="flex items-center gap-gutter" />
        <div className="flex items-center gap-gutter">
          {/* <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button> */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 glass-pane">
            <img
              className="w-full h-full object-cover"
              alt="User profile avatar"
              src="/rick-dp.jpg"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 ml-72 relative min-h-screen overflow-hidden">
        {/* Centered hero + input, fades/collapses out on launch */}
        <div
          className={`flex flex-col items-center px-container-padding-desktop transition-all duration-500 ease-out ${isVisible ? "opacity-100" : "opacity-0"
            } ${isLaunching ? "opacity-0 -translate-y-6" : "translate-y-0"}`}
          style={{
            minHeight: "100vh",
            justifyContent: "center",
            paddingBottom: isLaunching ? "0" : undefined,
          }}
        >
          {/* Hero Section */}
          <section className="max-w-4xl w-full text-center animate-fade-in-up">
            <h2 className="font-display-lg text-[48px] leading-[1.1] tracking-[-0.02em] font-black text-on-surface min-h-[58px]">
              {typedText}
              <span className="inline-block w-[3px] h-[42px] bg-primary ml-1 align-middle animate-pulse" />
            </h2>
          </section>

          {/* Input bar — lives here at center until launch */}
          {!isLaunching && (
            <div className="w-full flex justify-center mt-stack-lg">
              <ChatInput onSendMessage={handleSendMessage} disabled={false} variant="inline" />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-stack-md mt-stack-lg">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleChipClick(action.label)}
                className="px-6 py-2.5 rounded-full glass-pane glass-border-light hover:bg-white/10 hover:border-primary/40 text-[14px] leading-none tracking-[0.05em] font-semibold text-on-surface-variant transition-all duration-300 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>

          {/* Bento cards */}
          <div className="grid grid-cols-12 gap-gutter w-full max-w-6xl mt-stack-xl opacity-40 hover:opacity-100 transition-opacity duration-700 pb-16 pt-10">
            <div className="col-span-8 glass-pane rounded-3xl p-stack-lg overflow-hidden relative group">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10 flex h-full items-center">
                <div className="w-1/2 space-y-stack-md">
                  <span className="text-[12px] uppercase tracking-widest text-primary-fixed-dim font-medium">
                    Trending Now
                  </span>
                  <h3 className="text-[24px] leading-[1.3] font-medium text-on-surface">
                    Curated Festive Collection 2024
                  </h3>
                  <p className="text-[16px] leading-relaxed text-on-surface-variant/70">
                    Discover hand-picked premium items for the upcoming season, filtered for your preferences.
                  </p>
                  <button className="mt-stack-sm text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
                    Explore Collection <span className="material-symbols-outlined">trending_flat</span>
                  </button>
                </div>
                <div className="w-1/2 h-full flex justify-end">
                  <img
                    className="w-4/5 h-48 object-cover rounded-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl"
                    alt="Curated festive collection"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4G5rtrzNfk-oG0xGiSru21aIhXCMz5gnaRNMbeKGCgGgD3h0f8fnEgV6JAZ8U40tp9OjRpnVRALSYd8XsCCqky5_d96QZYp-EQtC_Yv676t4gRj5WTXREU9u1eJyn606eFjYlUkl423kBwlhhi7DiR9EPGEEl5NTwVSLYMRmzNlUPS6pptvsxeY6eM0-GpTFinlNnnkUBtgatGhwkGhAh74ogwWICEpAU3rcSUwHGdrPwrbQBYvJAFyEski64uTMNS4kGYfWC3mc"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4 glass-pane rounded-3xl p-stack-lg flex flex-col justify-between">
              <div className="space-y-2">
                <span className="material-symbols-outlined text-primary text-3xl">insights</span>
                <h4 className="text-[14px] leading-none tracking-[0.05em] font-semibold text-on-surface">
                  Market Insights
                </h4>
                <p className="text-[12px] leading-none font-medium text-on-surface-variant/60">
                  Smartphone prices are currently 12% lower than last month.
                </p>
              </div>
              <div className="mt-4 flex -space-x-2">
                <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container" />
                <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container-high" />
                <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container-highest" />
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary border border-primary/20">
                  +4k
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Docked input — fades/slides in at bottom right as the centered one leaves */}
        <div
          className={`fixed bottom-0 left-72 right-0 px-container-padding-desktop pt-8 pb-8 bg-gradient-to-t from-background via-background/95 to-transparent transition-all duration-500 ease-out z-50 pointer-events-none ${isLaunching ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4"
            }`}
        >
          <div className="max-w-4xl mx-auto h-14 rounded-full glass-pane border border-white/10" />
        </div>
      </main>
    </>
  );
}