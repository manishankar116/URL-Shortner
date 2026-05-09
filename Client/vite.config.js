import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/shorten': 'http://localhost:8080',
      '^/[A-Za-z0-9]+$': 'http://localhost:8080',
    },
  },
})
