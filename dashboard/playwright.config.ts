import { availableParallelism } from "node:os";
import { defineConfig, devices } from "@playwright/test";
import { remainingSuiteTime } from "./tests/support/suiteDeadline.mjs";
import { dashboardTestProjects } from "./tests/support/testFiles.mjs";
import type { QuietReporterOptions } from "./tests/support/quietReporter.ts";

// Vite and other descendants may explicitly enable Node's compile cache.
// Disable writes before global setup and workers start, including when a
// caller supplied NODE_COMPILE_CACHE. No cache allocation or cleanup is needed.
process.env["NODE_DISABLE_COMPILE_CACHE"] = "1";

// Each run keeps its retained files in its own directory, named by its start
// time, because Playwright empties a run's output directory before it starts:
// a later run from the same checkout then removes only its own
// (tests/support/quietReporter.ts keeps a failed run's directory and removes
// a passing one's). Workers load this config again; they inherit the
// runner's environment, so they read the runner's stamp instead of making
// their own.
const runStampVariable = "OPEN_DOUGH_DASHBOARD_RUN_STAMP";
if (process.env["TEST_WORKER_INDEX"] === undefined) {
  process.env[runStampVariable] = new Date().toISOString().replace(/:/g, "-");
}
const runStamp = process.env[runStampVariable] ?? "";

const suiteTime = remainingSuiteTime(
  process.env["OPEN_DOUGH_DASHBOARD_DEADLINE_MS"],
);
// Only this configuration grants the requested paths to its own reporter.
// Custom nested configurations do not acquire an outer run's evidence or
// times path. CI names the times file per shard and keeps it as artifact
// `dashboard-times-<shard>`, the source `tests/longest-first` is refreshed
// from (tests/shards.md).
const proofRecord = process.env["OPEN_DOUGH_DASHBOARD_PROOF_RECORD"];
const times = process.env["OPEN_DOUGH_DASHBOARD_TIMES"];
const quietReporter: [string, QuietReporterOptions] = [
  "./tests/support/quietReporter.ts",
  { proofRecord, times },
];

export default defineConfig({
  testDir: "./tests",
  outputDir: `./test-results/${runStamp}`,
  fullyParallel: true,
  // Playwright's default uses half the cores. Each CI dashboard shard job must
  // finish within the CI verdict target, so there it uses every core; local
  // runs keep the default.
  ...(process.env["CI"] ? { workers: availableParallelism() } : {}),
  forbidOnly: Boolean(process.env["CI"]),
  // CI's recorded deadline ends the run, build included, before the job's
  // own bound, so the run fails naming it and keeps what completed
  // (tests/support/suiteDeadline.mjs). Without it the run is unbounded.
  ...(suiteTime === undefined ? {} : { globalTimeout: suiteTime }),
  retries: 0,
  // A passing run prints nothing; a failure, or output from a passing test
  // or from the run itself, fails the run and is shown
  // (tests/support/quietReporter.ts). CI also keeps an HTML report, which
  // writes files only.
  reporter: process.env["CI"]
    ? [
        quietReporter,
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : [quietReporter],
  use: {
    trace: "retain-on-failure",
  },
  projects: dashboardTestProjects(
    new URL("./tests/", import.meta.url),
    process.env["OPEN_DOUGH_DASHBOARD_SPLIT"],
  ).map((project) => ({ ...project, use: { ...devices["Desktop Chrome"] } })),
  // Every run builds the production app once; each page journey then serves
  // that build from its own preview server, whose `gh` is a synthetic one
  // answering from that test's own fake GitHub (tests/dashboardTest.ts).
  globalSetup: "./tests/support/globalSetup.ts",
});
