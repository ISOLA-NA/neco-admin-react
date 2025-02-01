import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // نادیده گرفتن هشدارها
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'TYPE_ONLY_EXPORT') return
        warn(warning)
      }
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})