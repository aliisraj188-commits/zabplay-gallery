import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Music2 } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { MusicList } from "@/components/zab/MusicList";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";
import { useGalleryScanner } from "../hooks/useGalleryScanner";
import { audioPlayer } from "@/lib/audio-player";

export const Route = createFileRoute("/music")({
  component: MusicPage,
  head: () => ({ meta: [{ title: "ZabPlay - Music" }] }),
});

function MusicPage() {
  const navigate = useNavigate();
  const storedMusic = useMediaItems("music") || [];
  const { mediaFiles } = useGalleryScanner();
  const allMusic = [
    ...storedMusic,
    ...(mediaFiles?.filter((m) => m.kind === "music") || []),
  ];

  return (
    <AppShell>
      {allMusic.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No music yet"
          description="Import or scan songs to start listening in ZabPlay."
        />
      ) : (
        <MusicList
          items={allMusic}
          onPlay={(item) => {
            audioPlayer.playItem(allMusic, item);
            navigate({ to: "/now-playing" });
          }}
        />
      )}
      <AddMediaButton kind="music" label="Add music" />
    </AppShell>
  );
}

