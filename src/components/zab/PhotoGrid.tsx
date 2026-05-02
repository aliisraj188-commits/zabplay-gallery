import { Image as ImageIcon } from "lucide-react";
import type { MediaItem } from "@/lib/media-store";

export function PhotoGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {items.map((it) => (
        <div key={it.id} className="relative aspect-square overflow-hidden bg-secondary">
          {it.thumbnail ? (
            <img src={it.thumbnail} alt={it.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
