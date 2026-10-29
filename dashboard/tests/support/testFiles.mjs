import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  dealShares,
  parseSplit,
  readDurationList,
  shareLabels,
} from "../../../scripts/share-deal.mjs";

// The suite's spec files under `directory`, as paths relative to it: the
// labels `longest-first` and the `dashboard-times-<shard>` artifacts carry
// (support/specTimes.ts writes the same relative path).
export function dashboardSpecFiles(directory) {
  return readdirSync(directory, { recursive: true })
    .filter((file) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(file))
    .sort();
}

// Selected spec files for share `split` (`<i>/<n>`, the value of
// `OPEN_DOUGH_DASHBOARD_SPLIT`) under `testDir`: the files
// scripts/share-deal.mjs deals to that share by the recorded seconds in
// `testDir/longest-first` (shards.md). A malformed split or list line throws,
// naming it, before any test is selected.
/** @returns {string[]} */
function selectedFiles(testDir, split) {
  const directory = fileURLToPath(testDir);
  const files = dashboardSpecFiles(directory);
  if (split === undefined) return files;
  const { share, count } = parseSplit(split, "OPEN_DOUGH_DASHBOARD_SPLIT");
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
export function dashboardTestProjects(testDir, split) {
  const files = selectedFiles(testDir, split);
  const isProductionChain = (file) =>
    /^production-watcher(?:-.*)?\.spec\.ts$/.test(file);
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

/** @returns {RegExp[]} */
export function dashboardTestMatch(testDir, split) {
  return filePatterns(testDir, selectedFiles(testDir, split));
}
