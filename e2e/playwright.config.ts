import { defineConfig, devices } from "@playwright/test";
import { e2eGroup } from "../dashboard/test-support/support/browserTestGroups.mjs";
import { prepareFocusedRun } from "../dashboard/test-support/support/runnerConfig.mjs";

// E2E Test (`npm run test:e2e`): only the representative workflows under this
// `e2e/` root, with their own OPEN_DOUGH_E2E_* split, times, proof record and
// deadline, the shards its `e2e` job declares in ../.github/workflows/ci.yml
// and their own run directories under `test-results/` here
// (../dashboard/test-support/support/runnerConfig.mjs). Its setup prepares what the
// workflows' dashboard servers, Git origins and synthetic hosts serve from
// (../dashboard/test-support/support/e2eGlobalSetup.ts). The serial production
// chains queue first as `chromium-deployments` in the same phase, inside
// whichever shard holds them (../dashboard/test-support/support/testFiles.mjs). Its
// listing and times file name specs relative to this directory.
const run = await prepareFocusedRun(e2eGroup);

export default defineConfig({
  ...run.options,
  testDir: ".",
  projects: run.projects.map((project) => ({
    ...project,
    use: { ...devices["Desktop Chrome"] },
  })),
  globalSetup: "../dashboard/test-support/support/e2eGlobalSetup.ts",
});
