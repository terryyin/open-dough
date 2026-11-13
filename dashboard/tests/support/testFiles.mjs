import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, resolve } from "node:path";
import {
  dealShares,
  parseSplit,
  readDurationList,
  shareLabels,
} from "../../../scripts/share-deal.mjs";

// The roots `npm run test:dashboard` discovers, relative to `dashboard/`:
// until each group has its own CI runner, the umbrella also discovers the
// repository's sibling `e2e/` root, labelled `../e2e/<path>`. A runner owning
// one group names its own roots (../../frontend.playwright.config.ts,
// ../../backend.playwright.config.ts, ../../../e2e/playwright.config.ts).
export const dashboardRoots = [
  "tests",
  "frontend-tests",
  "backend-tests",
  "../e2e",
];

// The specs under `roots` of the common dashboard `directory`, as paths
// relative to it: the labels `longest-first` and the
// `dashboard-times-<shard>` artifacts carry (support/specTimes.ts writes the
// same relative path).
export function dashboardSpecFiles(directory, roots = dashboardRoots) {
  return roots
    .flatMap((root) =>
      existsSync(resolve(directory, root))
        ? readdirSync(resolve(directory, root), { recursive: true }).map(
            (file) => `${root}/${file}`,
          )
        : [],
    )
    .filter((file) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(file))
    .sort();
}

// Selected spec files for share `split` (`<i>/<n>`, the value of the
// runner's `splitVariable`) under `testDir`'s `roots`: the files
// scripts/share-deal.mjs deals to that share by the recorded seconds in
// `testDir/longest-first` (shards.md). A malformed split or list line throws,
// naming it, before any test is selected.
/** @returns {string[]} */
function selectedFiles(
  testDir,
  split,
  { roots = dashboardRoots, splitVariable = "OPEN_DOUGH_DASHBOARD_SPLIT" } = {},
) {
  const directory = fileURLToPath(testDir);
  const files = dashboardSpecFiles(directory, roots);
  if (split === undefined) return files;
  const { share, count } = parseSplit(split, splitVariable);
  const { seconds } = readDurationList(resolve(directory, "longest-first"));
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

// Selection and dispatch have different jobs: the duration deal chooses each
// file's shard; native projects queue the long, serial production chains first
// in the same phase. No dependency makes ordinary checks wait for those chains.
// Complementary matches retain exactly one execution of every selected file.
// `selection` names a runner's own `roots` and `splitVariable`.
export function dashboardTestProjects(testDir, split, selection) {
  const files = selectedFiles(testDir, split, selection);
  const isProductionChain = (file) =>
    /^(?:tests|\.\.\/e2e)\//.test(file) &&
    /^production-watcher(?:-.*)?\.spec\.ts$/.test(basename(file));
  return [
    {
      name: "chromium-deployments",
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

// `selection` names a runner's own `roots` and `splitVariable`.
/** @returns {RegExp[]} */
export function dashboardTestMatch(testDir, split, selection) {
  return filePatterns(testDir, selectedFiles(testDir, split, selection));
}
