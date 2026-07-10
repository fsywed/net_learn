import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置：开启 /api 代理到后端，开发服务器监听全部网卡
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
