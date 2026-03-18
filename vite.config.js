import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Définit la base pour GitHub Pages (nom du dépôt)
  // Cela permet à Vite de préfixer correctement les assets et les scripts
  base: '/Baraka/', 

  resolve: {
    alias: {
      // Permet d'utiliser l'alias "@" pour pointer vers le dossier src
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Optionnel : force le build à vider le dossier de sortie pour éviter les vieux fichiers
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})