import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { SplashScreen } from "./SplashScreen";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SplashScreen />
      <AppHeader />
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
