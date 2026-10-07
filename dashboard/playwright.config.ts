import { availableParallelism } from "node:os";
import { defineConfig, devices } from "@playwright/test";
import { remainingSuiteTime } from "./tests/support/suiteDeadline.mjs";
import { dashboardTestMatch } from "./tests/support/testFiles.mjs";

const suiteTime = remainingSuiteTime(
  process.env["OPEN_DOUGH_DASHBOARD_DEADLINE_MS"],
);

export default defineConfig({
  testDir: "./tests",
  ...(process.env["OPEN_DOUGH_DASHBOARD_SPLIT"]
    ? {
        testMatch: dashboardTestMatch(
          new URL("./tests/", import.meta.url),
          process.env["OPEN_DOUGH_DASHBOARD_SPLIT"],
        ),
      }
    : {}),
  outputDir: "./test-results",
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
        ["./tests/support/quietReporter.ts"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : [["./tests/support/quietReporter.ts"]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Every run builds the production app once; each page journey then serves
  // that build from its own preview server, whose `gh` is a synthetic one
  // answering from that test's own fake GitHub (tests/dashboardTest.ts).
  globalSetup: "./tests/support/globalSetup.ts",
});
