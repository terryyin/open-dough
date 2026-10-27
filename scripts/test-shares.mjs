#!/usr/bin/env node
// scripts/test-shares.mjs is the command surface of scripts/share-deal.mjs,
// which deals a test suite's jobs into CI shares by their recorded durations.
// scripts/test-jobs.sh runs `share` for the Node runner's share; a contributor
// runs `preview` and `refresh` (tests/test-shares.md).
//
//   share   [--list FILE] [--split i/n]      labels on stdin, NUL-separated
//                                            (or one per line); prints the
//                                            share's labels NUL-separated,
//                                            in start order
//   preview --split-count N [--list FILE] [--budget FILE] [--labels FILE]
//           [--test-dir DIR | --spec-dir DIR]
//                                            each share's predicted total,
//                                            the unrecorded jobs with the
//                                            assumed seconds and share, and
//                                            headroom to the budget's
//                                            total-job-seconds when there is
//                                            one; labels from FILE, from the
//                                            dashboard spec files under DIR
//                                            (--spec-dir, no budget), or
//                                            from scripts/test-jobs.sh over
//                                            DIR (default tests)
//   refresh --list FILE --source TEXT TIMES...
//                                            merges the times files into
//                                            FILE, longest first, keeping
//                                            seconds and FILE's header with
//                                            `# Source: TEXT` as its last line

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  dealShares,
  formatPreview,
  mergeTimes,
  parseSplit,
  readDurationList,
  readInput,
  readTimeBudget,
  shareLabels,
  TestSharesError,
  writeDurationList,
} from "./share-deal.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

// Labels NUL-separated, or one per line when the text holds no NUL; empty
// entries are dropped.
function parseLabels(text) {
  const separator = text.includes("\0") ? "\0" : /\r?\n/;
  return text.split(separator).filter((label) => label !== "");
}

// Options are `--name value` pairs; the rest are positional.
function parseArguments(argv, known) {
  const options = {};
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument.startsWith("--")) {
      const name = argument.slice(2);
      const value = argv[index + 1];
      if (!known.includes(name) || value === undefined) {
        throw new TestSharesError(`FAIL: unsupported argument ${argument}.`);
      }
      options[name] = value;
      index += 1;
    } else {
      positional.push(argument);
    }
  }
  return { options, positional };
}

function readStdin() {
  return readFileSync(0, "utf8");
}

function shareCommand(argv) {
  const { options, positional } = parseArguments(argv, ["list", "split"]);
  if (positional.length > 0) {
    throw new TestSharesError(
      `FAIL: share takes labels on stdin, not ${positional[0]}.`,
    );
  }
  const split =
    options.split === undefined
      ? { share: 1, count: 1 }
      : parseSplit(options.split, "--split");
  const seconds =
    options.list === undefined
      ? new Map()
      : readDurationList(options.list).seconds;
  const allocation = dealShares(parseLabels(readStdin()), seconds, split.count);
  process.stdout.write(
    shareLabels(allocation, split.share)
      .map((label) => `${label}\0`)
      .join(""),
  );
}

// The Node suite's jobs, as scripts/test-jobs.sh lists them over testDir
// through the Bash on PATH. A refusal it reports as `FAIL:`, such as an older
// bash than the runner's floor (scripts/bash-floor.bash), is relayed as it is.
function listNodeSuiteJobs(testDir) {
  const listing = spawnSync("bash", ["scripts/test-jobs.sh"], {
    cwd: repositoryRoot,
    env: { ...process.env, OPEN_DOUGH_TEST_DIR: testDir },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
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

// The dashboard suite's spec files under specDir, as its configuration
// discovers them (dashboard/tests/support/testFiles.mjs). Imported only when
// the option is used: the runner's tests copy this module and share-deal.mjs
// into fixtures without the dashboard tree (tests/helpers/copy-runner.bash).
async function listDashboardSpecFiles(specDir) {
  const { dashboardSpecFiles } = await import(
    new URL("../dashboard/tests/support/testFiles.mjs", import.meta.url)
  );
  return dashboardSpecFiles(specDir);
}

async function previewCommand(argv) {
  const { options, positional } = parseArguments(argv, [
    "split-count",
    "list",
    "budget",
    "labels",
    "test-dir",
    "spec-dir",
  ]);
  if (positional.length > 0 || options["split-count"] === undefined) {
    throw new TestSharesError(
      "FAIL: preview needs --split-count <n>; it takes no positional argument.",
    );
  }
  if (options["test-dir"] !== undefined && options["spec-dir"] !== undefined) {
    throw new TestSharesError(
      "FAIL: preview takes --test-dir or --spec-dir, not both.",
    );
  }
  const shareCount = Number(options["split-count"]);
  const specDir = options["spec-dir"];
  const testDir = options["test-dir"] ?? "tests";
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
        ? await listDashboardSpecFiles(specDir)
        : listNodeSuiteJobs(testDir);
  const allocation = dealShares(
    labels,
    readDurationList(listPath).seconds,
    shareCount,
  );
  process.stdout.write(
    formatPreview(allocation, {
      listName: listPath,
      ceiling:
        budgetPath === undefined
          ? undefined
          : readTimeBudget(budgetPath).totalJobSeconds,
      budgetName: budgetPath,
    }),
  );
}

function refreshCommand(argv) {
  const { options, positional } = parseArguments(argv, ["list", "source"]);
  if (
    options.list === undefined ||
    options.source === undefined ||
    positional.length === 0
  ) {
    throw new TestSharesError(
      "FAIL: refresh needs --list <file>, --source <text> and at least one times file.",
    );
  }
  const header = existsSync(options.list)
    ? readDurationList(options.list).header
    : [
        "# Each job's seconds from one CI run, `<seconds><TAB><label>`, longest first.",
        "# Jobs not listed are dealt as unrecorded at the median of these seconds.",
      ];
  const times = positional.map((name) => ({
    name,
    text: readInput(name),
  }));
  writeDurationList(
    options.list,
    mergeTimes(times, { header, source: options.source }),
  );
}

const commands = {
  share: shareCommand,
  preview: previewCommand,
  refresh: refreshCommand,
};

async function main(argv) {
  const [command, ...rest] = argv;
  if (!Object.hasOwn(commands, command ?? "")) {
    throw new TestSharesError(
      `FAIL: the command must be one of ${Object.keys(commands).join(", ")}, not ${command ?? "(none)"}.`,
    );
  }
  await commands[command](rest);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof TestSharesError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}
