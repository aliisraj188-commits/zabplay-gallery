import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Music2, Pause, Play } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { MusicList } from "@/components/zab/MusicList";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { prettyName, type MediaItem } from "@/lib/media-store";

export const Route = createFileRoute("/music")({
  component: MusicPage,
  head: () => ({ meta: [{ title: "ZabPlay - Music" }] }),
});

function MusicPage() {
  const items = useMediaItems("music");
  const player = useAudioPlayer();
  const router = useRouter();
  const current = player.current();

  const play = (i: MediaItem) => {
    player.playItem(items, i);
    router.navigate({ to: "/now-playing" });
  };

  return (
    <AppShell>
      {items.length === 0 ? (
        <EmptyState icon={Music2} title="No music yet" description="Import audio files to listen with ZabPlay." />
      ) : (
        <MusicList items={items} onPlay={play} />
      )}
      {current && (
        <button
          onClick={() => router.navigate({ to: "/now-playing" })}
          className="fixed inset-x-0 bottom-14 z-30 flex w-full items-center gap-3 border-t border-border bg-card px-3 py-2.5 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
            <Music2 className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{prettyName(current.name)}</p>
            <p className="text-[11px] text-muted-foreground">
              {player.playing ? "Now playing" : "Paused"}
            </p>
          </div>
          <span
            onClick={(e) => { e.stopPropagation(); player.toggle(); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-foreground"
          >
            {player.playing
              ? <Pause className="h-4 w-4 fill-current" strokeWidth={0} />
              : <Play className="h-4 w-4 fill-current" strokeWidth={0} />}
          </span>
        </button>
      )}
      <AddMediaButton kind="music" label="Add music" />
    </AppShell>
  );
}
