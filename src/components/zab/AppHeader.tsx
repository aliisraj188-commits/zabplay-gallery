import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import logo from "@/assets/zabplay-logo.png";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background px-3">
      <Link to="/" className="flex items-center gap-2">
        <img
          src={logo}
          alt="ZabPlay"
          className="h-9 w-9 rounded-lg object-contain drop-shadow-[0_2px_8px_oklch(0.62_0.24_27/0.35)]"
        />
        <span className="text-[19px] font-bold tracking-tight text-foreground">
          ZabPlay
        </span>
      </Link>
      <Link to="/search" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-accent">
        <Search className="h-5 w-5 text-foreground" />
      </Link>
    </header>
  );
}
