import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: { tsconfigPaths: true },
    test: {
      // Browser tests retain their single-worker Playwright runner.
      exclude: [...configDefaults.exclude, "test/e2e/**"],
    },
  }),
);
