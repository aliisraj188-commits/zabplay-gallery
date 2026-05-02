import { FileText, Trash2 } from "lucide-react";
import { formatSize, mediaStore, type MediaItem } from "@/lib/media-store";

export function FileList({ items }: { items: MediaItem[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-3 px-3 py-3 active:bg-accent">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-secondary">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{it.name}</p>
            <p className="text-xs text-muted-foreground">
              {it.mimeType || "file"} • {formatSize(it.size)}
            </p>
          </div>
          <button
            onClick={() => mediaStore.remove(it.id)}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
