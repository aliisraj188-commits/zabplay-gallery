import { Link } from "@tanstack/react-router";
import { MoreVertical, Film } from "lucide-react";
import { formatDuration, prettyName, type MediaItem } from "@/lib/media-store";
import logo from "@/assets/zabplay-logo.png";

export function VideoCard({ item }: { item: MediaItem }) {
  return (
    <Link
      to="/play/$id"
      params={{ id: item.id }}
      className="block active:opacity-80"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={prettyName(item.name)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {item.duration ? (
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(item.duration)}
          </span>
        ) : null}
      </div>
      <div className="flex gap-2 px-1 py-2">
        <span className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-tiranga-soft p-[1.5px]">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-background/80">
            <img src={logo} alt="ZabPlay" className="h-5 w-5 object-contain" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
            {prettyName(item.name)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            ZabPlay
          </p>
        </div>
        <button onClick={(e) => e.preventDefault()} className="-mr-1 h-7 w-7 flex items-center justify-center text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}
