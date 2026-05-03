import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import logo from "@/assets/zabplay-logo.png";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-background/70 px-3 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tiranga-soft p-[2px] shadow-[0_6px_20px_oklch(0.42_0.18_265/0.45)]">
          <span className="flex h-full w-full items-center justify-center rounded-[14px] bg-background/85">
            <img
              src={logo}
              alt="ZabPlay"
              className="h-9 w-9 rounded-xl object-contain"
            />
          </span>
        </span>
        <span className="text-[20px] font-extrabold tracking-tight text-foreground">
          Zab<span className="text-brand">Play</span>
        </span>
      </Link>
      <Link
        to="/search"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card/60 active:bg-accent"
      >
        <Search className="h-5 w-5 text-foreground" />
      </Link>
    </header>
  );
}
