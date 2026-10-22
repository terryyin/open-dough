#!/usr/bin/env node
// Lists every file in a checkout that names a changed file or a supplied
// effect term, so the proof a change owes its existing consumers is chosen
// from the whole checkout rather than from the directories already in view.
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { parseArgs } from "node:util";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { consumerKind, renderConsumerTrace } from "./consumer-trace-record.mjs";

const USAGE =
  "usage: consumer-trace.mjs --checkout <path> [--path <changed file>]... [--term <text>]... (at least one --path or --term)";

class ConsumerTraceInputError extends Error {}

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function checkoutRoot(checkout) {
  if (!checkout || !existsSync(checkout))
    throw new ConsumerTraceInputError(`checkout not found: ${checkout}`);
  try {
    return realpathSync(git(checkout, ["rev-parse", "--show-toplevel"]).trim());
  } catch {
    throw new ConsumerTraceInputError(`not a Git checkout: ${checkout}`);
  }
}

function canonical(path) {
  let existing = path;
  const rest = [];
  while (!existsSync(existing) && dirname(existing) !== existing) {
    rest.unshift(basename(existing));
    existing = dirname(existing);
  }
  return resolve(realpathSync(existing), ...rest);
}

function repositoryPath(root, path) {
  const absolute = canonical(isAbsolute(path) ? path : resolve(root, path));
  const inside = relative(root, absolute);
  if (!inside || inside.startsWith("..") || isAbsolute(inside))
    throw new ConsumerTraceInputError(`path outside the checkout: ${path}`);
  return inside.split(sep).join("/");
}

function revisionOf(root) {
  try {
    return git(root, ["rev-parse", "--short=12", "HEAD"]).trim();
  } catch {
    return "no commit";
  }
}

// Terms carry an origin so derived terms can sit beside the supplied ones.
function effectTerms(paths, terms) {
  const result = [];
  const add = (term, origin) => {
    if (term && !result.some((item) => item.term === term))
      result.push({ term, origin });
  };
  for (const path of paths) {
    add(path, "changed path");
    add(basename(path), `basename of \`${path}\``);
  }
  for (const term of terms) add(term, "supplied");
  return result;
}

function searchedFiles(root, changed) {
  const listed = git(root, [
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
  ])
    .split("\0")
    .filter(Boolean);
  return [...new Set(listed)].filter((path) => {
    if (changed.has(path)) return false;
    try {
      return lstatSync(resolve(root, path)).isFile();
    } catch {
      return false;
    }
  });
}

function firstMatch(content, needles) {
  const lower = content.toLowerCase();
  const matched = needles.filter(({ needle }) => lower.includes(needle));
  if (!matched.length) return undefined;
  const lines = content.split(/\r?\n/);
  const holds = (line) =>
    matched.some(({ needle }) => line.toLowerCase().includes(needle));
  // A term spanning a line break still names the file, from its first line.
  const index = Math.max(0, lines.findIndex(holds));
  const terms = matched.map(({ term }) => term);
  return { terms, line: index + 1, text: lines[index].trim() };
}

function traceConsumers({ checkout, paths = [], terms = [] }) {
  if (!paths.length && !terms.length)
    throw new ConsumerTraceInputError("supply at least one --path or --term");
  const root = checkoutRoot(checkout);
  const changed = paths.map((path) => repositoryPath(root, path));
  const searched = effectTerms(changed, terms);
  const needles = searched.map(({ term }) => ({
    term,
    needle: term.toLowerCase(),
  }));
  const files = searchedFiles(root, new Set(changed));
  const consumers = [];
  for (const path of files) {
    let content;
    try {
      content = readFileSync(resolve(root, path));
    } catch {
      continue;
    }
    if (content.subarray(0, 8000).includes(0)) continue;
    const match = firstMatch(content.toString("utf8"), needles);
    if (match) consumers.push({ path, kind: consumerKind(path), ...match });
  }
  consumers.sort((left, right) => left.path.localeCompare(right.path));
  return {
    revision: revisionOf(root),
    changed,
    terms: searched,
    fileCount: files.length,
    consumers,
  };
}

const OPTIONS = {
  checkout: { type: "string" },
  path: { type: "string", multiple: true },
  term: { type: "string", multiple: true },
};

function readConsumerTraceArgs(argv) {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS });
  } catch (error) {
    throw new ConsumerTraceInputError(error.message);
  }
  const { checkout, path = [], term = [] } = parsed.values;
  if (!checkout) throw new ConsumerTraceInputError("--checkout is required");
  if ([...path, ...term].some((value) => !value.trim()))
    throw new ConsumerTraceInputError("--path and --term need a value");
  return { checkout, paths: path, terms: term };
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    const record = traceConsumers(readConsumerTraceArgs(process.argv.slice(2)));
    process.stdout.write(renderConsumerTrace(record));
  } catch (error) {
    if (!(error instanceof ConsumerTraceInputError)) throw error;
    process.stderr.write(`${error.message}\n${USAGE}\n`);
    process.exitCode = 2;
  }
}
