import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// `base` is per-deploy-target: "/" works for a custom domain or a host that
// serves from the root (Netlify, Vercel, Cloudflare Pages). A GitHub Pages
// *project* page needs "/<repo-name>/" instead — change at deploy time.
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Language Learning",
        short_name: "Language Learning",
        description: "Learn languages with flashcards, grammar lessons, and journaling.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          // A single scalable SVG covers all sizes for Phase 1; swap in real
          // 192/512 PNGs (maskable variants included) before shipping, since
          // iOS/some Android launchers don't rasterize SVG manifest icons.
          { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            // Bundled content JSON (vocab/lessons) is stable-ID and rebuildable,
            // safe to cache aggressively.
            urlPattern: /\/content\/.*\.json$/,
            handler: "CacheFirst",
            options: { cacheName: "content-cache" },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "app-shell" },
          },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
