// What every dashboard Playwright configuration does for its own run before
// Playwright starts it, and the run options they share. Each configuration
// (../../playwright.config.ts, ../../frontend.playwright.config.ts,
// ../../backend.playwright.config.ts, ../../../e2e/playwright.config.ts)
// names its own settings prefix and output directory and keeps its own global
// setup, so no run reads another runner's split, times, proof record,
// deadline or output directory. A focused runner also selects only its own
// root's specs (prepareFocusedRun).
import { availableParallelism } from "node:os";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { acquireLocalSuite } from "../../../scripts/local-test-suite.mjs";
import { fullDashboardSuite } from "./fullSuiteSelection.mjs";
import { remainingSuiteTime } from "./suiteDeadline.mjs";
import { dashboardTestMatch, dashboardTestProjects } from "./testFiles.mjs";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const dashboard = new URL("../../", import.meta.url);

/**
 * `<prefix>_SPLIT`, `_TIMES`, `_PROOF_RECORD`, `_DEADLINE_MS` and
 * `_RUN_STAMP`: the settings one runner reads.
 * @param {string} prefix
 */
export function runnerVariables(prefix) {
  return {
    split: `${prefix}_SPLIT`,
    times: `${prefix}_TIMES`,
    proofRecord: `${prefix}_PROOF_RECORD`,
    deadline: `${prefix}_DEADLINE_MS`,
    runStamp: `${prefix}_RUN_STAMP`,
  };
}

/**
 * Prepares this process for the run and returns its share and the run
 * options every dashboard configuration shares.
 * @param {ReturnType<typeof runnerVariables>} variables
 * @param {string} outputs absolute directory holding the runner's
 *   `test-results/` run directories and CI `playwright-report/`
 * @returns {Promise<{
 *   split: string | undefined,
 *   options: import("@playwright/test").PlaywrightTestConfig,
 * }>}
 */
export async function prepareDashboardRun(variables, outputs) {
  // Fixtures create independent Git repositories. Inherited repository paths
  // can redirect their writes or make their local transport miss objects, as
  // in the shell runner's isolation (scripts/test-environment.bash).
  for (const name of [
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_COMMON_DIR",
    "GIT_INDEX_FILE",
    "GIT_OBJECT_DIRECTORY",
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  ])
    delete process.env[name];

  // The config is the shared entry for npm and direct Playwright commands.
  // Workers reload it, but only the runner admits a full local run before
  // global setup.
  const runner = process.env["TEST_WORKER_INDEX"] === undefined;
  if (
    runner &&
    !process.env["CI"] &&
    fullDashboardSuite(process.argv.slice(2), process.env, variables.split)
  )
    await acquireLocalSuite(repository);

  // Vite and other descendants may explicitly enable Node's compile cache.
  // Disable writes before global setup and workers start, including when a
  // caller supplied NODE_COMPILE_CACHE. No cache allocation or cleanup is
  // needed.
  process.env["NODE_DISABLE_COMPILE_CACHE"] = "1";

  // Host shells (for example Cursor) often set both FORCE_COLOR and NO_COLOR.
  // Node then warns on stderr; quiet nested runs that expect empty stderr
  // fail. Drop both here so workers and descendant Playwright processes
  // inherit a conflict-free environment. Explicit child env may still set
  // either alone.
  delete process.env["FORCE_COLOR"];
  delete process.env["NO_COLOR"];

  // Each run keeps its retained files in its own directory, named by its
  // start time, because Playwright empties a run's output directory before it
  // starts: a later run from the same checkout then removes only its own
  // (./quietReporter.ts keeps a failed run's directory and removes a passing
  // one's). Workers load the config again; they inherit the runner's
  // environment, so they read the runner's stamp instead of making their own.
  if (runner) {
    // Include pid so two local runs started in the same millisecond
    // (tests/dashboard-concurrent-runs.sh) never share or delete one
    // another's outputDir.
    process.env[variables.runStamp] =
      `${new Date().toISOString().replace(/:/g, "-")}-${String(process.pid)}`;
  }
  const runStamp = process.env[variables.runStamp] ?? "";
  const results = path.join(outputs, "test-results");
  if (runStamp === "") {
    throw new Error(
      `${variables.runStamp} is empty; refusing ${results} as outputDir.`,
    );
  }
  // Playwright may mkdir the stamp directory without creating its parent; a
  // sibling run's cleanup can remove the last stamp and leave the root gone.
  mkdirSync(results, { recursive: true });

  // CI's recorded deadline ends the run, build included, before the job's
  // own bound, so the run fails naming it and keeps what completed
  // (./suiteDeadline.mjs). Without it the run is unbounded.
  const globalTimeout = remainingSuiteTime(process.env[variables.deadline]);
  // Only this configuration grants the requested paths to its own reporter.
  // Custom nested configurations do not acquire an outer run's evidence or
  // times path.
  const quietReporter = [
    fileURLToPath(new URL("./quietReporter.ts", import.meta.url)),
    {
      proofRecord: process.env[variables.proofRecord],
      times: process.env[variables.times],
    },
  ];
  const ci = Boolean(process.env["CI"]);
  return {
    split: process.env[variables.split],
    options: {
      outputDir: path.join(results, runStamp),
      fullyParallel: true,
      // Local runs leave room for neighboring projects. CI keeps every core
      // per job; Playwright's explicit --workers override applies to either
      // default.
      workers: ci ? availableParallelism() : 2,
      forbidOnly: ci,
      ...(globalTimeout === undefined ? {} : { globalTimeout }),
      retries: 0,
      // A passing run prints nothing; a failure, or output from a passing
      // test or from the run itself, fails the run and is shown
      // (./quietReporter.ts). CI also keeps an HTML report, which writes
      // files only.
      reporter: ci
        ? [
            quietReporter,
            [
              "html",
              {
                open: "never",
                outputFolder: path.join(outputs, "playwright-report"),
              },
            ],
          ]
        : [quietReporter],
      use: { trace: "retain-on-failure" },
    },
  };
}

/**
 * Prepares a focused runner's run: it reads only `<prefix>_*` settings,
 * keeps its run directories under its own `root` (relative to `dashboard/`;
 * E2E Test's is the repository's sibling `../e2e`), and selects only that
 * root's specs, dealt by its own `<prefix>_SPLIT`. Spec labels stay relative
 * to `dashboard/`, so the split deals them by the seconds `longest-first`
 * records for them. `projects` partitions the selection into the
 * `chromium-deployments` production chains and the `chromium` rest
 * (./testFiles.mjs).
 * @param {string} prefix
 * @param {string} root
 * @returns {Promise<{
 *   options: import("@playwright/test").PlaywrightTestConfig,
 *   testMatch: RegExp[],
 *   projects: { name: string, testMatch: RegExp[] }[],
 * }>}
 */
export async function prepareFocusedRun(prefix, root) {
  const variables = runnerVariables(prefix);
  const run = await prepareDashboardRun(
    variables,
    fileURLToPath(new URL(`${root}/`, dashboard)),
  );
  const selection = { roots: [root], splitVariable: variables.split };
  return {
    options: run.options,
    testMatch: dashboardTestMatch(dashboard, run.split, selection),
    projects: dashboardTestProjects(dashboard, run.split, selection),
  };
}
