// Simple in-memory store for picked media files (web demo).
// In a real native app (Android/RN), this would scan device storage.

export type MediaKind = "video" | "music" | "photo" | "file";

export interface MediaItem {
  id: string;
  name: string;
  kind: MediaKind;
  url: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  mimeType: string;
  addedAt: number;
}

type Listener = () => void;

class MediaStore {
  private items: MediaItem[] = [];
  private listeners = new Set<Listener>();

  getAll() {
    return this.items;
  }
  getByKind(kind: MediaKind) {
    return this.items.filter((i) => i.kind === kind);
  }
  getById(id: string) {
    return this.items.find((i) => i.id === id);
  }
  add(items: MediaItem[]) {
    this.items = [...items, ...this.items];
    this.emit();
  }
  remove(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.url);
    this.items = this.items.filter((i) => i.id !== id);
    this.emit();
  }
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }
}

export const mediaStore = new MediaStore();

export function classifyFile(file: File): MediaKind {
  const t = file.type;
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("audio/")) return "music";
  if (t.startsWith("image/")) return "photo";
  return "file";
}

export async function buildMediaItems(files: FileList | File[]): Promise<MediaItem[]> {
  const arr = Array.from(files);
  const out: MediaItem[] = [];
  for (const f of arr) {
    const kind = classifyFile(f);
    const url = URL.createObjectURL(f);
    const item: MediaItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      kind,
      url,
      size: f.size,
      mimeType: f.type || "application/octet-stream",
      addedAt: Date.now(),
    };
    if (kind === "video") {
      try {
        const meta = await getVideoMeta(url);
        item.duration = meta.duration;
        item.thumbnail = meta.thumbnail;
      } catch {}
    } else if (kind === "photo") {
      item.thumbnail = url;
    } else if (kind === "music") {
      try {
        item.duration = await getAudioDuration(url);
      } catch {}
    }
    out.push(item);
  }
  return out;
}

function getVideoMeta(url: string): Promise<{ duration: number; thumbnail: string }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = url;
    v.crossOrigin = "anonymous";
    v.addEventListener("loadeddata", () => {
      const seekTo = Math.min(1, v.duration / 2 || 0);
      const onSeeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth || 320;
        canvas.height = v.videoHeight || 180;
        const ctx = canvas.getContext("2d");
        let thumb = "";
        if (ctx) {
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          try { thumb = canvas.toDataURL("image/jpeg", 0.7); } catch {}
        }
        resolve({ duration: v.duration || 0, thumbnail: thumb });
      };
      v.addEventListener("seeked", onSeeked, { once: true });
      try { v.currentTime = seekTo; } catch { onSeeked(); }
    });
    v.addEventListener("error", () => reject(new Error("video meta failed")));
  });
}

function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.src = url;
    a.addEventListener("loadedmetadata", () => resolve(a.duration || 0));
    a.addEventListener("error", () => reject(new Error("audio meta failed")));
  });
}

export function formatDuration(s?: number) {
  if (!s || !isFinite(s)) return "";
  const sec = Math.floor(s % 60);
  const min = Math.floor((s / 60) % 60);
  const hr = Math.floor(s / 3600);
  if (hr) return `${hr}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

// Turn a raw filename like "VID_20240115_184522_001.mp4" or
// "IMG-20231009-WA0021.jpg" into a friendly gallery-style title.
// Removes the extension, strips long digit/underscore sequences, and
// collapses separators. Falls back to the original (sans extension) if
// the cleanup leaves nothing meaningful.
export function prettyName(name: string): string {
  if (!name) return "";
  // strip extension
  const dot = name.lastIndexOf(".");
  let base = dot > 0 ? name.slice(0, dot) : name;
  // Common camera/whatsapp prefixes
  const prefixed = base.match(/^(VID|IMG|PXL|MVI|DSC|AUD|REC|VIDEO|PHOTO|SCREENSHOT|SCR|WA)[-_ ]?(.*)$/i);
  if (prefixed) base = prefixed[2] || base;
  // Drop runs of 6+ digits (timestamps, dates) and trailing -WA0001 etc.
  let cleaned = base
    .replace(/[-_ ]?WA\d+/gi, "")
    .replace(/\d{6,}/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    cleaned = (dot > 0 ? name.slice(0, dot) : name).replace(/[-_]+/g, " ").trim();
  }
  // Capitalise first letter of each word
  cleaned = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  return cleaned || name;
}

export function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
