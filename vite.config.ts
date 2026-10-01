import { fileURLToPath, URL } from "node:url";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

import packageJson from "./package.json" with { type: "json" };

const base = "/react-todo-app/";
const description = "A Liquid Glass ToDo application built with React, Redux Toolkit and Vite.";

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
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
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
        name: "ToDo App",
        short_name: "ToDo",
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
          params: { title: "title", text: "text", url: "url" },
        },
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,avif}"],
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
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/main.tsx", "src/test/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 88,
        branches: 85,
        functions: 85,
        lines: 88,
      },
    },
  },
});
