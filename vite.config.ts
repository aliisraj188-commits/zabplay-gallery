import { defineConfig } from '@lovable.dev/vite-tanstack-config'

// Capacitor needs the real TanStack client HTML in dist/client/index.html.
// SPA mode prerenders that shell so the APK/AAB package includes the actual app design.
export default defineConfig({
  nitro: false,
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
      maskPath: '/',
      prerender: {
        outputPath: '/_shell',
        crawlLinks: false,
        failOnError: true,
      },
    },
  },
})
