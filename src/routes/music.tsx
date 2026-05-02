import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Music2, Pause, Play } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { MusicList } from "@/components/zab/MusicList";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";
import type { MediaItem } from "@/lib/media-store";

export const Route = createFileRoute("/music")({
  component: MusicPage,
  head: () => ({ meta: [{ title: "ZabPlay - Music" }] }),
});

function MusicPage() {
  const items = useMediaItems("music");
  const [current, setCurrent] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const play = (i: MediaItem) => {
    setCurrent(i);
    setPlaying(true);
    setTimeout(() => audioRef.current?.play(), 50);
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause(); else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <AppShell>
      {items.length === 0 ? (
        <EmptyState icon={Music2} title="No music yet" description="Import audio files to listen with ZabPlay." />
      ) : (
        <MusicList items={items} onPlay={play} />
      )}
      {current && (
        <div className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-border bg-card px-3 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
            <Music2 className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{current.name}</p>
            <p className="text-[11px] text-muted-foreground">Now playing</p>
          </div>
          <button onClick={toggle} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-foreground">
            {playing ? <Pause className="h-4 w-4 fill-current" strokeWidth={0} /> : <Play className="h-4 w-4 fill-current" strokeWidth={0} />}
          </button>
          <audio ref={audioRef} src={current.url} onEnded={() => setPlaying(false)} />
        </div>
      )}
      <AddMediaButton kind="music" label="Add music" />
    </AppShell>
  );
}
