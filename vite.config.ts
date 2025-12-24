import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Since this is a user site (weiyani.github.io), the base is root.
  // If it were a project site (weiyani.github.io/repo), it would be '/repo/'.
  base: '/', 
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, // 允许局域网访问
    port: 5173, // 开发服务器端口
  },
  preview: {
    host: true, // 允许局域网访问
    port: 4173, // 预览服务器端口
  }
})