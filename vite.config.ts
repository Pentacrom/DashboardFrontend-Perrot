import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/DashboardFrontend-Perrot/',
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.220.100.16:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
