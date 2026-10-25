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

// Playwright `testMatch` patterns for share `split` (`<i>/<n>`, the value of
// `OPEN_DOUGH_DASHBOARD_SPLIT`) of the spec files under `testDir`: the files
// scripts/share-deal.mjs deals to that share by the recorded seconds in
// `testDir/longest-first` (shards.md). A malformed split or list line throws,
// naming it, before any test is selected.
/** @returns {RegExp[]} */
export function dashboardTestMatch(testDir, split) {
  const { share, count } = parseSplit(split, "OPEN_DOUGH_DASHBOARD_SPLIT");
  const directory = fileURLToPath(testDir);
  const { seconds } = readDurationList(resolve(directory, "longest-first"));
  const allocation = dealShares(dashboardSpecFiles(directory), seconds, count);
  /** @type {string[]} */
  const files = shareLabels(allocation, share);
  return files.map(
    (file) =>
      new RegExp(
        `^${resolve(directory, file).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      ),
  );
}
