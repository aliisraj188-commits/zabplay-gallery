import { defineConfig } from '@lovable.dev/vite-tanstack-config'

// Android/Capacitor uses the client build plus a generated static shell in CI.
// TanStack prerender can fail in this environment by throwing a Response object,
// so keep prerender disabled for APK/AAB builds and let the workflow create index.html.
export default defineConfig({
  cloudflare: false,
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
    prerender: {
      enabled: false,
    },
  },
})
