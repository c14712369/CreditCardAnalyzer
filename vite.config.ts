import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: '信用卡回饋比較',
        short_name: '卡片比較',
        description: '依消費習慣快速篩選高 CP 值信用卡並試算回饋',
        theme_color: '#6c63ff',
        background_color: '#0f0f1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
