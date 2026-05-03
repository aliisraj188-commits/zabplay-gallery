import { useState, useEffect } from 'react';
import { Media } from '@capacitor-community/media';

export const useGalleryScanner = () => {
  const [mediaFiles, setMediaFiles] = useState([]);

  const scanAllMedia = async () => {
    try {
      // Permission request
      const permission = await Media.requestPermissions();
      
      if (permission.photos === 'granted' || permission.photos === 'limited') {
        const albums = await Media.getAlbums();
        
        // Saari photos aur videos fetch karne ke liye
        const result = await Media.getMedias({
          album: albums[0],
          types: ['photo', 'video'],
          quantity: 500 
        });
        
        setMediaFiles(result.medias);
      }
    } catch (err) {
      console.error("Gallery scan failed:", err);
    }
  };

  useEffect(() => {
    scanAllMedia();
  }, []);

  return { mediaFiles, rescans: scanAllMedia };
};

