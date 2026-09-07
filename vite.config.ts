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
  build: {
    // The largest per-level content chunks (sva-grund-1/2/3/4, ~45 lessons each) sit
    // around 630-760 kB — legitimately sized content, not a code-splitting problem, now
    // that manualChunks below keeps every chunk well under the PWA plugin's 2 MiB
    // precache cap.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // content/loader.ts eagerly imports every lesson file (161 lessons and counting),
        // which Rollup otherwise merges into one multi-MB "registry" chunk — that both
        // trips the 500 kB chunk-size warning and exceeds the PWA plugin's 2 MiB
        // per-file precache limit. Routing each level's lesson files into their own
        // chunk keeps every individual file small and means editing one level's content
        // only busts that level's chunk hash, not the whole bundle.
        manualChunks(id) {
          const marker = '/content/lessons/';
          const i = id.indexOf(marker);
          if (i === -1) return undefined;
          const level = id.slice(i + marker.length).split('/')[0];
          return `content-${level}`;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
