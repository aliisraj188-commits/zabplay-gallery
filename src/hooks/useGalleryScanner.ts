import { useState } from 'react';
import type { MediaItem } from '@/lib/media-store';

// Web preview stub. On native (Capacitor) this would scan the device gallery.
export const useGalleryScanner = () => {
  const [mediaFiles] = useState<MediaItem[]>([]);
  return { mediaFiles, rescans: async () => {} };
};
