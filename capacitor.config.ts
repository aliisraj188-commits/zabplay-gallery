import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  // Ye sabse zaroori badlav hai:
  webDir: 'dist', 
  server: {
    androidScheme: 'https'
  }
};

export default config;
