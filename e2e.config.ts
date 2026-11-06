import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

export default {
  tests: "test/journeys/**/*.e2e.ts",
  targets: [
    {
      name: "chromium",
      engine: web({ viewport: { width: 1536, height: 1024 }, reducedMotion: "reduce" }),
      app: {
        url: "http://127.0.0.1:4317",
        command: { executable: "node", args: ["scripts/serve.mjs"], log: ".e2e/logs/app.log" },
      },
    },
  ],
  workers: 1,
  retries: 0,
  timeout: 30_000,
  actionTimeout: 5_000,
  trace: "retain-on-failure",
  reporters: ["list", "junit"],
} satisfies E2EConfig;
