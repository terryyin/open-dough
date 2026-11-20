import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, posix, relative, resolve, sep } from "node:path";
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
// testDir), as paths relative to it: the labels its
// `<group>-times-<shard>` artifacts carry (support/specTimes.ts writes the
// same relative path). A root of `.` is the directory itself. Each runner
// names its own roots (../../frontend.playwright.config.ts,
// ../../backend.playwright.config.ts, ../../../e2e/playwright.config.ts).
/**
 * @param {string} directory
 * @param {string[]} roots
 * @returns {string[]}
 */
export function dashboardSpecFiles(directory, roots) {
  return roots
    .flatMap((root) =>
      existsSync(resolve(directory, root))
        ? specTree(resolve(directory, root), root)
        : [],
    )
    .sort();
}

// A path's label relative to the repository holding `workflow` at
// `.github/workflows/`, as declared patterns name files.
function repositoryLabel(workflow) {
  const repository = fileURLToPath(new URL("../../", workflow));
  return (path) => relative(repository, path).split(sep).join("/");
}

// `job`'s shard declaration in `workflow`, named in refusals by its
// repository-relative path.
function readDeclaration({ workflow, job }) {
  const path = fileURLToPath(workflow);
  return readShareDeclaration(
    readFileSync(path, "utf8"),
    repositoryLabel(workflow)(path),
    job,
  );
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
  const { workflow, splitVariable } = selection;
  const label = repositoryLabel(workflow);
  const declaration = readDeclaration(selection);
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

// The workflow whose browser group jobs declare each group's shards.
const ciWorkflow = new URL(
  "../../../.github/workflows/ci.yml",
  import.meta.url,
);

/**
 * A group's selection as its configuration makes it: its `root`, read with
 * its own `splitVariable`, sharded as its CI `job` declares in
 * .github/workflows/ci.yml.
 * @param {string} root
 * @param {string} splitVariable
 * @param {string} job
 */
export function ciGroupSelection(root, splitVariable, job) {
  return { roots: [root], splitVariable, workflow: ciWorkflow, job };
}

// Selected spec files for shard `split` (`<i>/<n>`, the value of the
// runner's `splitVariable`) under `testDir`'s `roots`. A selection naming a
// `workflow` (file URL) and `job`, as every group's configuration does, runs
// that job's declared shard (declaredShardFiles). A selection naming no job,
// as fixture runs use, gets every file.
/** @returns {string[]} */
export function selectedFiles(testDir, split, selection) {
  const { roots, job } = selection;
  const directory = fileURLToPath(testDir);
  const files = dashboardSpecFiles(directory, roots);
  return job === undefined
    ? files
    : declaredShardFiles(directory, files, split, selection);
}

/**
 * The shards `job` declares in `workflow` (a selection's), in listed order.
 * @param {{ workflow: URL, job: string }} selection
 * @returns {string[]}
 */
export function declaredShards(selection) {
  return readDeclaration(selection).shares;
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

// Selection and dispatch have different jobs: the declared shard chooses
// each file's shard; native projects queue the long, serial production chains
// (E2E Test's `production-watcher*.spec.ts`) first in the same phase. Local
// chains share one worker so real installs and builds leave the other global
// worker for ordinary checks; CI keeps its concurrency. No dependency makes ordinary checks wait for those chains. Complementary
// matches retain exactly one execution of every selected file. `selection`
// names a runner's own `roots` and `splitVariable`, and its `workflow` and
// `job` (selectedFiles).
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
// `workflow` and `job` (selectedFiles).
/** @returns {RegExp[]} */
export function dashboardTestMatch(testDir, split, selection) {
  const files = selectedFiles(testDir, split, selection);
  return filePatterns(testDir, files.filter(selection.include ?? (() => true)));
}
