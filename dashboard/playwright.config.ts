import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { dashboardTestProjects } from "./tests/support/testFiles.mjs";
import {
  prepareDashboardRun,
  runnerVariables,
} from "./tests/support/runnerConfig.mjs";

// The umbrella run of all three dashboard roots. Its environment scrubbing,
// local full-suite admission, run-stamped output directory, workers,
// deadline and reporters are prepared by ./tests/support/runnerConfig.mjs
// from the OPEN_DOUGH_DASHBOARD_* settings. CI names the times file per shard
// and keeps it as artifact `dashboard-times-<shard>`, the source
// `longest-first` is refreshed from (tests/shards.md).
const run = await prepareDashboardRun(
  runnerVariables("OPEN_DOUGH_DASHBOARD"),
  fileURLToPath(new URL("./", import.meta.url)),
);

export default defineConfig({
  ...run.options,
  testDir: ".",
  projects: dashboardTestProjects(
    new URL("./", import.meta.url),
    run.split,
  ).map((project) => ({ ...project, use: { ...devices["Desktop Chrome"] } })),
  // Page journeys share the app build on demand, then serve it from their
  // own servers. Integrated previews answer through synthetic GitHub
  // (tests/dashboardTest.ts).
  globalSetup: "./tests/support/globalSetup.ts",
});
