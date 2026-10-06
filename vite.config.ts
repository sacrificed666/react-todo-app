import { fileURLToPath, URL } from "node:url";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

import packageJson from "./package.json" with { type: "json" };

const base = "/tasks/";
const description =
  "A free, private to-do list with projects, smart lists, repeating tasks and a calendar. Works offline in ten languages and keeps your tasks on your device.";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "require-trusted-types-for 'script'",
  "trusted-types default",
  "upgrade-insecure-requests",
].join("; ");

// Adds the CSP and the referrer policy to the built page
const securityHeaders = (): Plugin => ({
  name: "security-headers",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler: () => [
      {
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: contentSecurityPolicy },
        injectTo: "head-prepend",
      },
      { tag: "meta", attrs: { name: "referrer", content: "strict-origin-when-cross-origin" }, injectTo: "head" },
    ],
  },
});

export default defineConfig({
  base,
  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    securityHeaders(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        id: base,
        name: "Tasks",
        short_name: "Tasks",
        description,
        lang: "en",
        dir: "ltr",
        start_url: base,
        scope: base,
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        orientation: "any",
        categories: ["productivity", "utilities"],
        theme_color: "#070a14",
        background_color: "#070a14",
        shortcuts: [
          {
            name: "New task",
            short_name: "New",
            url: `${base}?action=new`,
            icons: [{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          { name: "Today", url: `${base}?list=today` },
          { name: "Important", url: `${base}?list=important` },
        ],
        share_target: {
          action: base,
          method: "GET",
          enctype: "application/x-www-form-urlencoded",
          params: { title: "title", text: "text", url: "url" },
        },
        screenshots: [
          {
            src: "screenshots/wide.jpg",
            sizes: "1280x800",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Smart lists, projects, the task list and the overview",
          },
          {
            src: "screenshots/narrow.jpg",
            sizes: "780x1688",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "Today with overdue tasks and the tab bar",
          },
        ],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,avif,woff2}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/main.tsx", "src/test/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
