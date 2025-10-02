import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to handle .jsonld files as JSON
    {
      name: 'jsonld-loader',
      transform(src, id) {
        if (id.endsWith('.jsonld')) {
          return {
            code: `export default ${src}`,
            map: null,
          }
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
