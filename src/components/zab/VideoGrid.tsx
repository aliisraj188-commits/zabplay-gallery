import { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Film, Share2, X, Trash2, CheckCircle2 } from "lucide-react";
import { formatDuration, prettyName, mediaStore, type MediaItem } from "@/lib/media-store";
import logo from "@/assets/zabplay-logo.png";
import { toast } from "sonner";

export function VideoGrid({ items }: { items: MediaItem[] }) {
  const navigate = useNavigate();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startPress = useCallback((id: string) => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setSelectMode(true);
      setSelected((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      // Haptic-ish feedback
      if ("vibrate" in navigator) navigator.vibrate?.(40);
    }, 450);
  }, []);

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const onClick = (e: React.MouseEvent, item: MediaItem) => {
    if (longPressed.current) {
      e.preventDefault();
      longPressed.current = false;
      return;
    }
    if (selectMode) {
      e.preventDefault();
      toggle(item.id);
      return;
    }
    e.preventDefault();
    navigate({ to: "/play/$id", params: { id: item.id } });
  };

  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const shareSelected = async () => {
    const picked = items.filter((i) => selected.has(i.id));
    if (picked.length === 0) return;
    try {
      const files: File[] = [];
      for (const it of picked) {
        try {
          const res = await fetch(it.url);
          const blob = await res.blob();
          files.push(new File([blob], it.name, { type: blob.type || it.mimeType }));
        } catch {}
      }
      // @ts-ignore
      if (files.length && navigator.canShare?.({ files })) {
        await navigator.share({ files, title: "ZabPlay video", text: picked.map((p) => prettyName(p.name)).join(", ") });
      } else if (navigator.share) {
        await navigator.share({ title: "ZabPlay", text: picked.map((p) => prettyName(p.name)).join("\n") });
      } else {
        toast.error("Sharing not supported on this device");
        return;
      }
      toast.success("Shared");
      exitSelect();
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("Share failed");
    }
  };

  const deleteSelected = () => {
    selected.forEach((id) => mediaStore.remove(id));
    exitSelect();
  };

  return (
    <>
      {selectMode && (
        <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
          <button onClick={exitSelect} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted">
            <X className="h-5 w-5" />
          </button>
          <span className="flex-1 text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={shareSelected}
            disabled={selected.size === 0}
            className="flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-medium text-brand-foreground disabled:opacity-40"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={deleteSelected}
            disabled={selected.size === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted disabled:opacity-40"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-2">
        {items.map((item) => {
          const isSel = selected.has(item.id);
          return (
            <a
              key={item.id}
              href={`/play/${item.id}`}
              onClick={(e) => onClick(e, item)}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={() => startPress(item.id)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerCancel={cancelPress}
              className="block active:opacity-80 select-none"
            >
              <div className={`relative aspect-video w-full overflow-hidden rounded-lg bg-secondary ${isSel ? "ring-2 ring-brand" : ""}`}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={prettyName(item.name)} className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {item.duration ? (
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {formatDuration(item.duration)}
                  </span>
                ) : null}
                {selectMode && (
                  <span className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full ${isSel ? "bg-brand text-brand-foreground" : "bg-black/60 text-white/80"}`}>
                    {isSel ? <CheckCircle2 className="h-5 w-5" /> : <span className="h-4 w-4 rounded-full border-2 border-white/80" />}
                  </span>
                )}
              </div>
              <div className="flex gap-2 px-1 py-2">
                <span className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-tiranga-soft p-[1.5px]">
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-background/80">
                    <img src={logo} alt="ZabPlay" className="h-5 w-5 object-contain" />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">{prettyName(item.name)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">ZabPlay</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
