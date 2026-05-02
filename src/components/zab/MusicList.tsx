import { Music2, Play } from "lucide-react";
import { formatDuration, prettyName, type MediaItem } from "@/lib/media-store";

export function MusicList({ items, onPlay }: { items: MediaItem[]; onPlay?: (i: MediaItem) => void }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((it) => (
        <li
          key={it.id}
          onClick={() => onPlay?.(it)}
          className="flex cursor-pointer items-center gap-3 px-3 py-3 active:bg-accent"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-secondary">
            <Music2 className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{prettyName(it.name)}</p>
            <p className="text-xs text-muted-foreground">{formatDuration(it.duration) || "Audio"}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onPlay?.(it); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
          </button>
        </li>
      ))}
    </ul>
  );
}
