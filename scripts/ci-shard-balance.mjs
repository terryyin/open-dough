#!/usr/bin/env node
// Reports how evenly a CI test group's shards share its recent trunk times:
//
//   node scripts/ci-shard-balance.mjs GROUP [--runs N]
//
// GROUP is a test job id in .github/workflows/ci.yml: distribution-tests, e2e,
// dashboard-integrated, dashboard-frontend or dashboard-backend. It reads the
// group's times artifacts from the last N (default 5) successful ci.yml runs on
// main through `gh` (scripts/ci-shard-times.mjs; read-only, it starts no run)
// into a temporary directory it removes, and takes each discovered file's
// median seconds over the runs that timed it. It prints each shard's total
// under the patterns now in ci.yml (scripts/test-share-declaration.mjs reads
// them; scripts/test-share-matrix.mjs selects each shard's files), the even
// total, the discovered files no run timed, and the slow files: each alone over
// a tenth of the even total, a candidate for a faster test. After the report
// it prints scripts/ci-shard-proposal.mjs's one pattern change as a diff to
// ci.yml, or says the shards are balanced; it applies nothing. Files a run timed
// that are no longer discovered are ignored, so a run under an older layout
// still counts. Job counts are scripts/ci-job-times.sh's question.
//
// Discovery is the group's own: scripts/test-jobs.sh's unsplit listing for
// distribution-tests, whose `test-times-<i>` artifacts hold repository-relative
// `test-times.txt` labels; for a browser group, the spec files under its job's
// `root` input (dashboard/tests/support/testFiles.mjs), whose
// `<group>-times-<i>` artifacts hold `browser-times.txt` labels relative to
// the configuration's directory, the root's first segment (`e2e/`,
// `dashboard/`). Exits 1 saying why when the declaration is refused, gh fails,
// or no listed run still holds the group's times artifacts.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dashboardSpecFiles } from "../dashboard/tests/support/testFiles.mjs";
import { formatProposal, proposeChange } from "./ci-shard-proposal.mjs";
import { NoTimesError, median, readRecentTimes } from "./ci-shard-times.mjs";
import {
  readJobInput,
  readShareDeclaration,
  ShareMatrixError,
} from "./test-share-declaration.mjs";
import { selectShare } from "./test-share-matrix.mjs";

const WORKFLOW = ".github/workflows/ci.yml";
const BROWSER_GROUPS = [
  "e2e",
  "dashboard-integrated",
  "dashboard-frontend",
  "dashboard-backend",
];
const DISTRIBUTION = "distribution-tests";

class UsageError extends Error {}

// The Distribution suite's checks, as the runner's unsplit listing names them.
function distributionChecks(repository) {
  const env = { ...process.env, OPEN_DOUGH_TEST_DIR: "Distribution/tests" };
  delete env.OPEN_DOUGH_TEST_SPLIT;
  let listing;
  try {
    listing = execFileSync("bash", ["scripts/test-jobs.sh"], {
      cwd: repository,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new UsageError(
      `FAIL: scripts/test-jobs.sh could not list the checks: ${String(error.stderr).trim()}`,
    );
  }
  return listing
    .split("\0")
    .filter(Boolean)
    .map((record) => record.slice(record.indexOf("\t") + 1));
}

// How group `group` is discovered and timed: its repository-relative files,
// its times artifacts' name glob and file, and the prefix that makes a times
// label repository-relative.
function groupSources(repository, text, group) {
  if (group === DISTRIBUTION) {
    return {
      discovered: distributionChecks(repository),
      artifacts: "test-times-*",
      timesFile: "test-times.txt",
      prefix: "",
    };
  }
  const root = readJobInput(text, group, "root");
  if (!root)
    throw new UsageError(
      `FAIL: ${WORKFLOW}: the ${group} job has no root input.`,
    );
  const [configuration, ...below] = root.split("/");
  const specs = dashboardSpecFiles(join(repository, configuration), [
    below.length > 0 ? below.join("/") : ".",
  ]);
  return {
    discovered: specs.map((spec) => posix.join(configuration, spec)),
    artifacts: `${group}-times-*`,
    timesFile: "browser-times.txt",
    prefix: configuration,
  };
}

const sum = (values) => values.reduce((total, value) => total + value, 0);

/**
 * Each shard's files and total seconds under `declaration`, the even total,
 * the untimed files, the slow files and each timed file's median.
 * @param {ReturnType<typeof readShareDeclaration>} declaration
 * @param {string[]} discovered repository-relative files
 * @param {Map<string, number[]>} seconds repository-relative label → per-run seconds
 */
export function shardReport(declaration, discovered, seconds) {
  const files = [...new Set(discovered)];
  const medians = new Map(
    files
      .filter((file) => seconds.has(file))
      .map((file) => [file, median(seconds.get(file))]),
  );
  const shards = declaration.shares.map((share) => {
    const owned = selectShare(declaration, files, share);
    return {
      share,
      patterns: declaration.patterns.get(share),
      files: owned,
      total: sum(owned.map((file) => medians.get(file) ?? 0)),
    };
  });
  const even = sum(shards.map(({ total }) => total)) / shards.length;
  return {
    shards,
    even,
    untimed: files.filter((file) => !medians.has(file)).sort(),
    slow: [...medians]
      .filter(([, value]) => value > even / 10)
      .sort(([a, x], [b, y]) => y - x || (a < b ? -1 : 1)),
    medians,
  };
}

const s = (value) => `${Math.round(value)} s`;
const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** The report's printed lines. */
export function formatReport(group, times, report) {
  const { used, skipped } = times;
  const { shards, even, untimed, slow } = report;
  const skippedNote =
    skipped === 0
      ? ""
      : ` (${skipped} without ${group} times artifacts skipped)`;
  return [
    `Shard totals for ${group}: ${plural(used.length, "successful ci.yml run")} on main, ${used.at(-1).created} to ${used[0].created}${skippedNote}.`,
    `Seconds are each discovered file's median over the runs that timed it, under the shards now in ${WORKFLOW}.`,
    `Even total: ${s(even)} over ${plural(shards.length, "shard")}`,
    ...shards.map(
      ({ share, patterns, files, total }) =>
        `Shard ${share}: ${s(total)}, ${plural(files.length, "file")}: ${patterns ? patterns.join(" ") : "the rest"}`,
    ),
    `Untimed files (no run timed them): ${untimed.length === 0 ? "none" : untimed.length}`,
    ...untimed.map((file) => `  ${file}`),
    `Slow files (each over a tenth of the even total, ${s(even / 10)}; candidates for a faster test): ${slow.length === 0 ? "none" : slow.length}`,
    ...slow.map(([file, value]) => `  ${s(value)} ${file}`),
  ];
}

function parseArguments(args) {
  const usage = `FAIL: ci-shard-balance takes GROUP [--runs N], GROUP one of ${[DISTRIBUTION, ...BROWSER_GROUPS].join(", ")}.`;
  const [group, ...rest] = args;
  let limit = 5;
  if (rest.length === 2 && rest[0] === "--runs" && /^[1-9]\d*$/.test(rest[1])) {
    limit = Number(rest[1]);
  } else if (rest.length > 0) {
    throw new UsageError(usage);
  }
  if (group !== DISTRIBUTION && !BROWSER_GROUPS.includes(group)) {
    throw new UsageError(usage);
  }
  return { group, limit };
}

function main(args) {
  const { group, limit } = parseArguments(args);
  const repository = fileURLToPath(new URL("..", import.meta.url));
  const text = readFileSync(join(repository, WORKFLOW), "utf8");
  const declaration = readShareDeclaration(text, WORKFLOW, group);
  const sources = groupSources(repository, text, group);
  // Refuses an overlap or an unmatched pattern before any gh call.
  selectShare(declaration, sources.discovered);
  const scratch = mkdtempSync(join(tmpdir(), "ci-shard-balance-"));
  try {
    const times = readRecentTimes({
      cwd: repository,
      scratch,
      limit,
      ...sources,
    });
    const seconds = new Map(
      [...times.seconds].map(([label, values]) => [
        posix.join(sources.prefix, label),
        values,
      ]),
    );
    const report = shardReport(declaration, sources.discovered, seconds);
    const change = proposeChange(report, text, WORKFLOW, group);
    const lines = [
      ...formatReport(group, times, report),
      ...formatProposal(report, change),
    ];
    process.stdout.write(`${lines.join("\n")}\n`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    const known = [UsageError, NoTimesError, ShareMatrixError];
    if (!known.some((type) => error instanceof type)) throw error;
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
