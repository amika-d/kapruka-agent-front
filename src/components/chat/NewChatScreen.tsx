"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewChatScreen() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const quickActions = [
    { label: "Find Vesak Gifts", icon: "card_giftcard" },
    { label: "Compare Smartphones", icon: "smartphone" },
    { label: "Check my orders", icon: "package_2" },
    { label: "Surprise me", icon: "auto_awesome" },
  ];

  useEffect(() => {
    // Smooth reveal for content
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const newSessionId = crypto.randomUUID();
    router.push(`/c/${newSessionId}?q=${encodeURIComponent(query.trim())}`);
  };

  const handleChipClick = (text: string) => {
    setQuery(text);
  };

  return (
    <>
      {/* Top Bar Integration */}
      <header className="fixed top-0 right-0 left-72 h-20 flex justify-between items-center px-gutter z-20">
        <div className="flex items-center gap-gutter"></div>
        <div className="flex items-center gap-gutter">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 glass-pane">
            <img
              className="w-full h-full object-cover"
              alt="User profile avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo4F-aHpDD-1ShNjtf3GJjKRDhmsV8cYXZGqkcWsa-Ce3wcsqG6QtXOv0L668MDXmAt4-PrOMl3wmnRMwy3Ruw095Y1CIgcqzBmIs7-RXF4sQHmVA6ZtAp2i0A9089eP-WVgzDs9m9qH3ftQFGm5M_g6t5_pLTbQ8Kin8I17s_WWsUQAP6rLWzYfiL-6Vc0CuPeUUNg837UBHEeZHWnhqjcnl6-LXzkqM-fVXv7qNH_Cs1PFzd7Fnj4lwh_6CdB2QPj7B3MEz5uMA"
            />
          </div>
        </div>
      </header>

      <main
        className={`flex-1 ml-72 flex flex-col items-center justify-center px-container-padding-desktop transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Hero Section */}
        <section className="max-w-4xl w-full text-center space-y-stack-lg mt-24">
          <div className="space-y-stack-sm animate-fade-in-up">
            <h2 className="font-display-lg text-[48px] leading-[1.1] tracking-[-0.02em] font-black text-on-surface">
              HeLLo!! There
            </h2>

          </div>

          {/* Search Bar (Pill Shape Glass) */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto mt-stack-lg group">
            <div
              className={`absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl transition-opacity duration-500 ${isFocused ? "opacity-100" : "opacity-0"
                }`}
            ></div>
            <div
              className="relative glass-pane rounded-full p-1 flex items-center inner-glow transition-colors duration-300"
              style={{ borderColor: isFocused ? "rgba(208, 188, 255, 0.4)" : "rgba(255, 255, 255, 0.1)" }}
            >
              <div className="pl-stack-lg pr-stack-md flex items-center text-on-surface-variant/40">
                  <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <input
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 font-body-md py-4"
                  placeholder="Ask about products, orders, or anything else..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-on-primary p-3 rounded-full mr-1 transition-all duration-300 active:scale-90 flex items-center justify-center shadow-lg shadow-primary/30"
              >
                  <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>

          {/* Quick Actions Chips */}
          <div className="flex flex-wrap justify-center gap-stack-md pt-stack-md">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleChipClick(action.label)}
                className="px-6 py-2 rounded-full glass-pane glass-border-light hover:bg-white/10 hover:border-primary/40 text-[14px] leading-none tracking-[0.05em] font-semibold text-on-surface-variant transition-all duration-300 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </section>

        {/* Visual Interest / Glass Card Display (Asymmetric Bento-lite) */}
        <div className="grid grid-cols-12 gap-gutter w-full max-w-6xl mt-stack-lg pt-stack-lg opacity-40 hover:opacity-100 transition-opacity duration-700 pb-16">
          {/* Featured Card */}
          <div className="col-span-8 glass-pane rounded-3xl p-stack-lg overflow-hidden relative group">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative z-10 flex h-full items-center">
              <div className="w-1/2 space-y-stack-md">
                <span className="text-[12px] uppercase tracking-widest text-primary-fixed-dim font-medium">Trending Now</span>
                <h3 className="text-[24px] leading-[1.3] font-medium text-on-surface">Curated Festive Collection 2024</h3>
                <p className="text-[16px] leading-relaxed text-on-surface-variant/70">Discover hand-picked premium items for the upcoming season, filtered for your preferences.</p>
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
          {/* Stats/Info Card */}
          <div className="col-span-4 glass-pane rounded-3xl p-stack-lg flex flex-col justify-between">
            <div className="space-y-2">
              <span className="material-symbols-outlined text-primary text-3xl">insights</span>
              <h4 className="text-[14px] leading-none tracking-[0.05em] font-semibold text-on-surface">Market Insights</h4>
              <p className="text-[12px] leading-none font-medium text-on-surface-variant/60">Smartphone prices are currently 12% lower than last month.</p>
            </div>
            <div className="mt-4 flex -space-x-2">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container"></div>
              <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container-high"></div>
              <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container-highest"></div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary border border-primary/20">+4k</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
