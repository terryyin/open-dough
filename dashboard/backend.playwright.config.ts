import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "./tests/support/runnerConfig.mjs";

// Dashboard Backend Test (`npm run test:dashboard:backend`): only the specs
// under `backend-tests/`, with their own OPEN_DOUGH_DASHBOARD_BACKEND_*
// split, times, proof record and deadline, their own duration list
// (./backend.longest-first) and their own run directories under
// `backend-tests/test-results/` (./tests/support/runnerConfig.mjs),
// and a setup that prepares only what backend specs serve from
// (./tests/support/backendGlobalSetup.ts).
const run = await prepareFocusedRun(
  "OPEN_DOUGH_DASHBOARD_BACKEND",
  new URL("./", import.meta.url),
  "backend-tests",
  "backend.longest-first",
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
  globalSetup: "./tests/support/backendGlobalSetup.ts",
});
