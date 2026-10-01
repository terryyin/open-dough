import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// The same longest-first, then sorted unknown files, round-robin partition
// used by scripts/test-jobs.sh. Missing and repeated list entries are harmless.
export function partitionTestFiles(files, longestFirst, split) {
  const match = /^([1-9][0-9]*)\/([1-9][0-9]*)$/.exec(split);
  const share = Number(match?.[1]);
  const count = Number(match?.[2]);
  if (
    !Number.isSafeInteger(share) ||
    !Number.isSafeInteger(count) ||
    share > count
  ) {
    throw new Error(
      `OPEN_DOUGH_DASHBOARD_SPLIT=${split} is not <i>/<n> with i from 1 to n.`,
    );
  }
  const remaining = new Set(files);
  const ordered = [];
  for (const file of longestFirst) {
    if (remaining.delete(file)) {
      ordered.push(file);
    }
  }
  ordered.push(...[...remaining].sort());
  return ordered.flatMap((file, index) =>
    index % count === share - 1 ? [file] : [],
  );
}

export function dashboardTestMatch(testDir, split) {
  const directory = fileURLToPath(testDir);
  const files = readdirSync(directory, { recursive: true }).filter((file) =>
    /\.(spec|test)\.[cm]?[jt]sx?$/.test(file),
  );
  const longestFirst = readFileSync(new URL("longest-first", testDir), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  return partitionTestFiles(files, longestFirst, split).map(
    (file) =>
      new RegExp(
        `^${resolve(directory, file).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      ),
  );
}
