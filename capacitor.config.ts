import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.israj.zabplay', // Ye aapke app ki unique ID hai
  appName: 'ZabPlay',         // Ye naam phone ki screen par dikhega
  webDir: 'dist',             // Vite build isi folder mein banti hai
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'    // Naye Android phones ke liye security system
  },
  plugins: {
    // Gallery aur Media scan karne ke liye yahan extra settings ki zarurat nahi hoti
  }
};

export default config;

