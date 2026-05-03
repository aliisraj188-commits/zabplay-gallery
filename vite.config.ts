import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// @ts-ignore
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  // Ye line mobile par design aur CSS load karne ke liye sabse zaroori hai
  base: './', 
  plugins: [
    tsconfigPaths(),
    react(),
    TanStackRouterVite(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
