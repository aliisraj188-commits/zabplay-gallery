import { useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import type { MediaItem } from "@/lib/media-store";
import { toast } from "sonner";

export function PhotoGrid({ items }: { items: MediaItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(() => {
    setOpenIdx((i) => (i === null ? null : (i + 1) % items.length));
  }, [items.length]);
  const prev = useCallback(() => {
    setOpenIdx((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIdx, close, next, prev]);

  const sharePhoto = async (item: MediaItem) => {
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const file = new File([blob], item.name, { type: blob.type || item.mimeType });
      // @ts-ignore
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "ZabPlay photo" });
      } else if (navigator.share) {
        await navigator.share({ title: "ZabPlay", text: item.name });
      } else {
        toast.error("Sharing not supported");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("Share failed");
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => setOpenIdx(i)}
            className="relative aspect-square overflow-hidden bg-secondary active:opacity-80"
          >
            {it.thumbnail ? (
              <img src={it.thumbnail} alt={it.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      {openIdx !== null && items[openIdx] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent p-3">
            <button onClick={close} className="flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/10">
              <X className="h-6 w-6" />
            </button>
            <p className="line-clamp-1 flex-1 text-sm text-white">
              {items[openIdx].name} <span className="text-white/60">({openIdx + 1}/{items.length})</span>
            </p>
            <button onClick={() => sharePhoto(items[openIdx]!)} className="flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/10">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <img
              src={items[openIdx].url}
              alt={items[openIdx].name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {items.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white active:bg-white/20">
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white active:bg-white/20">
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
