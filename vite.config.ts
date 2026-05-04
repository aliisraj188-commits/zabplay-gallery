import { defineConfig } from 'vite'
import { tanstackStart } from '@lovable.dev/vite-tanstack-config'

export default defineConfig({
  plugins: [tanstackStart()],
})
