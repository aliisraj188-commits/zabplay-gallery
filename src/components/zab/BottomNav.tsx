import { Link, useLocation } from "@tanstack/react-router";
import { PlaySquare, Music2, Image as ImageIcon, FolderOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { to: "/", label: "Video", icon: PlaySquare },
  { to: "/music", label: "Music", icon: Music2 },
  { to: "/photos", label: "Photos", icon: ImageIcon },
  { to: "/files", label: "Files", icon: FolderOpen },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      {tabs.map((t) => {
        const active = pathname === t.to;
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            <Icon
              className={`h-5 w-5 ${active ? "fill-brand text-brand" : "text-foreground"}`}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span
              className={`text-[11px] ${active ? "font-semibold text-brand" : "text-muted-foreground"}`}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
