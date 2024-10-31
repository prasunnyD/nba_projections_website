import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/team-last-10-games': {
        target: 'http://localhost:8000',  // Your FastAPI backend URL
        changeOrigin: true,
        secure: false,
      },
      '/player-last-10-games': {
        target: 'http://localhost:8000',  // Your FastAPI backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  }
})