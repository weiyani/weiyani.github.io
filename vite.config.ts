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
  }
})