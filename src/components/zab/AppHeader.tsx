import { Link } from "@tanstack/react-router";
import { Cast, Search, Play } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background px-3">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-7 w-10 items-center justify-center rounded-md bg-brand shadow-[0_0_12px_oklch(0.62_0.24_27/0.5)]">
          <Play className="h-4 w-4 fill-white text-white" strokeWidth={0} />
        </div>
        <span className="text-[19px] font-bold tracking-tight text-foreground">
          ZabPlay
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <button className="flex h-10 w-10 items-center justify-center rounded-full active:bg-accent">
          <Cast className="h-5 w-5 text-foreground" />
        </button>
        <Link to="/search" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-accent">
          <Search className="h-5 w-5 text-foreground" />
        </Link>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
          R
        </button>
      </div>
    </header>
  );
}
