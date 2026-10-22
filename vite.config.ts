import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // src/app.tsx registers /sw.js itself so it can report when offline play is ready.
    VitePWA({
      injectRegister: false,
      manifest: false,
      workbox: {
        cacheId: "lanternwake",
        globPatterns: ["**/*"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: { host: "127.0.0.1", port: 4317, strictPort: true },
  build: { sourcemap: false },
});
