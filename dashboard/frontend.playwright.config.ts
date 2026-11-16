import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "./tests/support/runnerConfig.mjs";

// Dashboard Frontend Test (`npm run test:dashboard:frontend`): only the specs
// under `frontend-tests/`, with their own OPEN_DOUGH_DASHBOARD_FRONTEND_*
// split, times, proof record and deadline, the one shard its
// `dashboard-frontend` job declares in ../.github/workflows/ci.yml and their
// own run directories under
// `frontend-tests/test-results/` (./tests/support/runnerConfig.mjs),
// and a setup that prepares only the app and comparison mount builds
// (./tests/support/frontendGlobalSetup.ts).
const run = await prepareFocusedRun(
  "OPEN_DOUGH_DASHBOARD_FRONTEND",
  new URL("./", import.meta.url),
  "frontend-tests",
  "dashboard-frontend",
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
