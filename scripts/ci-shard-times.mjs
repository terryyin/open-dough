// Reads one CI test group's per-file seconds from the times artifacts of recent
// successful ci.yml runs on main, through `gh` (read-only; it starts no run),
// for scripts/ci-shard-balance.mjs. A run that no longer holds the group's
// times artifacts is skipped and counted as skipped.

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, matchesGlob } from "node:path";

export class NoTimesError extends Error {}

const noTimes = (reason) =>
  new NoTimesError(`No recent trunk times were found: ${reason}`);

// Runs `gh` in `cwd`, returning stdout; on failure throws `<what> failed:`
// with gh's own message on one line.
function gh(cwd, what, args) {
  try {
    return execFileSync("gh", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const message = String(error.stderr ?? error.message)
      .trim()
      .replace(/\n/g, " ");
    throw noTimes(`${what} failed: ${message}`);
  }
}

const lines = (text) => text.split("\n").filter((line) => line.trim() !== "");

// The last `limit` successful ci.yml runs on main, newest first.
function listRuns(cwd, limit) {
  const listing = gh(cwd, "gh run list", [
    "run",
    "list",
    "--workflow",
    "ci.yml",
    "--branch",
    "main",
    "--status",
    "success",
    "--limit",
    String(limit),
    "--json",
    "databaseId,createdAt",
    "--jq",
    '.[] | "\\(.databaseId)\\t\\(.createdAt)"',
  ]);
  const runs = lines(listing).map((line) => {
    const [run, created] = line.split("\t");
    return { run, created };
  });
  if (runs.length === 0) {
    throw noTimes("gh listed no successful ci.yml runs on main.");
  }
  return runs;
}

// The names of run `run`'s unexpired artifacts matching `pattern`.
function heldArtifacts(cwd, run, pattern) {
  const names = gh(cwd, `gh api for run ${run}'s artifacts`, [
    "api",
    `repos/{owner}/{repo}/actions/runs/${run}/artifacts?per_page=100`,
    "--jq",
    ".artifacts[] | select(.expired | not) | .name",
  ]);
  return lines(names).filter((name) => matchesGlob(name, pattern));
}

// Every file named `timesFile` below `directory`.
function timesFiles(directory, timesFile) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return timesFiles(path, timesFile);
    return entry.name === timesFile ? [path] : [];
  });
}

// One run's seconds per label: `<seconds><TAB><label>` rows, a label timed in
// more than one artifact counting their sum.
function runSeconds(files, run) {
  const seconds = new Map();
  for (const file of files) {
    for (const row of lines(readFileSync(file, "utf8"))) {
      const parsed = /^(\d+(?:\.\d+)?)\t(.+)$/.exec(row);
      if (!parsed) {
        throw noTimes(
          `run ${run}'s times row "${row}" is not <seconds><TAB><file>.`,
        );
      }
      const [, value, label] = parsed;
      seconds.set(label, (seconds.get(label) ?? 0) + Number(value));
    }
  }
  return seconds;
}

/**
 * Each label's seconds per run, over the last `limit` successful ci.yml runs
 * on main that still hold the group's `artifacts` (a glob of artifact names),
 * each holding a `timesFile`. Downloads into `scratch`, which the caller
 * removes. Throws NoTimesError saying why when gh fails or no run is usable.
 * @param {{ cwd: string, scratch: string, limit: number,
 *   artifacts: string, timesFile: string }} options
 * @returns {{ used: { run: string, created: string }[], skipped: number,
 *   seconds: Map<string, number[]> }}
 */
export function readRecentTimes({ cwd, scratch, limit, artifacts, timesFile }) {
  const runs = listRuns(cwd, limit);
  const used = [];
  const seconds = new Map();
  for (const { run, created } of runs) {
    if (heldArtifacts(cwd, run, artifacts).length === 0) continue;
    const directory = join(scratch, run);
    gh(cwd, `gh run download ${run}`, [
      "run",
      "download",
      run,
      "--pattern",
      artifacts,
      "--dir",
      directory,
    ]);
    const timed = runSeconds(timesFiles(directory, timesFile), run);
    for (const [label, value] of timed) {
      seconds.set(label, [...(seconds.get(label) ?? []), value]);
    }
    used.push({ run, created });
  }
  if (used.length === 0) {
    throw noTimes(
      `none of the ${runs.length} listed successful ci.yml runs on main still holds ${artifacts} artifacts.`,
    );
  }
  return { used, skipped: runs.length - used.length, seconds };
}

/** The median of a non-empty list of numbers. */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}
