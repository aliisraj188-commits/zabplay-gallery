import { Link } from "@tanstack/react-router";
import { MoreVertical, Film } from "lucide-react";
import { formatDuration, prettyName, type MediaItem } from "@/lib/media-store";

export function VideoCard({ item }: { item: MediaItem }) {
  return (
    <Link
      to="/play/$id"
      params={{ id: item.id }}
      className="block active:opacity-80"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {item.duration ? (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDuration(item.duration)}
          </span>
        ) : null}
      </div>
      <div className="flex gap-3 px-3 py-3">
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-brand/20" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground">
            {prettyName(item.name)}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            ZabPlay • Local file
          </p>
        </div>
        <button onClick={(e) => e.preventDefault()} className="-mr-2 h-8 w-8 flex items-center justify-center text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}
