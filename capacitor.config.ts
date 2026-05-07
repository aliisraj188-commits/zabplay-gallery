import type { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    cleartext: true 
  },
  plugins: {
    Media: {
      androidGalleryMode: true,
    },
  }
} satisfies CapacitorConfig & { bundledWebRuntime: false };

export default config;
