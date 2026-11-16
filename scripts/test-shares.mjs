#!/usr/bin/env node
// Command surface of scripts/share-deal.mjs (Distribution/tests/test-shares.md).
// scripts/test-jobs.sh runs `share`; contributors run `preview` for a browser
// test group (dashboard/tests/shards.md) and `refresh`.
// `runner-factor` prints `<factor><TAB><label>` for scripts/test-budget.sh.
//
//   share   [--list FILE] [--split i/n]      labels on stdin, NUL-separated
//                                            (or one per line); prints the
//                                            share's labels NUL-separated
//   preview --split-count N --spec-dir DIR [--root ROOT] [--list FILE]
//   refresh --list FILE --source TEXT TIMES...
//   runner-factor [--list FILE] TIMES

import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  dealShares,
  formatRunnerFactorLine,
  parseDurationList,
  parseLabels,
  parseSplit,
  readDurationList,
  readInput,
  refreshListText,
  shareLabels,
  TestSharesError,
  writeDurationList,
} from "./share-deal.mjs";

import { previewFromOptions } from "./share-preview.mjs";

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

async function previewCommand(argv) {
  const { options, positional } = parseArguments(argv, [
    "split-count",
    "list",
    "spec-dir",
    "root",
  ]);
  if (
    positional.length > 0 ||
    options["split-count"] === undefined ||
    options["spec-dir"] === undefined
  ) {
    throw new TestSharesError(
      "FAIL: preview needs --split-count <n> and --spec-dir <dir>; it takes no positional argument.",
    );
  }
  process.stdout.write(await previewFromOptions(options));
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
  const existing = existsSync(options.list)
    ? readDurationList(options.list)
    : null;
  const times = positional.map((name) => ({
    name,
    text: readInput(name),
  }));
  writeDurationList(
    options.list,
    refreshListText(existing, times, options.source),
  );
}

function runnerFactorCommand(argv) {
  const { options, positional } = parseArguments(argv, ["list"]);
  if (positional.length !== 1) {
    throw new TestSharesError(
      "FAIL: runner-factor needs one times file and optional --list <file>.",
    );
  }
  const recorded =
    options.list === undefined || !existsSync(options.list)
      ? new Map()
      : readDurationList(options.list).seconds;
  const observed = parseDurationList(
    readInput(positional[0]),
    positional[0],
  ).seconds;
  process.stdout.write(formatRunnerFactorLine(recorded, observed));
}

const commands = {
  share: shareCommand,
  preview: previewCommand,
  refresh: refreshCommand,
  "runner-factor": runnerFactorCommand,
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
