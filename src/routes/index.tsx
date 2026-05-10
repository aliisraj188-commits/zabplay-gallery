import { createFileRoute } from "@tanstack/react-router";
import { PlaySquare } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { VideoGrid } from "@/components/zab/VideoGrid";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";
import { useGalleryScanner } from "../hooks/useGalleryScanner";

export const Route = createFileRoute("/")({
  component: VideosPage,
  head: () => ({ meta: [{ title: "ZabPlay - Videos" }] }),
});

function VideosPage() {
  // गैलरी से वीडियो लोड करना
  const storedVideos = useMediaItems("video") || [];
  const { mediaFiles } = useGalleryScanner();
  
  // सिर्फ वीडियो फाइल्स को फिल्टर करके लिस्ट बनाना
  const allVideos = [
    ...storedVideos, 
    ...(mediaFiles?.filter((m) => m.kind === "video") || [])
  ];

  return (
    // 'bg-background' सुनिश्चित करता है कि अब लाल रंग नहीं दिखेगा
    <div className="bg-background min-h-screen">
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
    </div>
  );
}

