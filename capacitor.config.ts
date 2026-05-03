import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  webDir: 'dist', // Sirf 'dist' hi rehne dena
  server: {
    androidScheme: 'https'
  }
};

export default config;
