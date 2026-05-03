import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  webDir: 'dist', 
  server: {
    androidScheme: 'https',
    // Ye line images aur media files ko bina kisi error ke load karne mein madad karegi
    cleartext: true 
  }
};

export default config;
