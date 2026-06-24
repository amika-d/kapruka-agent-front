import { useState } from "react";
import { ProductCardType } from "@/types/schemas";
import { useCart } from "../../lib/CartContext";

export default function ProductCard({
  item,
  isHero = false,
}: {
  item: ProductCardType;
  isHero?: boolean;
}) {
  const badge = item.badge || (isHero ? "Kiyanna's Choice" : undefined);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };


  return (
    <div
      className={`min-w-[85%] md:min-w-[48%] snap-center group relative overflow-hidden rounded-2xl border transition-all duration-500 bg-white/[0.02] backdrop-blur-sm ${isHero
          ? "border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20"
          : "border-white/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
        }`}
    >
      {/* Image */}
      <div className="aspect-[16/9] w-full relative overflow-hidden">
        <img
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={item.image_url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {/* Badge */}
        {badge && (
          <div className="absolute bottom-4 left-6">
            <span className="px-3 py-1 rounded-full bg-primary text-[10px] font-bold text-on-primary uppercase tracking-widest">
              {badge}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!item.in_stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-error-container text-on-error-container px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6 bg-surface-container-low/50 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 mr-4">
            <h4 className="text-[14px] leading-none tracking-[0.05em] font-semibold text-on-surface truncate">
              {item.name}
            </h4>
            {item.subtitle && (
              <p className="text-[13px] text-on-surface-variant/70 mt-1 truncate">{item.subtitle}</p>
            )}
            {item.delivery_available && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="material-symbols-outlined text-[12px] text-emerald-400">
                  local_shipping
                </span>
                <span className="text-[10px] text-emerald-400/80 font-bold uppercase">
                  Delivery Available
                </span>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-primary font-bold text-lg">
              {item.currency} {item.price.toLocaleString()}
            </p>
            {item.original_price && item.original_price > item.price && (
              <p className="text-[11px] text-on-surface-variant/50 line-through">
                {item.currency} {item.original_price.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          disabled={!item.in_stock}
          className={`w-full py-2.5 rounded-lg font-label-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            ${added
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-primary/10 hover:bg-primary/20 text-primary"
            }`}
          onClick={handleAddToCart}
        >
          <span className="material-symbols-outlined text-[18px]">
            {added ? "check_circle" : "add_shopping_cart"}
          </span>
          {!item.in_stock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
