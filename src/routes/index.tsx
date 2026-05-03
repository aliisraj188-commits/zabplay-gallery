import { createFileRoute } from "@tanstack/react-router";
import { PlaySquare } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { VideoCard } from "@/components/zab/VideoCard";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";

export const Route = createFileRoute("/")({
  component: VideosPage,
  head: () => ({ meta: [{ title: "ZabPlay - Videos" }] }),
});

function VideosPage() {
  const videos = useMediaItems("video");
  return (
    <AppShell>
      {videos.length === 0 ? (
        <EmptyState
          icon={PlaySquare}
          title="No videos yet"
          description="Import videos from your device to start watching in ZabPlay."
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-2">
          {videos.map((v) => (
            <VideoCard key={v.id} item={v} />
          ))}
        </div>
      )}
      <AddMediaButton kind="video" label="Add videos" />
    </AppShell>
  );
}
