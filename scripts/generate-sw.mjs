import { generateSW } from "workbox-build";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = join(rootDir, "dist/client");

const { count, warnings } = await generateSW({
  globDirectory: clientDir,
  globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,woff2,webmanifest,txt}"],
  swDest: join(clientDir, "sw.js"),
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "velin-pages",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: "velin-images",
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

if (warnings.length > 0) {
  console.warn("[generate-sw]", warnings.join("\n"));
}

console.log(`[generate-sw] dist/client/sw.js (${count} precached files)`);
