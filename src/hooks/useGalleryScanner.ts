import { useEffect, useState, useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { MediaItem, MediaKind } from '@/lib/media-store';

interface NativeMedia {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  addedAt: number;
  url: string;
  kind: MediaKind;
}

interface GalleryPlugin {
  scan(): Promise<{ photos: NativeMedia[]; videos: NativeMedia[]; music: NativeMedia[] }>;
}

const Gallery = registerPlugin<GalleryPlugin>('Gallery');

export const useGalleryScanner = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);

  const rescans = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const res = await Gallery.scan();
      const all = [...res.photos, ...res.videos, ...res.music].map<MediaItem>((m) => ({
        id: m.id,
        name: m.name,
        kind: m.kind,
        url: Capacitor.convertFileSrc(m.url),
        size: m.size,
        mimeType: m.mimeType,
        addedAt: m.addedAt,
        thumbnail: m.kind === 'photo' ? Capacitor.convertFileSrc(m.url) : undefined,
      }));
      setMediaFiles(all);
    } catch (e) {
      console.warn('Gallery scan failed', e);
    }
  }, []);

  useEffect(() => {
    void rescans();
  }, [rescans]);

  return { mediaFiles, rescans };
};
