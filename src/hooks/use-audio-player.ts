import { useEffect, useState } from "react";
import { audioPlayer } from "@/lib/audio-player";

export function useAudioPlayer() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = audioPlayer.subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);
  return audioPlayer;
}
