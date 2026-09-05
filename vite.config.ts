/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Repository name is `swedish` — locked decision, see SPEC.md section 0.
export default defineConfig({
  base: '/swedish/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The app already ships public/manifest.webmanifest by hand (SPEC.md §12) — this
      // just tells the plugin to link/generate the service worker, not to re-author the
      // manifest itself.
      manifest: false,
      injectRegister: 'auto',
      workbox: {
        // Precache the app shell (JS/CSS) and the lesson/city/history content JSON so the
        // whole learning loop keeps working with no network after the first visit.
        globPatterns: ['**/*.{js,css,html,svg,json,webmanifest}'],
        navigateFallback: '/swedish/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
