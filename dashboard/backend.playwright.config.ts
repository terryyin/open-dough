import { defineConfig, devices } from "@playwright/test";
import { backendGroup } from "./test-support/support/browserTestGroups.mjs";
import { prepareFocusedRun } from "./test-support/support/runnerConfig.mjs";

// Dashboard Backend Test (`npm run test:dashboard:backend`): only the specs
// under `backend-tests/`, with their own OPEN_DOUGH_DASHBOARD_BACKEND_*
// split, times, proof record and deadline, the shards its
// `dashboard-backend` job declares in ../.github/workflows/ci.yml and their
// own run directories under
// `backend-tests/test-results/` (./test-support/support/runnerConfig.mjs),
// and a setup that prepares only what backend specs serve from
// (./test-support/support/backendGlobalSetup.ts).
const run = await prepareFocusedRun(backendGroup);

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
  globalSetup: "./test-support/support/backendGlobalSetup.ts",
});
