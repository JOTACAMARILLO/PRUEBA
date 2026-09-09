import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Served from https://<user>.github.io/PRUEBA/ in production (GitHub Pages
// project site), and from the dev server root otherwise.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/PRUEBA/' : '/',
  plugins: [react()],
}))
