import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "./tests/support/runnerConfig.mjs";
import {
  frontendGroup,
  isMountedSpec,
} from "./tests/support/frontendSelection.mjs";

// Retained Playwright specs for Dashboard Frontend Test. The npm command also
// runs mounted specs. Both owners share OPEN_DOUGH_DASHBOARD_FRONTEND_*
// split, times, proof record and deadline, the shards its
// `dashboard-frontend` job declares in ../.github/workflows/ci.yml and their
// own run directories under
// `frontend-tests/test-results/` (./tests/support/runnerConfig.mjs),
// and a setup that prepares only the app and comparison mount builds
// (./tests/support/frontendGlobalSetup.ts).
const run = await prepareFocusedRun(
  frontendGroup.prefix,
  new URL("./", import.meta.url),
  frontendGroup.root,
  frontendGroup.job,
  (file) => !isMountedSpec(file),
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
