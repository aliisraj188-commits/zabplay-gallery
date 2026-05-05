import { defineConfig } from '@lovable.dev/vite-tanstack-config'

// base: './' is required for Capacitor Android so that built assets
// resolve via relative paths (file://) inside the WebView.
export default defineConfig({
  base: './',
})
