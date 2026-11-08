import { mkdirSync } from "node:fs";
import { availableParallelism } from "node:os";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { remainingSuiteTime } from "./tests/support/suiteDeadline.mjs";
import { dashboardTestProjects } from "./tests/support/testFiles.mjs";
import type { QuietReporterOptions } from "./tests/support/quietReporter.ts";
import { acquireLocalSuite } from "../scripts/local-test-suite.mjs";
import { fullDashboardSuite } from "./tests/support/fullSuiteSelection.mjs";

// Fixtures create independent Git repositories. Inherited repository paths
// can redirect their writes or make their local transport miss objects, as in
// the shell runner's isolation (scripts/test-environment.bash).
delete process.env["GIT_DIR"];
delete process.env["GIT_WORK_TREE"];
delete process.env["GIT_COMMON_DIR"];
delete process.env["GIT_INDEX_FILE"];
delete process.env["GIT_OBJECT_DIRECTORY"];
delete process.env["GIT_ALTERNATE_OBJECT_DIRECTORIES"];

// Config is the shared entry for npm and direct Playwright commands. Workers
// reload it, but only the runner admits a full local run before global setup.
if (
  process.env["TEST_WORKER_INDEX"] === undefined &&
  !process.env["CI"] &&
  fullDashboardSuite()
) {
  await acquireLocalSuite(fileURLToPath(new URL("../", import.meta.url)));
}

// Vite and other descendants may explicitly enable Node's compile cache.
// Disable writes before global setup and workers start, including when a
// caller supplied NODE_COMPILE_CACHE. No cache allocation or cleanup is needed.
process.env["NODE_DISABLE_COMPILE_CACHE"] = "1";

// Host shells (for example Cursor) often set both FORCE_COLOR and NO_COLOR.
// Node then warns on stderr; quiet nested runs that expect empty stderr fail.
// Drop both here so workers and descendant Playwright processes inherit a
// conflict-free environment. Explicit child env may still set either alone.
delete process.env["FORCE_COLOR"];
delete process.env["NO_COLOR"];

// Each run keeps its retained files in its own directory, named by its start
// time, because Playwright empties a run's output directory before it starts:
// a later run from the same checkout then removes only its own
// (tests/support/quietReporter.ts keeps a failed run's directory and removes
// a passing one's). Workers load this config again; they inherit the
// runner's environment, so they read the runner's stamp instead of making
// their own.
const runStampVariable = "OPEN_DOUGH_DASHBOARD_RUN_STAMP";
if (process.env["TEST_WORKER_INDEX"] === undefined) {
  // Include pid so two local dashboard runs started in the same millisecond
  // (dashboard-concurrent-runs) never share or delete one another's outputDir.
  process.env[runStampVariable] =
    `${new Date().toISOString().replace(/:/g, "-")}-${String(process.pid)}`;
}
const runStamp = process.env[runStampVariable] ?? "";
if (runStamp === "") {
  throw new Error(
    "OPEN_DOUGH_DASHBOARD_RUN_STAMP is empty; refusing ./test-results as outputDir.",
  );
}
// Playwright may mkdir the stamp directory without creating its parent; a
// sibling run's cleanup can remove the last stamp and leave test-results gone.
mkdirSync(fileURLToPath(new URL("./test-results", import.meta.url)), {
  recursive: true,
});

const suiteTime = remainingSuiteTime(
  process.env["OPEN_DOUGH_DASHBOARD_DEADLINE_MS"],
);
// Only this configuration grants the requested paths to its own reporter.
// Custom nested configurations do not acquire an outer run's evidence or
// times path. CI names the times file per shard and keeps it as artifact
// `dashboard-times-<shard>`, the source `longest-first` is refreshed
// from (tests/shards.md).
const proofRecord = process.env["OPEN_DOUGH_DASHBOARD_PROOF_RECORD"];
const times = process.env["OPEN_DOUGH_DASHBOARD_TIMES"];
const quietReporter: [string, QuietReporterOptions] = [
  "./tests/support/quietReporter.ts",
  { proofRecord, times },
];

export default defineConfig({
  testDir: ".",
  outputDir: `./test-results/${runStamp}`,
  fullyParallel: true,
  // Local runs leave room for neighboring projects. CI keeps every core per
  // shard; Playwright's explicit --workers override applies to either default.
  workers: process.env["CI"] ? availableParallelism() : 2,
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
    new URL("./", import.meta.url),
    process.env["OPEN_DOUGH_DASHBOARD_SPLIT"],
  ).map((project) => ({ ...project, use: { ...devices["Desktop Chrome"] } })),
  // Page journeys share the app build on demand, then serve it from their
  // own servers. Integrated previews answer through synthetic GitHub
  // (tests/dashboardTest.ts).
  globalSetup: "./tests/support/globalSetup.ts",
});
