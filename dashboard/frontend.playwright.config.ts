import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "./test-support/support/runnerConfig.mjs";
import { frontendGroup } from "./test-support/support/browserTestGroups.mjs";
import { isMountedSpec } from "./test-support/support/frontendSelection.mjs";

// Retained Playwright specs for Dashboard Frontend Test. The npm command also
// runs mounted specs. Both owners share OPEN_DOUGH_DASHBOARD_FRONTEND_*
// split, times, proof record and deadline, the shards its
// `dashboard-frontend` job declares in ../.github/workflows/ci.yml and their
// own run directories under
// `frontend-tests/test-results/` (./test-support/support/runnerConfig.mjs),
// and a setup that prepares only the app and comparison mount builds
// (./test-support/support/frontendGlobalSetup.ts).
const run = await prepareFocusedRun(
  frontendGroup,
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
  globalSetup: "./test-support/support/frontendGlobalSetup.ts",
});
