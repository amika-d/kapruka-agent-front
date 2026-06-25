"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ProductCard from "./ProductCard";
import { ProductCardType } from "../../types/schemas";

export default function ProductCarousel({ items }: { items: ProductCardType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 0;
    const scrollAmount = cardWidth + 24; // card width + gap
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 1;
    const index = Math.round(container.scrollLeft / (cardWidth + 24));
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="relative group/carousel my-4">
      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-container-high/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-container-high/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x no-scrollbar"
      >
        {items.map((item, idx) => (
          <ProductCard key={item.product_id || idx} item={item} isHero={idx === 0} />
        ))}
      </div>

      {/* Scroll Indicator */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-8 bg-primary" : "w-2 bg-white/10"
                }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
