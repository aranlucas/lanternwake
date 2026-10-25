import { configDefaults, defineConfig } from "vitest/config";

// The deterministic game tests do not build or register the offline service worker.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // Browser tests retain their single-worker Playwright runner.
    exclude: [...configDefaults.exclude, "test/e2e/**"],
  },
});
