import { createFileRoute } from "@tanstack/react-router";
import { PlaySquare } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { VideoGrid } from "@/components/zab/VideoGrid";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";
import { useGalleryScanner } from "../hooks/useGalleryScanner";

// यहाँ /music था जिसे मैंने "/" कर दिया है, ताकि लाल स्क्रीन हट जाए
export const Route = createFileRoute("/")({
  component: VideosPage,
  head: () => ({ meta: [{ title: "ZabPlay - Videos" }] }),
});

function VideosPage() {
  const storedVideos = useMediaItems("video") || [];
  const { mediaFiles } = useGalleryScanner();
  
  // गैलरी से वीडियो फाइल्स निकालना
  const allVideos = [
    ...storedVideos, 
    ...(mediaFiles?.filter((m) => m.kind === "video") || [])
  ];

  return (
    <AppShell>
      {allVideos.length === 0 ? (
        <EmptyState
          icon={PlaySquare}
          title="ZabPlay - No videos"
          description="अपने फोन की गैलरी से वीडियो लोड करने के लिए नीचे बटन दबाएं।"
        />
      ) : (
        <VideoGrid items={allVideos} />
      )}
      <AddMediaButton kind="video" label="Add videos" />
    </AppShell>
  );
}

