// Preview inputs and text for scripts/test-shares.mjs. Allocation stays in
// share-deal.mjs; this module reads the suite, duration list and budget.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { dealShares, parseLabels, readDurationList } from "./share-deal.mjs";
import { formatSeconds, readInput, TestSharesError } from "./duration-list.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

// The Node suite's jobs, as scripts/test-jobs.sh lists them over testDir
// through the Bash on PATH. A refusal it reports as `FAIL:`, such as an older
// bash than the runner's floor (scripts/bash-floor.bash), is relayed as it is.
function listNodeSuiteJobs(
  testDir,
  { cwd = repositoryRoot, env = process.env } = {},
) {
  const listing = spawnSync(
    "bash",
    [join(repositoryRoot, "scripts/test-jobs.sh")],
    {
      cwd,
      env: { ...env, OPEN_DOUGH_TEST_DIR: testDir },
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (listing.status !== 0) {
    throw new TestSharesError(
      listing.stderr.startsWith("FAIL:")
        ? listing.stderr.replace(/\n$/, "")
        : `FAIL: scripts/test-jobs.sh over ${testDir} exited ${listing.status ?? listing.signal}:\n${listing.stderr}`,
    );
  }
  return listing.stdout
    .split("\0")
    .filter((record) => record !== "")
    .map((record) => record.slice(record.indexOf("\t") + 1));
}

// A browser test group's spec files under ROOT of specDir, as its
// configuration discovers them (dashboard/tests/support/testFiles.mjs).
// Imported only when used: runner fixtures copy the runner modules without
// the dashboard tree (Distribution/tests/helpers/copy-runner.bash).
async function listDashboardSpecFiles(specDir, root) {
  const { dashboardSpecFiles } = await import(
    new URL("../dashboard/tests/support/testFiles.mjs", import.meta.url)
  );
  return dashboardSpecFiles(specDir, [root]);
}

// The runner owns discovery for both inventories. Empty candidate files let its
// Bash globbing and exclusions judge trunk membership without running tests.
function trunkJobLabels(labels) {
  const ref = "origin/main";
  const read = (...args) => {
    const result = spawnSync("git", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.status !== 0)
      throw new TestSharesError(
        `FAIL: ${ref} cannot be read; fetch it or supply --trunk-labels FILE.`,
      );
    return result.stdout;
  };
  const files = new Set(
    parseLabels(read("ls-tree", "-r", "--name-only", "-z", ref)),
  );
  const directory = mkdtempSync(join(tmpdir(), "test-share-trunk-"));
  try {
    for (const label of labels.filter((label) => files.has(label))) {
      const path = join(directory, label);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, "");
    }
    const patternsPath = "Distribution/tests/node-test-files";
    for (const root of ["Distribution/tests", "Distribution/evaluation/tests"])
      mkdirSync(join(directory, root), { recursive: true });
    if (files.has(patternsPath)) {
      writeFileSync(
        join(directory, patternsPath),
        read("show", `${ref}:${patternsPath}`),
      );
    }
    return new Set(
      listNodeSuiteJobs("Distribution/tests", {
        cwd: directory,
        env: { ...process.env, OPEN_DOUGH_TEST_SPLIT: "" },
      }).filter((label) => files.has(label)),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export async function previewFromOptions(options) {
  const shareCount = Number(options["split-count"]);
  const specDir = options["spec-dir"];
  const testDir = options["test-dir"] ?? "Distribution/tests";
  const suiteDir = specDir ?? testDir;
  const listPath = options.list ?? `${suiteDir}/longest-first`;
  const budgetPath =
    options.budget ??
    (specDir === undefined && existsSync(`${testDir}/time-budget`)
      ? `${testDir}/time-budget`
      : undefined);
  const labels =
    options.labels !== undefined
      ? parseLabels(readInput(options.labels))
      : specDir !== undefined
        ? await listDashboardSpecFiles(specDir, options.root ?? ".")
        : listNodeSuiteJobs(testDir);
  const allocation = dealShares(
    labels,
    readDurationList(listPath).seconds,
    shareCount,
  );
  return formatPreview(allocation, {
    listName: listPath,
    ceiling:
      budgetPath === undefined
        ? undefined
        : readTimeBudget(budgetPath).totalJobSeconds,
    budgetName: budgetPath,
    trunkLabels:
      options["trunk-labels"] !== undefined
        ? new Set(parseLabels(readInput(options["trunk-labels"])))
        : options.labels === undefined &&
            options["test-dir"] === undefined &&
            specDir === undefined
          ? trunkJobLabels(labels)
          : undefined,
  });
}

// The preview text: the list and job counts, each share's predicted total
// with its headroom to `ceiling` (the budget's total-job-seconds, when
// given), then each unrecorded job with its share and assumed seconds.
export function formatPreview(
  allocation,
  { listName, ceiling, budgetName, trunkLabels },
) {
  const jobCount = allocation.recordedCount + allocation.unrecordedCount;
  const assumption =
    allocation.recordedMedian === allocation.assumedSeconds
      ? "the recorded median"
      : "no usable recorded median";
  const stale = (job) => !job.recorded && trunkLabels?.has(job.label);
  const staleCount = allocation.shares
    .flatMap((share) => share.jobs)
    .filter(stale).length;
  const lines = [
    `Predicted job-seconds per share from ${listName}: ${jobCount} jobs, ${allocation.recordedCount} recorded, ${allocation.unrecordedCount} unrecorded at ${formatSeconds(allocation.assumedSeconds)} s each (${assumption}).`,
  ];
  if (staleCount > 0) {
    lines.unshift(
      `Stale duration list ${listName}: ${staleCount} ${staleCount === 1 ? "job already on trunk lacks" : "jobs already on trunk lack"} recorded seconds.`,
    );
  }
  for (const share of allocation.shares) {
    const unrecorded = share.jobs.filter((job) => !job.recorded).length;
    let line = `share ${share.index}/${allocation.shareCount}: ${formatSeconds(share.predicted)} predicted (${share.jobs.length} jobs, ${unrecorded} unrecorded)`;
    if (ceiling !== undefined) {
      line += `; headroom ${formatSeconds(ceiling - share.predicted)} to the total ceiling ${ceiling} (${budgetName})`;
      if (share.jobs.some(stale)) line += " (rests on assumed seconds)";
    }
    lines.push(line);
  }
  if (staleCount > 0) {
    lines.push(
      "Refresh from a recent successful main run, every job (Distribution/tests/test-shares.md#preview-before-pushing):",
      "  gh run download RUN_ID -p 'test-times-*' -D DIR",
      `  node scripts/test-shares.mjs refresh --list ${listName} --source 'run RUN_ID at REVISION, DATE' DIR/test-times-*/test-times.txt`,
    );
  }
  if (allocation.unrecordedCount > 0) {
    lines.push(
      trunkLabels === undefined
        ? `unrecorded jobs (${allocation.unrecordedCount}), each assumed at ${formatSeconds(allocation.assumedSeconds)} s; a refresh of ${listName} records them:`
        : `unrecorded jobs (${allocation.unrecordedCount}), each assumed at ${formatSeconds(allocation.assumedSeconds)} s:`,
    );
    for (const share of allocation.shares) {
      for (const job of share.jobs) {
        if (!job.recorded) {
          const note =
            trunkLabels === undefined
              ? ""
              : stale(job)
                ? ` (stale; assumed ${formatSeconds(job.seconds)} s)`
                : ` (estimate at ${formatSeconds(job.seconds)} s)`;
          lines.push(
            `  share ${share.index}/${allocation.shareCount}  ${job.label}${note}`,
          );
        }
      }
    }
  }
  return `${lines.join("\n")}\n`;
}

// Reads `per-job-seconds=<n>` and `total-job-seconds=<n>` as
// scripts/time-budget.bash, the runner's reader of the same file, does: any
// other non-comment line, or a missing number, fails.
export function readTimeBudget(path) {
  const settings = readInput(path)
    .split(/\r?\n/)
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) =>
      /^(per-job-seconds|total-job-seconds)=([0-9]+(\.[0-9]+)?)$/.exec(line),
    );
  const values = Object.fromEntries(
    settings
      .filter((match) => match !== null)
      .map((match) => [match[1], Number(match[2])]),
  );
  if (
    settings.includes(null) ||
    values["per-job-seconds"] === undefined ||
    values["total-job-seconds"] === undefined
  ) {
    throw new TestSharesError(
      `FAIL: ${path} must set only per-job-seconds=<n> and total-job-seconds=<n>.`,
    );
  }
  return {
    perJobSeconds: values["per-job-seconds"],
    totalJobSeconds: values["total-job-seconds"],
  };
}
