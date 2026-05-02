import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { PhotoGrid } from "@/components/zab/PhotoGrid";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";

export const Route = createFileRoute("/photos")({
  component: PhotosPage,
  head: () => ({ meta: [{ title: "ZabPlay - Photos" }] }),
});

function PhotosPage() {
  const items = useMediaItems("photo");
  return (
    <AppShell>
      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No photos yet" description="Import images to view them in ZabPlay." />
      ) : (
        <PhotoGrid items={items} />
      )}
      <AddMediaButton kind="photo" label="Add photos" />
    </AppShell>
  );
}
