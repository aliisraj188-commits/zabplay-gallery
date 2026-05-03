import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  // Mobile par CSS aur Images load karne ke liye zaroori fix
  base: './', 
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite(), // Designing handle karne ke liye
    react(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Ye pakka karega ki saari designing ek hi jagah bundle ho jaye
    assetsDir: 'assets',
  },
})
