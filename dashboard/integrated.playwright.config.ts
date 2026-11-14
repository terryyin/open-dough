import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "./tests/support/runnerConfig.mjs";

// Dashboard Integrated UI Test (`npm run test:dashboard:integrated`): the
// interim group of detailed dashboard UI checks under `tests/` that still
// reach a real dashboard server, until they move to Dashboard Frontend Test
// with controlled answers. Only those specs, with their own
// OPEN_DOUGH_DASHBOARD_INTEGRATED_* split, times, proof record and deadline,
// their own duration list (./integrated.longest-first) and their own run
// directories under `tests/test-results/` (./tests/support/runnerConfig.mjs),
// and a setup that prepares what their dashboard servers, Git origins and
// synthetic hosts serve from (./tests/support/integratedGlobalSetup.ts).
const run = await prepareFocusedRun(
  "OPEN_DOUGH_DASHBOARD_INTEGRATED",
  new URL("./", import.meta.url),
  "tests",
  "integrated.longest-first",
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
  globalSetup: "./tests/support/integratedGlobalSetup.ts",
});
