import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Search as SearchIcon, X, Film, Music2, Image as ImageIcon, FileText } from "lucide-react";
import { useMediaItems } from "@/hooks/use-media-store";
import { prettyName } from "@/lib/media-store";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "ZabPlay - Search" }] }),
});

const iconFor = { video: Film, music: Music2, photo: ImageIcon, file: FileText } as const;

function SearchPage() {
  const all = useMediaItems();
  const [q, setQ] = useState("");
  const results = useMemo(
    () => (q.trim() ? all.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : []),
    [all, q]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background px-2">
        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-secondary px-4 py-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ZabPlay"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>
      <ul className="divide-y divide-border">
        {results.map((it) => {
          const Icon = iconFor[it.kind];
          return (
            <li key={it.id} className="flex items-center gap-3 px-3 py-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate text-sm text-foreground">{prettyName(it.name)}</span>
            </li>
          );
        })}
        {q && results.length === 0 && (
          <li className="px-4 py-12 text-center text-sm text-muted-foreground">No results for "{q}"</li>
        )}
      </ul>
    </div>
  );
}
