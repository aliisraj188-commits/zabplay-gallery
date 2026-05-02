import { useEffect, useState } from "react";
import logo from "@/assets/zabplay-logo.png";

const SPLASH_KEY = "zabplay_splash_shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_KEY)) return;
    sessionStorage.setItem(SPLASH_KEY, "1");
    setVisible(true);
    const fadeT = setTimeout(() => setFading(true), 2200);
    const hideT = setTimeout(() => setVisible(false), 2800);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-10 animate-pulse rounded-full bg-brand/20 blur-3xl" />
        <img
          src={logo}
          alt="ZabPlay"
          className="relative h-40 w-40 animate-[zab-pop_700ms_ease-out] drop-shadow-[0_10px_40px_oklch(0.62_0.24_27/0.4)]"
        />
      </div>
      <div className="mt-10 flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand" />
      </div>
      <style>{`
        @keyframes zab-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
