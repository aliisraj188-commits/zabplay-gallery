import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  webDir: 'dist', // Ise 'dist' hi rakho, Capacitor isi ko samajhta hai
  server: {
    androidScheme: 'https'
  }
};

export default config;
