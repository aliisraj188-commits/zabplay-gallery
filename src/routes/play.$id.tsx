import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, Maximize, Settings,
  RotateCcw, RotateCw, MoreVertical,
} from "lucide-react";
import { useMediaItem, useMediaItems } from "@/hooks/use-media-store";
import { formatDuration } from "@/lib/media-store";

export const Route = createFileRoute("/play/$id")({
  component: PlayerPage,
  head: () => ({ meta: [{ title: "ZabPlay - Player" }] }),
});

function PlayerPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const item = useMediaItem(id);
  const allVideos = useMediaItems("video");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [seekHint, setSeekHint] = useState<"forward" | "backward" | null>(null);
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState<"Auto" | "1080p" | "720p" | "480p" | "360p">("Auto");

  const lastTap = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idx = allVideos.findIndex((v) => v.id === id);
  const prev = idx > 0 ? allVideos[idx - 1] : null;
  const next = idx >= 0 && idx < allVideos.length - 1 ? allVideos[idx + 1] : null;

  const resetHide = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => { resetHide(); return () => { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, [resetHide]);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
    resetHide();
  };

  const seekBy = (sec: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + sec));
    setSeekHint(sec > 0 ? "forward" : "backward");
    setTimeout(() => setSeekHint(null), 500);
  };

  const onAreaTap = (side: "left" | "right") => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      seekBy(side === "left" ? -10 : 10);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current && Date.now() - lastTap.current >= 280) {
          setShowControls((s) => !s);
          if (!showControls) resetHide();
          lastTap.current = 0;
        }
      }, 300);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const t = (Number(e.target.value) / 100) * (v.duration || 0);
    v.currentTime = t;
    setProgress(Number(e.target.value));
  };

  const enterFullscreen = () => {
    const el = containerRef.current; if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-sm">Video not found.</p>
          <Link to="/" className="mt-3 inline-block rounded bg-brand px-4 py-2 text-sm">Go back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div ref={containerRef} className="relative aspect-video w-full bg-black select-none">
        <video
          ref={videoRef}
          src={item.url}
          autoPlay
          playsInline
          className="h-full w-full"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { if (next) router.navigate({ to: "/play/$id", params: { id: next.id } }); }}
        />

        {/* Tap zones for double-tap seek */}
        <button
          aria-label="seek backward"
          onClick={() => onAreaTap("left")}
          className="absolute inset-y-0 left-0 w-1/3"
        />
        <button
          aria-label="toggle play"
          onClick={togglePlay}
          className="absolute inset-y-0 left-1/3 w-1/3"
        />
        <button
          aria-label="seek forward"
          onClick={() => onAreaTap("right")}
          className="absolute inset-y-0 right-0 w-1/3"
        />

        {/* Seek hint */}
        {seekHint && (
          <div
            className={`pointer-events-none absolute inset-y-0 ${seekHint === "backward" ? "left-0" : "right-0"} flex w-1/3 items-center justify-center bg-white/10`}
          >
            <div className="flex flex-col items-center gap-1 text-white">
              {seekHint === "backward" ? <RotateCcw className="h-8 w-8" /> : <RotateCw className="h-8 w-8" />}
              <span className="text-xs font-semibold">10s</span>
            </div>
          </div>
        )}

        {/* Top bar */}
        {showControls && (
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-3">
            <div className="pointer-events-auto flex items-center gap-2">
              <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <p className="line-clamp-1 flex-1 text-sm font-medium text-white">{item.name}</p>
              <button onClick={() => setShowQuality((s) => !s)} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
                <Settings className="h-5 w-5 text-white" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
                <MoreVertical className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Center play controls */}
        {showControls && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-8">
            <button
              disabled={!prev}
              onClick={() => prev && router.navigate({ to: "/play/$id", params: { id: prev.id } })}
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-30"
            >
              <SkipBack className="h-6 w-6 fill-current" strokeWidth={0} />
            </button>
            <button
              onClick={togglePlay}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white"
            >
              {playing ? <Pause className="h-8 w-8 fill-current" strokeWidth={0} /> : <Play className="h-8 w-8 fill-current" strokeWidth={0} />}
            </button>
            <button
              disabled={!next}
              onClick={() => next && router.navigate({ to: "/play/$id", params: { id: next.id } })}
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-30"
            >
              <SkipForward className="h-6 w-6 fill-current" strokeWidth={0} />
            </button>
          </div>
        )}

        {/* Bottom bar */}
        {showControls && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="pointer-events-auto">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progress}
                onChange={onSeek}
                className="w-full accent-[oklch(0.62_0.24_27)]"
              />
              <div className="flex items-center justify-between text-[11px] text-white">
                <span>{formatDuration((progress / 100) * duration)}</span>
                <button onClick={enterFullscreen} className="flex h-8 w-8 items-center justify-center">
                  <Maximize className="h-4 w-4" />
                </button>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quality menu */}
        {showQuality && (
          <div className="absolute right-3 top-14 z-20 w-40 overflow-hidden rounded-lg bg-black/90 text-white shadow-xl">
            <div className="border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase text-white/60">
              Quality
            </div>
            {(["Auto", "1080p", "720p", "480p", "360p"] as const).map((q) => (
              <button
                key={q}
                onClick={() => { setQuality(q); setShowQuality(false); }}
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10"
              >
                <span>{q}</span>
                {quality === q && <span className="text-brand">●</span>}
                {q === "1080p" && <span className="ml-auto rounded bg-brand px-1 text-[9px] font-bold">HD</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Below player: title + up next */}
      <div className="bg-background px-4 py-3">
        <h1 className="text-base font-semibold text-foreground">{item.name}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          ZabPlay • {formatDuration(item.duration)} • {quality}
        </p>
      </div>
      {allVideos.length > 1 && (
        <div className="bg-background px-3 pb-6">
          <h2 className="px-1 py-2 text-sm font-semibold text-foreground">Up next</h2>
          <ul className="space-y-2">
            {allVideos.filter((v) => v.id !== id).slice(0, 6).map((v) => (
              <li key={v.id}>
                <Link to="/play/$id" params={{ id: v.id }} className="flex gap-3 active:opacity-70">
                  <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded bg-secondary">
                    {v.thumbnail && <img src={v.thumbnail} alt={v.name} className="h-full w-full object-cover" />}
                    {v.duration && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
                        {formatDuration(v.duration)}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 flex-1 text-[13px] font-medium text-foreground">{v.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
