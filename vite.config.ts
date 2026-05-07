import { defineConfig } from '@lovable.dev/vite-tanstack-config'

// Android/Capacitor needs a real static SPA shell plus relative assets.
export default defineConfig({
  vite: {
    base: './',
    build: {
      outDir: 'dist',
    },
  },
  tanstackStart: {
    client: {
      base: './_build',
    },
    spa: {
      enabled: true,
      prerender: {
        outputPath: '/index',
        crawlLinks: false,
      },
    },
  },
})
