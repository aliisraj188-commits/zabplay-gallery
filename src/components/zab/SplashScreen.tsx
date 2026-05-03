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
    const fadeT = setTimeout(() => setFading(true), 2300);
    const hideT = setTimeout(() => setVisible(false), 2900);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 20%, oklch(0.74 0.18 55 / 0.45), transparent 55%)," +
          "radial-gradient(circle at 70% 80%, oklch(0.55 0.16 150 / 0.45), transparent 55%)," +
          "linear-gradient(180deg, oklch(0.16 0.03 60), oklch(0.14 0.02 90), oklch(0.16 0.04 150))",
      }}
    >
      <div className="relative flex flex-col items-center">
        <span className="absolute -inset-12 animate-pulse rounded-full bg-tiranga-soft opacity-40 blur-3xl" />
        <span className="relative inline-flex h-44 w-44 items-center justify-center rounded-[44px] bg-tiranga-soft p-[3px] shadow-[0_20px_60px_oklch(0.42_0.18_265/0.55)]">
          <span className="flex h-full w-full items-center justify-center rounded-[42px] bg-background/85">
            <img
              src={logo}
              alt="ZabPlay"
              className="h-32 w-32 animate-[zab-pop_700ms_ease-out] rounded-[34px] object-contain drop-shadow-[0_10px_30px_oklch(0.74_0.18_55/0.45)]"
            />
          </span>
        </span>
        <p className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          Zab<span className="text-brand">Play</span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Play • Listen • Watch
        </p>
      </div>
      <div className="mt-10 flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[oklch(0.74_0.18_55)] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[oklch(0.97_0.005_90)] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[oklch(0.55_0.16_150)]" />
      </div>
      <style>{`
        @keyframes zab-pop {
          0% { transform: scale(0.55) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
