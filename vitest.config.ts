import { configDefaults, defineConfig } from "vitest/config";

// The deterministic game tests do not build or register the offline service worker.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    exclude: [...configDefaults.exclude, "test/e2e/**"],
  },
});
