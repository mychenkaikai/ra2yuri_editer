import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    exclude: ['electron']
  }
})