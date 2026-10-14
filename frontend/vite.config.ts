import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor')) return 'monaco-vendor';
            if (id.includes('sql.js')) return 'sql-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            if (id.includes('jszip')) return 'zip-vendor';
            if (id.includes('react/') || id.includes('react-dom/')) return 'react-vendor';
          }
        },
      },
    },
  },
})
