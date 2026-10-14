import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4317",
    browserName: "chromium",
    viewport: { width: 1536, height: 1024 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
