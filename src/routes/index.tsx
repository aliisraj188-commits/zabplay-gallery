import { createFileRoute } from "@tanstack/react-router";
import { PlaySquare } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { VideoCard } from "@/components/zab/VideoCard";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
// Purana import rehne diya
import { useMediaItems } from "@/hooks/use-media-store"; 
// Naya scanner import kiya
import { useGalleryScanner } from "../hooks/useGalleryScanner"; 

export const Route = createFileRoute("/")({
  component: VideosPage,
  head: () => ({ meta: [{ title: "ZabPlay - Videos" }] }),
});

function VideosPage() {
  // Purana data (agar pehle se kuch hai)
  const storedVideos = useMediaItems("video");
  const { mediaFiles } = useGalleryScanner();
  const allVideos = [...storedVideos, ...mediaFiles.filter((m) => m.kind === "video")];

  return (
    <AppShell>
      {allVideos.length === 0 ? (
        <EmptyState
          icon={PlaySquare}
          title="No videos yet"
          description="Import videos from your device to start watching in ZabPlay."
        />
      ) : (
        <VideoGrid items={allVideos} />
      )}
      <AddMediaButton kind="video" label="Add videos" />
    </AppShell>
  );
}
