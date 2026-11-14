import { defineConfig, devices } from "@playwright/test";
import { prepareFocusedRun } from "../dashboard/tests/support/runnerConfig.mjs";

// E2E Test (`npm run test:e2e`): only the representative workflows under this
// `e2e/` root, with their own OPEN_DOUGH_E2E_* split, times, proof record and
// deadline, their own duration list (./longest-first) and their own run
// directories under `test-results/` here
// (../dashboard/tests/support/runnerConfig.mjs). Its setup prepares what the
// workflows' dashboard servers, Git origins and synthetic hosts serve from
// (../dashboard/tests/support/e2eGlobalSetup.ts). The serial production
// chains queue first as `chromium-deployments` in the same phase
// (../dashboard/tests/support/testFiles.mjs). Its listing, times file and
// duration list name specs relative to this directory.
const run = await prepareFocusedRun(
  "OPEN_DOUGH_E2E",
  new URL("./", import.meta.url),
  ".",
  "longest-first",
);

export default defineConfig({
  ...run.options,
  testDir: ".",
  projects: run.projects.map((project) => ({
    ...project,
    use: { ...devices["Desktop Chrome"] },
  })),
  globalSetup: "../dashboard/tests/support/e2eGlobalSetup.ts",
});
