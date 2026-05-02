import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Pause, Play, SkipBack, SkipForward, Repeat, Repeat1,
  Shuffle, Sliders, Music2, ChevronDown,
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { EQ_PRESETS } from "@/lib/audio-player";
import { formatDuration, prettyName } from "@/lib/media-store";

export const Route = createFileRoute("/now-playing")({
  component: NowPlayingPage,
  head: () => ({ meta: [{ title: "ZabPlay - Now Playing" }] }),
});

function NowPlayingPage() {
  const player = useAudioPlayer();
  const cur = player.current();
  const [showEq, setShowEq] = useState(false);

  if (!cur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-sm">No song playing.</p>
          <Link to="/music" className="mt-3 inline-block rounded bg-brand px-4 py-2 text-sm text-brand-foreground">
            Go to Music
          </Link>
        </div>
      </div>
    );
  }

  const cycleRepeat = () => {
    const order = ["off", "all", "one"] as const;
    const i = order.indexOf(player.repeat);
    player.setRepeat(order[(i + 1) % order.length]);
  };

  const progress = player.duration ? (player.currentTime / player.duration) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-900 via-background to-background text-foreground">
      <div className="flex items-center justify-between p-4">
        <Link to="/music" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-accent">
          <ChevronDown className="h-6 w-6" />
        </Link>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Now Playing</p>
        <button
          onClick={() => setShowEq((s) => !s)}
          className={`flex h-10 w-10 items-center justify-center rounded-full active:bg-accent ${player.eq.enabled ? "text-brand" : ""}`}
        >
          <Sliders className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="relative mb-8 flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand/40 to-secondary shadow-2xl">
          <Music2 className={`h-32 w-32 text-brand ${player.playing ? "animate-pulse" : ""}`} />
        </div>
        <h1 className="line-clamp-2 text-center text-xl font-semibold">{prettyName(cur.name)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">ZabPlay Audio</p>

        <div className="mt-8 w-full">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={(e) => player.seek((Number(e.target.value) / 100) * player.duration)}
            className="w-full accent-[oklch(0.62_0.24_27)]"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{formatDuration(player.currentTime)}</span>
            <span>{formatDuration(player.duration)}</span>
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-between">
          <button
            onClick={() => player.setShuffle(!player.shuffle)}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${player.shuffle ? "text-brand" : "text-muted-foreground"}`}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button onClick={() => player.prev()} className="flex h-12 w-12 items-center justify-center">
            <SkipBack className="h-7 w-7 fill-current" strokeWidth={0} />
          </button>
          <button
            onClick={() => player.toggle()}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg"
          >
            {player.playing
              ? <Pause className="h-8 w-8 fill-current" strokeWidth={0} />
              : <Play className="h-8 w-8 fill-current" strokeWidth={0} />}
          </button>
          <button onClick={() => player.next()} className="flex h-12 w-12 items-center justify-center">
            <SkipForward className="h-7 w-7 fill-current" strokeWidth={0} />
          </button>
          <button
            onClick={cycleRepeat}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${player.repeat !== "off" ? "text-brand" : "text-muted-foreground"}`}
            title={`Repeat: ${player.repeat}`}
          >
            {player.repeat === "one"
              ? <Repeat1 className="h-5 w-5" />
              : <Repeat className="h-5 w-5" />}
          </button>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          {player.repeat === "one" && "Repeating this song"}
          {player.repeat === "all" && "Repeating queue"}
          {player.repeat === "off" && "Autoplay next on"}
        </p>
      </div>

      {showEq && (
        <div className="border-t border-border bg-card px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Sound Mixing (Equalizer)</h3>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={player.eq.enabled}
                onChange={(e) => player.setEq({ enabled: e.target.checked })}
              />
              On
            </label>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.keys(EQ_PRESETS).map((p) => (
              <button
                key={p}
                onClick={() => player.applyPreset(p)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs active:bg-accent"
              >
                {p}
              </button>
            ))}
          </div>
          {(["preamp", "bass", "mid", "treble"] as const).map((k) => (
            <div key={k} className="mb-2">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span className="uppercase">{k}</span>
                <span>{player.eq[k]} dB</span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={player.eq[k]}
                onChange={(e) => player.setEq({ [k]: Number(e.target.value) } as any)}
                className="w-full accent-[oklch(0.62_0.24_27)]"
                disabled={!player.eq.enabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
