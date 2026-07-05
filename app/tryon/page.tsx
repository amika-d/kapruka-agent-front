"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/src/components/layout/LeftSidebar";
import { useSidebar } from "@/src/lib/SidebarContext";
import { useCart } from "@/src/lib/CartContext";
import { useChat } from "@/src/lib/chatContext";
import { ProductCardType } from "@/src/types/schemas";

export default function TryOnPage() {
  const router = useRouter();
  const { isCollapsed, setIsMobileOpen } = useSidebar();
  const { addToCart } = useCart();
  const { messages } = useChat();
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "";

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<ProductCardType | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatProducts: ProductCardType[] = messages.flatMap((msg) =>
    msg.ui?.component === "ProductCarousel" ? msg.ui.props.items ?? [] : []
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setUserPhoto(base64);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTryOn = async () => {
    if (!userPhoto || !selectedGarment) return;
    setIsProcessing(true);
    setResultImage(null);
    setError(null);

    try {
      const res = await fetch(`${apiURL}/api/v1/tryon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_image_base64: userPhoto,
          garment_image_url: selectedGarment.image_url,
          garment_description: selectedGarment.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Try-on failed");
      }

      const data = await res.json();
      setResultImage(data.result_image_url);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden bg-background pointer-events-none">
        <div className="noise-texture absolute inset-0" />
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-leak" />
        <div className="absolute top-[40%] -right-[20%] w-[50%] h-[50%] bg-secondary/15 blur-[140px] rounded-full animate-leak" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden w-full">
        <LeftSidebar />

        <main
          className={`ml-0 ${isCollapsed ? "md:ml-16" : "md:ml-72"
            } flex-1 flex flex-col h-screen bg-transparent transition-all duration-300 overflow-hidden`}
        >
          {/* Header */}
          <header className="h-16 shrink-0 flex items-center gap-4 px-4 md:px-6 border-b border-white/10">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Back to chat</span>
            </button>

            <div className="h-5 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-[20px] text-primary">
                checkroom
              </span>
              <span className="font-semibold text-on-surface hidden sm:inline">Virtual Try-On</span>
            </div>

            {selectedGarment && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 min-w-0">
                <img
                  src={selectedGarment.image_url}
                  alt={selectedGarment.name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
                <span className="text-xs text-primary font-medium truncate max-w-[100px] sm:max-w-[160px]">
                  {selectedGarment.name}
                </span>
                <button
                  onClick={() => { setSelectedGarment(null); setResultImage(null); }}
                  className="text-primary/60 hover:text-primary transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
          </header>

          {/* Try-on panels */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 md:px-6 py-8 min-h-full">

              {/* YOUR PHOTO */}
              <div className="flex flex-col gap-3 w-full max-w-[300px]">
                <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
                  Your photo
                </p>

                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-surface-container relative">
                  {userPhoto ? (
                    <>
                      <img
                        src={`data:image/jpeg;base64,${userPhoto}`}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => { setUserPhoto(null); setResultImage(null); }}
                        className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white hover:bg-black/80 transition-colors border border-white/10"
                      >
                        Change
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all bg-white/[0.02] border-2 border-dashed border-white/20 hover:border-primary/50 rounded-2xl">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
                        add_a_photo
                      </span>
                      <span className="text-sm text-on-surface-variant/60 mt-3">
                        Upload your photo
                      </span>
                      <span className="text-xs text-on-surface-variant/30 mt-1">
                        Full body works best
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Trying-on preview card, sits under Your Photo */}
                {selectedGarment ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <img
                      src={selectedGarment.image_url}
                      alt={selectedGarment.name}
                      className="w-24 h-24 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest leading-none mb-1">
                        Trying on
                      </p>
                      <p className="text-xs font-medium text-on-surface truncate">
                        {selectedGarment.name}
                      </p>
                    </div>
                    <p className="text-xs text-primary font-semibold shrink-0">
                      LKR {selectedGarment.price.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-2.5 rounded-xl border border-dashed border-white/10">
                    <p className="text-xs text-on-surface-variant/30">
                      Pick a garment below to try on
                    </p>
                  </div>
                )}
              </div>

              {/* CENTER BUTTON */}
              <div className="flex md:flex-col items-center gap-3 shrink-0 order-first md:order-none">
                <button
                  onClick={handleTryOn}
                  disabled={!userPhoto || !selectedGarment || isProcessing}
                  className="flex flex-col items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-on-primary font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full" />
                      <span className="text-xs">~20–40s</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✨</span>
                      <span className="text-sm">Try it on</span>
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-xs text-red-400 text-center max-w-[140px]">{error}</p>
                )}
              </div>

              {/* RESULT */}
              <div className="flex flex-col gap-3 w-full max-w-[300px]">
                <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
                  Result
                </p>

                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-surface-container relative">
                  {isProcessing ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                      <p className="text-sm text-on-surface-variant/60 mt-4">Processing…</p>
                      <p className="text-xs text-on-surface-variant/30 mt-1">~20–40s</p>
                    </div>
                  ) : resultImage ? (
                    <>
                      <img
                        src={resultImage}
                        alt="Try-on result"
                        className="w-full h-full object-cover"
                      />
                      {selectedGarment && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <button
                            onClick={() => addToCart(selectedGarment)}
                            className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                          >
                            Add to Cart — LKR {selectedGarment.price.toLocaleString()}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">
                        photo_camera
                      </span>
                      <p className="text-sm text-on-surface-variant/30 mt-3">
                        Result appears here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product strip */}
          <div className="shrink-0 border-t border-white/10 bg-surface-container/30 backdrop-blur-sm">
            {chatProducts.length > 0 ? (
              <div className="px-4 md:px-6 py-4">
                <p className="text-xs text-on-surface-variant/40 mb-2 uppercase tracking-widest">
                  From your chat — tap to try on
                </p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {chatProducts.map((product) => (
                    <button
                      key={product.product_id}
                      onClick={() => {
                        setSelectedGarment(product);
                        setResultImage(null);
                        setError(null);
                      }}
                      className={`flex-none flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${selectedGarment?.product_id === product.product_id
                        ? "border-primary/60 bg-primary/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="text-left min-w-0">
                        <p className="text-xs font-medium text-on-surface truncate max-w-[100px] sm:max-w-[120px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary mt-0.5">
                          LKR {product.price.toLocaleString()}
                        </p>
                      </div>
                      {selectedGarment?.product_id === product.product_id && (
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 md:px-6 py-4">
                <p className="text-xs text-on-surface-variant/30 text-center py-2">
                  Chat with Kiyanna to find clothes to try on
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}