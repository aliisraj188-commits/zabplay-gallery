import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay',
  appName: 'ZabPlay',
  // Is line ko maine badal diya hai fix karne ke liye:
  webDir: '.output/public', 
  server: {
    androidScheme: 'https'
  }
};

export default config;
