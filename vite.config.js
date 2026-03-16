import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // On remet le nom du dossier pour GitHub Pages
  base: '/Baraka/', 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})