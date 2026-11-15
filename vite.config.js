import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			devOptions: {
				enabled: true, // Enable PWA in development mode also
			},
			includeAssets: [
				"/logo.svg",
				"/favicon.ico",
				"/favicon-16x16.png",
				"/favicon-32x32.png",
				"/apple-touch-icon.png",
				"/android-chrome-192x192.png",
				"/android-chrome-512x512.png",
			],
			manifest: false,
			workbox: {
				// Only the app shell is downloaded during install. Route chunks,
				// images and other assets are cached the first time they are used.
				globPatterns: [
					"index.html",
					"manifest.json",
					"appName.js",
					"assets/index-*.js",
					"assets/index-*.css",
					"assets/workbox-window.prod.es5-*.js",
				],
				navigateFallback: "index.html",
				navigateFallbackDenylist: [/^\/api\//],
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					{
						// Hashed Vite chunks are immutable, so cache them forever
						// (with an entry cap) after the user visits the route.
						urlPattern: /\/assets\/.*\.(?:js|css)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "route-assets",
							matchOptions: { ignoreVary: true },
							expiration: {
								maxEntries: 40,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "images",
							matchOptions: { ignoreVary: true },
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						// Anchor to the real API path. A plain /\/api\// pattern also
						// matches source modules such as /src/.../api/menuApi.js in dev.
						urlPattern: /^https?:\/\/[^/]+\/api\//,
						handler: "NetworkOnly",
					},
				],
			},
		}),
	],
});
