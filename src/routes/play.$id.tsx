import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, Maximize, Settings,
  RotateCcw, RotateCw, MoreVertical, Repeat, Repeat1, Shuffle, Gauge,
  Maximize2, Lock, Headphones,
} from "lucide-react";
import { useMediaItem, useMediaItems } from "@/hooks/use-media-store";
import { formatDuration, prettyName } from "@/lib/media-store";
import { audioPlayer } from "@/lib/audio-player";
import logo from "@/assets/zabplay-logo.png";

export const Route = createFileRoute("/play/$id")({
  component: PlayerPage,
  head: () => ({ meta: [{ title: "ZabPlay - Player" }] }),
});

type Aspect = "Fit" | "Fill" | "Stretch" | "16:9" | "4:3";
type RepeatMode = "off" | "one" | "all";

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
  const [showMore, setShowMore] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showAspect, setShowAspect] = useState(false);
  const [locked, setLocked] = useState(false);
  const [quality, setQuality] = useState<"Auto" | "1080p" | "720p" | "480p" | "360p">("Auto");
  const [speed, setSpeed] = useState(1);
  const [aspect, setAspect] = useState<Aspect>("Fit");
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [autoplay, setAutoplay] = useState(true);
  const [shuffle, setShuffle] = useState(false);

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

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  // Auto-fullscreen on landscape rotation (4K/big screen feel)
  useEffect(() => {
    const handleOrientation = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const el = containerRef.current;
      if (!el) return;
      if (isLandscape && !document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {});
        // @ts-ignore
        screen.orientation?.lock?.("landscape").catch(() => {});
      } else if (!isLandscape && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener?.("change", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      mq.removeEventListener?.("change", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  const togglePlay = () => {
    if (locked) return;
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
    if (locked) { setLocked(false); return; }
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

  const cycleRepeat = () => {
    const order: RepeatMode[] = ["off", "all", "one"];
    setRepeat(order[(order.indexOf(repeat) + 1) % order.length]);
  };

  const handleEnded = () => {
    if (repeat === "one") {
      const v = videoRef.current; if (v) { v.currentTime = 0; v.play(); }
      return;
    }
    if (!autoplay) { setPlaying(false); return; }
    if (shuffle && allVideos.length > 1) {
      const others = allVideos.filter((v) => v.id !== id);
      const pick = others[Math.floor(Math.random() * others.length)];
      router.navigate({ to: "/play/$id", params: { id: pick.id } });
      return;
    }
    if (next) router.navigate({ to: "/play/$id", params: { id: next.id } });
    else if (repeat === "all" && allVideos[0]) router.navigate({ to: "/play/$id", params: { id: allVideos[0].id } });
  };

  const videoObjectFit =
    aspect === "Fit" ? "object-contain"
    : aspect === "Fill" ? "object-cover"
    : aspect === "Stretch" ? "object-fill"
    : "object-contain";

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
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, oklch(0.74 0.18 55 / 0.35), transparent 55%)," +
          "radial-gradient(circle at 80% 100%, oklch(0.55 0.16 150 / 0.40), transparent 55%)," +
          "linear-gradient(180deg, oklch(0.20 0.05 60), oklch(0.18 0.03 90), oklch(0.20 0.06 150))",
      }}
    >
      <div ref={containerRef} className="relative aspect-video w-full bg-black select-none">
        <video
          ref={videoRef}
          src={item.url}
          autoPlay
          playsInline
          loop={repeat === "one"}
          className={`h-full w-full ${videoObjectFit} ${aspect === "16:9" || aspect === "4:3" ? "" : ""}`}
          style={aspect === "16:9" ? { aspectRatio: "16/9" } : aspect === "4:3" ? { aspectRatio: "4/3" } : undefined}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
          }}
          onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = speed; }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
        />

        {/* Logo watermark */}
        <div className="pointer-events-none absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 p-[2px] backdrop-blur-sm opacity-80">
          <img src={logo} alt="ZabPlay" className="h-full w-full rounded-full object-contain" />
        </div>

        {/* Tap zones */}
        <button aria-label="seek backward" onClick={() => onAreaTap("left")} className="absolute inset-y-0 left-0 w-1/3" />
        <button aria-label="toggle play" onClick={() => locked ? setLocked(false) : togglePlay()} className="absolute inset-y-0 left-1/3 w-1/3" />
        <button aria-label="seek forward" onClick={() => onAreaTap("right")} className="absolute inset-y-0 right-0 w-1/3" />

        {seekHint && (
          <div className={`pointer-events-none absolute inset-y-0 ${seekHint === "backward" ? "left-0" : "right-0"} flex w-1/3 items-center justify-center bg-white/10`}>
            <div className="flex flex-col items-center gap-1 text-white">
              {seekHint === "backward" ? <RotateCcw className="h-8 w-8" /> : <RotateCw className="h-8 w-8" />}
              <span className="text-xs font-semibold">10s</span>
            </div>
          </div>
        )}

        {locked && showControls && (
          <button
            onClick={() => setLocked(false)}
            className="absolute left-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <Lock className="h-5 w-5" />
          </button>
        )}

        {!locked && showControls && (
          <>
            {/* Top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-3">
              <div className="pointer-events-auto flex items-center gap-1">
                <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Link>
                <p className="line-clamp-1 flex-1 text-sm font-medium text-white">{prettyName(item.name)}</p>
                <button
                  onClick={() => {
                    const v = videoRef.current;
                    const startAt = v ? v.currentTime : 0;
                    if (v) v.pause();
                    // Hand off audio playback to the global audio player
                    // so it keeps running when the screen is off / app is backgrounded.
                    audioPlayer.playItem([item], item);
                    setTimeout(() => { audioPlayer.seek(startAt); }, 200);
                    router.navigate({ to: "/now-playing" });
                  }}
                  title="Listen as audio (background)"
                  className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10"
                >
                  <Headphones className="h-5 w-5 text-white" />
                </button>
                <button onClick={() => { setShowSpeed((s) => !s); setShowMore(false); setShowAspect(false); setShowQuality(false); }} className="flex h-9 px-2 items-center justify-center rounded-full active:bg-white/10 text-white text-xs font-semibold">
                  {speed}x
                </button>
                <button onClick={() => { setShowQuality((s) => !s); setShowMore(false); setShowSpeed(false); setShowAspect(false); }} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
                  <Settings className="h-5 w-5 text-white" />
                </button>
                <button onClick={() => { setShowMore((s) => !s); setShowQuality(false); setShowSpeed(false); setShowAspect(false); }} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10">
                  <MoreVertical className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Center play controls */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-8">
              <button disabled={!prev} onClick={() => prev && router.navigate({ to: "/play/$id", params: { id: prev.id } })} className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-30">
                <SkipBack className="h-6 w-6 fill-current" strokeWidth={0} />
              </button>
              <button onClick={togglePlay} className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white">
                {playing ? <Pause className="h-8 w-8 fill-current" strokeWidth={0} /> : <Play className="h-8 w-8 fill-current" strokeWidth={0} />}
              </button>
              <button disabled={!next} onClick={() => next && router.navigate({ to: "/play/$id", params: { id: next.id } })} className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-30">
                <SkipForward className="h-6 w-6 fill-current" strokeWidth={0} />
              </button>
            </div>

            {/* Bottom bar */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="pointer-events-auto">
                <input type="range" min={0} max={100} step={0.1} value={progress} onChange={onSeek} className="w-full accent-[oklch(0.62_0.24_27)]" />
                <div className="flex items-center justify-between text-[11px] text-white">
                  <span>{formatDuration((progress / 100) * duration)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setLocked(true)} className="flex h-8 w-8 items-center justify-center" title="Lock">
                      <Lock className="h-4 w-4" />
                    </button>
                    <button onClick={cycleRepeat} className={`flex h-8 w-8 items-center justify-center ${repeat !== "off" ? "text-brand" : ""}`} title={`Repeat: ${repeat}`}>
                      {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setShuffle(!shuffle)} className={`flex h-8 w-8 items-center justify-center ${shuffle ? "text-brand" : ""}`} title="Shuffle">
                      <Shuffle className="h-4 w-4" />
                    </button>
                    <button onClick={enterFullscreen} className="flex h-8 w-8 items-center justify-center">
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quality menu */}
        {showQuality && (
          <div className="absolute right-3 top-14 z-20 w-44 overflow-hidden rounded-lg bg-black/95 text-white shadow-xl">
            <div className="border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase text-white/60">Quality</div>
            {(["Auto", "1080p", "720p", "480p", "360p"] as const).map((q) => (
              <button key={q} onClick={() => { setQuality(q); setShowQuality(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10">
                <span>{q}</span>
                <span className="flex items-center gap-2">
                  {q === "1080p" && <span className="rounded bg-brand px-1 text-[9px] font-bold">HD</span>}
                  {quality === q && <span className="text-brand">●</span>}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Speed menu */}
        {showSpeed && (
          <div className="absolute right-12 top-14 z-20 w-40 overflow-hidden rounded-lg bg-black/95 text-white shadow-xl">
            <div className="border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase text-white/60 flex items-center gap-1"><Gauge className="h-3 w-3" /> Speed</div>
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
              <button key={s} onClick={() => { setSpeed(s); setShowSpeed(false); }} className="flex w-full items-center justify-between px-3 py-2 text-sm active:bg-white/10">
                <span>{s === 1 ? "Normal" : `${s}x`}</span>
                {speed === s && <span className="text-brand">●</span>}
              </button>
            ))}
          </div>
        )}

        {/* More menu */}
        {showMore && (
          <div className="absolute right-3 top-14 z-20 w-52 overflow-hidden rounded-lg bg-black/95 text-white shadow-xl">
            <button onClick={() => { setShowAspect(true); setShowMore(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10">
              <span className="flex items-center gap-2"><Maximize2 className="h-4 w-4" /> Aspect ratio</span>
              <span className="text-[11px] text-white/60">{aspect}</span>
            </button>
            <button onClick={cycleRepeat} className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10">
              <span className="flex items-center gap-2">
                {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                Repeat
              </span>
              <span className="text-[11px] text-white/60 capitalize">{repeat}</span>
            </button>
            <button onClick={() => setAutoplay((a) => !a)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10">
              <span>Autoplay next</span>
              <span className={`text-[11px] ${autoplay ? "text-brand" : "text-white/60"}`}>{autoplay ? "On" : "Off"}</span>
            </button>
            <button onClick={() => { setShuffle((s) => !s); setShowMore(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10">
              <span className="flex items-center gap-2"><Shuffle className="h-4 w-4" /> Shuffle</span>
              <span className={`text-[11px] ${shuffle ? "text-brand" : "text-white/60"}`}>{shuffle ? "On" : "Off"}</span>
            </button>
            <button onClick={() => { setLocked(true); setShowMore(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm active:bg-white/10">
              <Lock className="h-4 w-4" /> Lock screen
            </button>
          </div>
        )}

        {/* Aspect submenu */}
        {showAspect && (
          <div className="absolute right-3 top-14 z-20 w-44 overflow-hidden rounded-lg bg-black/95 text-white shadow-xl">
            <div className="border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase text-white/60">Aspect ratio</div>
            {(["Fit", "Fill", "Stretch", "16:9", "4:3"] as Aspect[]).map((a) => (
              <button key={a} onClick={() => { setAspect(a); setShowAspect(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-sm active:bg-white/10">
                <span>{a}</span>
                {aspect === a && <span className="text-brand">●</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Below player */}
      <div className="px-4 py-3">
        <h1 className="text-base font-semibold text-foreground">{prettyName(item.name)}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          ZabPlay • {formatDuration(item.duration)} • {quality} • {speed}x
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-9 w-9 overflow-hidden rounded-full bg-tiranga-soft p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-background/80">
              <img src={logo} alt="ZabPlay" className="h-6 w-6 object-contain" />
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">ZabPlay</p>
            <p className="text-[11px] text-muted-foreground">Your channel</p>
          </div>
        </div>
      </div>
      {allVideos.length > 1 && (
        <div className="px-3 pb-24">
          <h2 className="px-1 py-2 text-sm font-semibold text-foreground">All videos</h2>
          <ul className="space-y-2">
            {allVideos.map((v) => {
              const isCurrent = v.id === id;
              return (
                <li key={v.id}>
                  <Link
                    to="/play/$id"
                    params={{ id: v.id }}
                    className={`flex gap-3 rounded-lg p-1 active:opacity-70 ${isCurrent ? "bg-brand/15 ring-1 ring-brand/50" : ""}`}
                  >
                    <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded bg-secondary">
                      {v.thumbnail && <img src={v.thumbnail} alt={v.name} className="h-full w-full object-cover" />}
                      {v.duration && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
                          {formatDuration(v.duration)}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-brand-foreground">
                          NOW
                        </span>
                      )}
                    </div>
                    <p className={`line-clamp-2 flex-1 text-[13px] font-medium ${isCurrent ? "text-brand" : "text-foreground"}`}>
                      {prettyName(v.name)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
