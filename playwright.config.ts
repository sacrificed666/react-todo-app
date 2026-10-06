import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/react-todo-app/`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    locale: "en-GB",
    timezoneId: "Europe/Kyiv",
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", testIgnore: /lighthouse/, use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", testIgnore: /lighthouse/, use: { ...devices["Pixel 7"] } },
    { name: "lighthouse", testMatch: /lighthouse\.spec\.ts/, dependencies: ["desktop", "mobile"] },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    timeout: 300_000,
    reuseExistingServer: !CI,
  },
});
