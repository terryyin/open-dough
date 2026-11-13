import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "./tests/support/runnerConfig.mjs";

// Dashboard Frontend Test (`npm run test:dashboard:frontend`): only the specs
// under `frontend-tests/`, with their own OPEN_DOUGH_DASHBOARD_FRONTEND_*
// split, times, proof record and deadline and their own run directories
// under `frontend-tests/test-results/` (./tests/support/runnerConfig.mjs),
// and a setup that prepares only the app and comparison mount builds
// (./tests/support/frontendGlobalSetup.ts).
const run = await prepareFocusedRun(
  "OPEN_DOUGH_DASHBOARD_FRONTEND",
  "frontend-tests",
);

export default defineConfig({
  ...run.options,
  testDir: ".",
  projects: [
    {
      name: "chromium",
      testMatch: run.testMatch,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: "./tests/support/frontendGlobalSetup.ts",
});
