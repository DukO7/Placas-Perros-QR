import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Esto es lo que suele faltar si 'all' no funciona:
    hmr: {
      clientPort: 443 // Obliga al cliente a usar el puerto seguro de ngrok
    },
    allowedHosts: [
      '.ngrok-free.app', // Permite cualquier subdominio de ngrok
      'all'
    ]
  }
})