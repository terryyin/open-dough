import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, posix, resolve } from "node:path";
import {
  dealShares,
  parseSplit,
  readDurationList,
  shareLabels,
} from "../../../scripts/share-deal.mjs";

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
        ? readdirSync(resolve(directory, root), { recursive: true }).map(
            (file) => posix.join(root, file),
          )
        : [],
    )
    .filter((file) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(file))
    .sort();
}

// Selected spec files for share `split` (`<i>/<n>`, the value of the
// runner's `splitVariable`) under `testDir`'s `roots`: the files
// scripts/share-deal.mjs deals to that share by the recorded seconds in the
// runner's own duration list, `durations` relative to `testDir` (shards.md).
// A malformed split or list line throws, naming it, before any test is
// selected.
/** @returns {string[]} */
function selectedFiles(testDir, split, { roots, splitVariable, durations }) {
  const directory = fileURLToPath(testDir);
  const files = dashboardSpecFiles(directory, roots);
  if (split === undefined) return files;
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

// Selection and dispatch have different jobs: the duration deal chooses each
// file's shard; native projects queue the long, serial production chains
// (E2E Test's `production-watcher*.spec.ts`) first in the same phase. No
// dependency makes ordinary checks wait for those chains. Complementary
// matches retain exactly one execution of every selected file. `selection`
// names a runner's own `roots`, `splitVariable` and `durations`.
export function dashboardTestProjects(testDir, split, selection) {
  const files = selectedFiles(testDir, split, selection);
  const isProductionChain = (file) =>
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

// `selection` names a runner's own `roots`, `splitVariable` and `durations`.
/** @returns {RegExp[]} */
export function dashboardTestMatch(testDir, split, selection) {
  return filePatterns(testDir, selectedFiles(testDir, split, selection));
}
