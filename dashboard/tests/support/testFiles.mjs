import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, posix, relative, resolve, sep } from "node:path";
import {
  dealShares,
  parseSplit,
  readDurationList,
  shareLabels,
} from "../../../scripts/share-deal.mjs";
import { readShareDeclaration } from "../../../scripts/test-share-declaration.mjs";
import {
  selectShare,
  shareOfSplit,
} from "../../../scripts/test-share-matrix.mjs";

// The directories a run writes beside its specs: each runner keeps its
// `test-results/<stamp>/` run directories and CI `playwright-report/<stamp>/` in its
// own root (./runnerConfig.mjs). Playwright adds and deletes trace files there
// while workers, which load the configuration again, discover specs.
export const runOutputs = {
  results: "test-results",
  report: "playwright-report",
};
const outputNames = new Set(Object.values(runOutputs));

// Every spec file below `directory`, as posix paths prefixed by `label`,
// without entering a run's output.
function specTree(directory, label) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = posix.join(label, entry.name);
    if (!entry.isDirectory())
      return /\.(spec|test)\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
    return outputNames.has(entry.name)
      ? []
      : specTree(resolve(directory, entry.name), path);
  });
}

// The specs under `roots` of a runner's `directory` (its configuration's
// testDir), as paths relative to it: the labels its duration list and its
// `<group>-times-<shard>` artifacts carry (support/specTimes.ts writes the
// same relative path). A root of `.` is the directory itself. Each runner
// names its own roots (../../integrated.playwright.config.ts,
// ../../frontend.playwright.config.ts, ../../backend.playwright.config.ts,
// ../../../e2e/playwright.config.ts).
export function dashboardSpecFiles(directory, roots) {
  return roots
    .flatMap((root) =>
      existsSync(resolve(directory, root))
        ? specTree(resolve(directory, root), root)
        : [],
    )
    .sort();
}

// The files of `directory` (relative to it) that shard `split` of `job` in
// `workflow` runs: scripts/test-share-matrix.mjs selects them from the job's
// declared patterns (scripts/test-share-declaration.mjs reads them), the one
// rule the Distribution shares use. The patterns are relative to the
// repository holding `workflow` at `.github/workflows/`, so each file is
// matched under its repository-relative label. Without a split every file is
// returned; either way an overlap, a pattern matching no spec, or a split
// whose n is not the declared shard count throws, naming it, before any test
// is selected.
function declaredShardFiles(directory, files, split, selection) {
  const { workflow, job, splitVariable } = selection;
  const workflowPath = fileURLToPath(workflow);
  const repository = fileURLToPath(new URL("../../", workflow));
  const label = (path) => relative(repository, path).split(sep).join("/");
  const declaration = readShareDeclaration(
    readFileSync(workflowPath, "utf8"),
    label(workflowPath),
    job,
  );
  const share =
    split === undefined
      ? undefined
      : shareOfSplit(declaration, split, splitVariable);
  const labelled = new Map(
    files.map((file) => [label(resolve(directory, file)), file]),
  );
  return selectShare(declaration, [...labelled.keys()], share).map((label) =>
    labelled.get(label),
  );
}

// Selected spec files for share `split` (`<i>/<n>`, the value of the
// runner's `splitVariable`) under `testDir`'s `roots`. A selection naming a
// `workflow` (file URL) and `job` runs that job's declared shard
// (declaredShardFiles). Until the configurations name their job, one naming
// `durations` gets the files scripts/share-deal.mjs deals to that share by
// the recorded seconds in the runner's own duration list, `durations`
// relative to `testDir` (shards.md); a malformed split or list line throws,
// naming it, before any test is selected. A selection naming neither, as
// fixture runs use, gets every file.
/** @returns {string[]} */
function selectedFiles(testDir, split, selection) {
  const { roots, splitVariable, durations, job } = selection;
  const directory = fileURLToPath(testDir);
  const files = dashboardSpecFiles(directory, roots);
  if (job !== undefined)
    return declaredShardFiles(directory, files, split, selection);
  if (split === undefined || durations === undefined) return files;
  const { share, count } = parseSplit(split, splitVariable);
  const { seconds } = readDurationList(resolve(directory, durations));
  const allocation = dealShares(files, seconds, count);
  return shareLabels(allocation, share);
}

function filePatterns(testDir, files) {
  const directory = fileURLToPath(testDir);
  return files.map(
    (file) =>
      new RegExp(
        `^${resolve(directory, file).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      ),
  );
}

// Selection and dispatch have different jobs: the declared shard (or, until
// the configurations name their job, the duration deal) chooses each file's
// shard; native projects queue the long, serial production chains
// (E2E Test's `production-watcher*.spec.ts`) first in the same phase. Local
// chains share one worker so real installs and builds leave the other global
// worker for ordinary checks; CI keeps its concurrency. No dependency makes ordinary checks wait for those chains. Complementary
// matches retain exactly one execution of every selected file. `selection`
// names a runner's own `roots` and `splitVariable`, and its `workflow` and
// `job` or its `durations` (selectedFiles).
export function dashboardTestProjects(testDir, split, selection) {
  const files = selectedFiles(testDir, split, selection);
  const isProductionChain = (file) =>
    /^production-watcher(?:-.*)?\.spec\.ts$/.test(basename(file));
  return [
    {
      name: "chromium-deployments",
      ...(process.env["CI"] ? {} : { workers: 1 }),
      testMatch: filePatterns(testDir, files.filter(isProductionChain)),
    },
    {
      name: "chromium",
      testMatch: filePatterns(
        testDir,
        files.filter((file) => !isProductionChain(file)),
      ),
    },
  ];
}

// `selection` names a runner's own `roots` and `splitVariable`, and its
// `workflow` and `job` or its `durations` (selectedFiles).
/** @returns {RegExp[]} */
export function dashboardTestMatch(testDir, split, selection) {
  return filePatterns(testDir, selectedFiles(testDir, split, selection));
}
