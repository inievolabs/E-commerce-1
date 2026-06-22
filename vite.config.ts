// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

import {
  PWA_APP_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_ICONS,
  PWA_SHORT_NAME,
  PWA_THEME_COLOR,
} from "./src/lib/pwa-config";

export default defineConfig({
  // Force Nitro Cloudflare bundling for self-hosted deploy (outside Lovable sandbox).
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["robots.txt", PWA_ICONS.icon192, PWA_ICONS.icon512, PWA_ICONS.appleTouchIcon],
      manifest: {
        name: PWA_APP_NAME,
        short_name: PWA_SHORT_NAME,
        description: PWA_DESCRIPTION,
        theme_color: PWA_THEME_COLOR,
        background_color: PWA_BACKGROUND_COLOR,
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: PWA_ICONS.icon192,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: PWA_ICONS.icon512,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: PWA_ICONS.icon512,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
