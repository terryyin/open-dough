// What every test group's Playwright configuration does for its own run
// before Playwright starts it, and the run options they share. Each
// configuration (../../backend.playwright.config.ts,
// ../../../e2e/playwright.config.ts)
// runs its own group (./browserTestGroups.mjs) with its own settings prefix,
// root, CI job and output directory and keeps its own global setup, so no
// run reads another runner's split, times, proof record, deadline or output
// directory, and each selects only its own root's specs (prepareFocusedRun).
import { availableParallelism, homedir, tmpdir } from "node:os";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dashboardBrowserArgs } from "./browserArgs.ts";
import { acquireLocalSuite } from "../../../scripts/local-test-suite.mjs";
import { fullDashboardSuite } from "./fullSuiteSelection.mjs";
import { remainingSuiteTime } from "./suiteDeadline.mjs";
import { browserGroupSelection } from "./browserTestGroups.mjs";
import {
  groupOutputs,
  groupRunSettings,
  runnerVariables,
} from "./runnerSettings.mjs";
import {
  dashboardTestMatch,
  dashboardTestProjects,
  runOutputs,
} from "./testFiles.mjs";

const repository = fileURLToPath(new URL("../../../", import.meta.url));

export function useDisposableTestHome() {
  // Browser runners still need the browser registry from the original home.
  const browserPath =
    process.env["PLAYWRIGHT_BROWSERS_PATH"] ??
    process.env["npm_config_playwright_browsers_path"] ??
    process.env["npm_package_config_playwright_browsers_path"];
  if (!browserPath) {
    const home = homedir();
    const cache =
      process.platform === "darwin"
        ? path.join(home, "Library", "Caches")
        : process.platform === "win32"
          ? process.env["LOCALAPPDATA"] || path.join(home, "AppData", "Local")
          : process.env["XDG_CACHE_HOME"] || path.join(home, ".cache");
    process.env["PLAYWRIGHT_BROWSERS_PATH"] = path.join(cache, "ms-playwright");
  }

  const home = mkdtempSync(path.join(tmpdir(), "dough-dashboard-test-home-"));
  process.env["HOME"] = home;
  if (process.platform === "win32") process.env["USERPROFILE"] = home;
  process.once("exit", () => rmSync(home, { recursive: true, force: true }));
}

/**
 * Prepares this process for the run: its isolated environment, local suite
 * admission and run stamp (groupRunOptions reads the result).
 * @param {ReturnType<typeof runnerVariables>} variables
 * @param {string} outputs absolute directory holding the runner's
 *   `test-results/` run directories and CI `playwright-report/` directories
 * @returns {Promise<void>}
 */
async function prepareGroupRun(variables, outputs) {
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
  if (runner) useDisposableTestHome();
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
    // (Distribution/tests/test-runner/dashboard-concurrent-runs.sh) never share or delete one
    // another's outputDir.
    process.env[variables.runStamp] =
      `${new Date().toISOString().replace(/:/g, "-")}-${String(process.pid)}`;
  }
  const results = path.join(outputs, runOutputs.results);
  if ((process.env[variables.runStamp] ?? "") === "") {
    throw new Error(
      `${variables.runStamp} is empty; refusing ${results} as outputDir.`,
    );
  }
  // Playwright may mkdir the stamp directory without creating its parent; a
  // sibling run's cleanup can remove the last stamp and leave the root gone.
  mkdirSync(results, { recursive: true });
}

/**
 * The share and run options `group`'s runner takes from `env`: only its own
 * settings (groupRunSettings), and an output directory under its own
 * `test-results/` named by its own run stamp.
 * @param {import("./browserTestGroups.mjs").BrowserTestGroup} group
 * @param {Record<string, string | undefined>} env
 * @returns {{
 *   split: string | undefined,
 *   ci: boolean,
 *   options: import("@playwright/test").PlaywrightTestConfig,
 * }}
 */
function groupRunOptions(group, env) {
  const settings = groupRunSettings(group, env);
  const outputs = groupOutputs(group);
  const runStamp = settings.runStamp ?? "";
  // CI's recorded deadline ends the run, build included, before the job's
  // own bound, so the run fails naming it and keeps what completed
  // (./suiteDeadline.mjs). Without it the run is unbounded.
  const globalTimeout = remainingSuiteTime(
    settings.deadline,
    settings.names.deadline,
  );
  // Only this configuration grants the requested paths to its own reporter.
  // Custom nested configurations do not acquire an outer run's evidence or
  // times path.
  const quietReporter = [
    fileURLToPath(new URL("./quietReporter.ts", import.meta.url)),
    {
      proofRecord: settings.proofRecord,
      times: settings.times,
    },
  ];
  const ci = Boolean(env["CI"]);
  return {
    split: settings.split,
    ci,
    options: {
      outputDir: path.join(outputs, runOutputs.results, runStamp),
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
                outputFolder: path.join(outputs, runOutputs.report, runStamp),
              },
            ],
          ]
        : [quietReporter],
      // Every group's browsers start with the shared arguments
      // (./browserArgs.ts).
      use: {
        trace: "retain-on-failure",
        launchOptions: { args: dashboardBrowserArgs },
      },
    },
  };
}

/**
 * Prepares `group`'s run (./browserTestGroups.mjs): it reads only
 * `<prefix>_*` settings, keeps its run directories under its own `root` of
 * `directory` (the configuration's testDir; `.` is the directory itself),
 * and selects only that root's specs `include` accepts: shard i of
 * `<prefix>_SPLIT=<i>/<n>` as its CI `job` in .github/workflows/ci.yml
 * declares it, or every spec without a split. Spec labels are relative to
 * `directory`, as its times file names them. `projects` partitions the
 * selection into the `chromium-deployments` production chains and the
 * `chromium` rest (./testFiles.mjs).
 * @param {import("./browserTestGroups.mjs").BrowserTestGroup} group
 * @param {(file: string) => boolean} [include]
 * @returns {Promise<{
 *   options: import("@playwright/test").PlaywrightTestConfig,
 *   testMatch: RegExp[],
 *   projects: { name: string, testMatch: RegExp[] }[],
 * }>}
 */
export async function prepareFocusedRun(group, include) {
  await prepareGroupRun(runnerVariables(group.prefix), groupOutputs(group));
  return focusedRun(group, process.env, { include });
}

/**
 * `group`'s run as its configuration takes it from `env` once prepared
 * (prepareFocusedRun): its own options and spec selection.
 * @param {import("./browserTestGroups.mjs").BrowserTestGroup} group
 * @param {Record<string, string | undefined>} env
 * @param {{
 *   include?: (file: string) => boolean,
 *   files?: string[],
 *   declaration?: object,
 * }} [selected] the engine filter, and the spec labels and parsed shard
 *   declaration when not read from the filesystem and ci.yml (testFiles.mjs)
 */
export function focusedRun(group, env, selected = {}) {
  const { directory } = group;
  const run = groupRunOptions(group, env);
  const selection = { ...browserGroupSelection(group), ...selected };
  return {
    options: run.options,
    testMatch: dashboardTestMatch(directory, run.split, selection),
    projects: dashboardTestProjects(directory, run.split, selection, run.ci),
  };
}
