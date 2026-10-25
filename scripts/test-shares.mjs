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
//           [--test-dir DIR]                 each share's predicted total,
//                                            the unrecorded jobs with the
//                                            assumed seconds and share, and
//                                            headroom to the budget's
//                                            total-job-seconds; labels from
//                                            FILE, or from
//                                            scripts/test-jobs.sh over DIR
//                                            (default tests)
//   refresh --list FILE --source TEXT TIMES...
//                                            merges the times files into
//                                            FILE, longest first, keeping
//                                            seconds and FILE's header with
//                                            `# Source: TEXT` as its last line

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  dealShares,
  formatPreview,
  mergeTimes,
  readDurationList,
  readTimeBudget,
  shareLabels,
  TestSharesError,
} from "./share-deal.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

// `--split i/n` with i from 1 to n.
function parseSplit(value) {
  const match = /^([1-9][0-9]*)\/([1-9][0-9]*)$/.exec(value);
  const share = match ? Number(match[1]) : 0;
  const count = match ? Number(match[2]) : 0;
  if (!match || share > count || !Number.isSafeInteger(count)) {
    throw new TestSharesError(
      `FAIL: --split=${value} is not <i>/<n> with i from 1 to n.`,
    );
  }
  return { share, count };
}

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
      : parseSplit(options.split);
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
// through the Bash on PATH. Bash 5 is the runner's floor
// (scripts/test-environment.bash), so the preview names the same remedy.
function listNodeSuiteJobs(testDir) {
  const version = spawnSync("bash", ["-c", 'printf "%s" "${BASH_VERSION}"'], {
    encoding: "utf8",
  });
  const major = Number(version.stdout?.split(".")[0]);
  if (version.status !== 0 || !(major >= 5)) {
    throw new TestSharesError(
      `FAIL: shell tests require Bash 5 or newer; resolved bash on PATH (version ${version.stdout || "unknown"}).\nInstall Bash 5 or newer and put its bin directory first on PATH, then rerun the preview.`,
    );
  }
  const listing = spawnSync("bash", ["scripts/test-jobs.sh"], {
    cwd: repositoryRoot,
    env: { ...process.env, OPEN_DOUGH_TEST_DIR: testDir },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (listing.status !== 0) {
    throw new TestSharesError(
      `FAIL: scripts/test-jobs.sh over ${testDir} exited ${listing.status ?? listing.signal}:\n${listing.stderr}`,
    );
  }
  return listing.stdout
    .split("\0")
    .filter((record) => record !== "")
    .map((record) => record.slice(record.indexOf("\t") + 1));
}

function previewCommand(argv) {
  const { options, positional } = parseArguments(argv, [
    "split-count",
    "list",
    "budget",
    "labels",
    "test-dir",
  ]);
  if (positional.length > 0 || options["split-count"] === undefined) {
    throw new TestSharesError(
      "FAIL: preview needs --split-count <n>; it takes no positional argument.",
    );
  }
  const shareCount = Number(options["split-count"]);
  const testDir = options["test-dir"] ?? "tests";
  const listPath = options.list ?? `${testDir}/longest-first`;
  const budgetPath =
    options.budget ??
    (existsSync(`${testDir}/time-budget`)
      ? `${testDir}/time-budget`
      : undefined);
  const labels =
    options.labels === undefined
      ? listNodeSuiteJobs(testDir)
      : parseLabels(readFileSync(options.labels, "utf8"));
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
    text: readFileSync(name, "utf8"),
  }));
  writeFileSync(
    options.list,
    mergeTimes(times, { header, source: options.source }),
  );
}

const commands = {
  share: shareCommand,
  preview: previewCommand,
  refresh: refreshCommand,
};

function main(argv) {
  const [command, ...rest] = argv;
  if (!Object.hasOwn(commands, command ?? "")) {
    throw new TestSharesError(
      `FAIL: the command must be one of ${Object.keys(commands).join(", ")}, not ${command ?? "(none)"}.`,
    );
  }
  commands[command](rest);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof TestSharesError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}
