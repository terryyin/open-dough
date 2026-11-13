import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { dashboardTestMatch } from "./tests/support/testFiles.mjs";
import {
  prepareDashboardRun,
  runnerVariables,
} from "./tests/support/runnerConfig.mjs";

// Dashboard Frontend Test (`npm run test:dashboard:frontend`): only the specs
// under `frontend-tests/`, with their own OPEN_DOUGH_DASHBOARD_FRONTEND_*
// split, times, proof record and deadline, their own run directories under
// `frontend-tests/test-results/` (./tests/support/runnerConfig.mjs), and a
// setup that prepares only the app and comparison mount builds
// (./tests/support/frontendGlobalSetup.ts). Spec labels stay relative to this
// `dashboard/` directory, so the split deals them by the seconds
// `longest-first` records for them.
const variables = runnerVariables("OPEN_DOUGH_DASHBOARD_FRONTEND");
const run = await prepareDashboardRun(
  variables,
  fileURLToPath(new URL("./frontend-tests", import.meta.url)),
);

export default defineConfig({
  ...run.options,
  testDir: ".",
  projects: [
    {
      name: "chromium",
      testMatch: dashboardTestMatch(new URL("./", import.meta.url), run.split, {
        roots: ["frontend-tests"],
        splitVariable: variables.split,
      }),
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: "./tests/support/frontendGlobalSetup.ts",
});
