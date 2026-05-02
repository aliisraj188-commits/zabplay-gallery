import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/components/zab/AppShell";
import { FileList } from "@/components/zab/FileList";
import { AddMediaButton } from "@/components/zab/AddMediaButton";
import { EmptyState } from "@/components/zab/EmptyState";
import { useMediaItems } from "@/hooks/use-media-store";

export const Route = createFileRoute("/files")({
  component: FilesPage,
  head: () => ({ meta: [{ title: "ZabPlay - Files" }] }),
});

function FilesPage() {
  const items = useMediaItems();
  return (
    <AppShell>
      {items.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files yet" description="Import any files to manage them in ZabPlay." />
      ) : (
        <FileList items={items} />
      )}
      <AddMediaButton kind="file" label="Add files" />
    </AppShell>
  );
}
