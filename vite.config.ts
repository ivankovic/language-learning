import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// `base` is per-deploy-target: "/" works for a custom domain or a host that
// serves from the root (Netlify, Vercel, Cloudflare Pages). A project page on
// GitHub Pages or Codeberg Pages serves from "/<repo-name>/" instead. Only
// applied for production builds — `bun run dev` (including LAN access) stays
// at "/" for local convenience, since the subpath only matters once deployed.
// Single source of truth here — start_url/icon paths below derive from it so
// they can't drift out of sync with a subpath deploy.
export default defineConfig(({ command }) => {
  const base = command === "build" ? "/language-learning/" : "/";

  return {
    base,
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
          start_url: base,
          scope: base,
          icons: [
            // A single scalable SVG covers all sizes for Phase 1; swap in real
            // 192/512 PNGs (maskable variants included) before shipping, since
            // iOS/some Android launchers don't rasterize SVG manifest icons.
            { src: `${base}icons/icon.svg`, sizes: "any", type: "image/svg+xml" },
          ],
        },
        workbox: {
          // Content (vocab/decks/lessons) is statically imported into JS chunks
          // at build time, not fetched as separate JSON over the network — so
          // it's already covered by the JS/CSS/HTML precache below and needs no
          // separate runtime-caching rule of its own.
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          runtimeCaching: [
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
  };
});
