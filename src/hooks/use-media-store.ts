import { useEffect, useState } from "react";
import { mediaStore, type MediaItem, type MediaKind } from "@/lib/media-store";

export function useMediaItems(kind?: MediaKind): MediaItem[] {
  const [, setTick] = useState(0);
  useEffect(() => mediaStore.subscribe(() => setTick((t) => t + 1)), []);
  return kind ? mediaStore.getByKind(kind) : mediaStore.getAll();
}

export function useMediaItem(id: string | undefined): MediaItem | undefined {
  const [, setTick] = useState(0);
  useEffect(() => mediaStore.subscribe(() => setTick((t) => t + 1)), []);
  return id ? mediaStore.getById(id) : undefined;
}
