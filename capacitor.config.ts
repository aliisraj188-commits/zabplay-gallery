import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true 
  },
  plugins: {
    Media: {
      androidGalleryMode: true,
    },
  }
};

export default config;
