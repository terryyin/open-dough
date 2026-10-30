// Duration-list storage shared by the suite allocator and its refresh command.
// Ordinary lists and times artifacts retain one <seconds><TAB><label> row per job.
// A list can split its rows into named parts with # Include: <relative-path>
// header lines. Parts are ordinary lists, not further indexes.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const secondsPattern = /^[0-9]+(\.[0-9]+)?$/;
// A failure to report as it is and exit 1 on.
export class TestSharesError extends Error {}

export const bytewise = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

export function formatSeconds(value) {
  return value.toFixed(1);
}

// A file's text; a file that cannot be read fails naming it, as a malformed
// one does.
export function readInput(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    throw new TestSharesError(
      `FAIL: ${path} cannot be read (${error.code ?? error.message}).`,
    );
  }
}

// Records a label's seconds, keeping the largest when the label repeats.
function recordLongest(seconds, label, value) {
  if (!seconds.has(label) || seconds.get(label) < value) {
    seconds.set(label, value);
  }
}

// Parses a duration list or a times file into its leading header lines and
// a map from label to seconds. Any non-comment, non-blank line must be
// `<seconds><TAB><label>`.
export function parseDurationList(text, name) {
  const header = [];
  const seconds = new Map();
  let inHeader = true;
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.startsWith("#")) {
      if (inHeader) {
        header.push(line);
      }
      return;
    }
    if (line.trim() === "") {
      return;
    }
    inHeader = false;
    const tab = line.indexOf("\t");
    const value = tab === -1 ? "" : line.slice(0, tab);
    const label = tab === -1 ? "" : line.slice(tab + 1);
    if (!secondsPattern.test(value) || label === "") {
      throw new TestSharesError(
        `FAIL: ${name}:${index + 1}: ${JSON.stringify(line)} is not <seconds><TAB><label>; no check was run.`,
      );
    }
    recordLongest(seconds, label, Number(value));
  });
  return { header, seconds };
}

// The times form, which the runner's `test-times` and the dashboard's
// `dashboard-times-<shard>` artifacts print and a list's job lines keep: one
// `<seconds><TAB><label>` line per entry, seconds to a tenth, longest first,
// equal seconds bytewise by label.
/**
 * @param {Iterable<[string, number]>} entries label and seconds
 * @returns {string[]}
 */
export function formatTimes(entries) {
  return [...entries]
    .map(([label, seconds]) => ({ label, printed: formatSeconds(seconds) }))
    .sort(
      (left, right) =>
        Number(right.printed) - Number(left.printed) ||
        bytewise(left.label, right.label),
    )
    .map(({ label, printed }) => `${printed}\t${label}`);
}

// Header written when refresh creates a list that did not exist yet.
export const newDurationListHeader = [
  "# Each job's seconds from one CI run, `<seconds><TAB><label>`, longest first.",
  "# Jobs not listed are dealt as unrecorded at the median of these seconds.",
];

// Longest seconds per label across times files (the merge refresh and the
// runner-factor comparison both need).
export function collectLongestSeconds(times) {
  const merged = new Map();
  for (const { name, text } of times) {
    for (const [label, seconds] of parseDurationList(text, name).seconds) {
      recordLongest(merged, label, seconds);
    }
  }
  return merged;
}

// Header lines (without any former `# Source:`) plus `# Source: <source>` and
// the times form of `seconds`.
export function formatListText(header, source, seconds) {
  const lines = [
    ...header.filter((line) => !line.startsWith("# Source:")),
    `# Source: ${source}`,
    ...formatTimes(seconds),
  ];
  return `${lines.join("\n")}\n`;
}

// The refreshed list text: merge every times file, longest first, under the
// given header and source line.
export function mergeTimes(times, { header, source }) {
  return formatListText(header, source, collectLongestSeconds(times));
}

const includePrefix = "# Include: ";

function readParts(path) {
  const root = { path, ...parseDurationList(readInput(path), path) };
  const names = root.header
    .filter((line) => line.startsWith(includePrefix))
    .map((line) => resolve(dirname(path), line.slice(includePrefix.length)));
  if (new Set([resolve(path), ...names]).size !== names.length + 1) {
    throw new TestSharesError(`FAIL: ${path} repeats a duration-list part.`);
  }
  return [
    root,
    ...names.map((name) => {
      const part = { path: name, ...parseDurationList(readInput(name), name) };
      if (part.header.some((line) => line.startsWith(includePrefix))) {
        throw new TestSharesError(
          `FAIL: ${name} includes another duration list; parts must contain rows only.`,
        );
      }
      return part;
    }),
  ];
}

export function readDurationList(path) {
  const parts = readParts(path);
  const seconds = new Map();
  for (const part of parts) {
    for (const [label, value] of part.seconds)
      recordLongest(seconds, label, value);
  }
  return { header: parts[0].header, seconds };
}

// Refresh keeps each known job in its existing part. New jobs go in the index;
// no grouping rule alters their recorded seconds or the allocator's ordering.
export function writeDurationList(path, text) {
  const parts = existsSync(path)
    ? readParts(path)
    : [{ path, header: [], seconds: new Map() }];
  const refreshed = parseDurationList(text, path);
  const source = refreshed.header.find((line) => line.startsWith("# Source:"));
  const owner = new Map();
  for (const [index, part] of parts.entries()) {
    for (const label of part.seconds.keys()) {
      if (!owner.has(label)) owner.set(label, index);
    }
  }
  const rows = parts.map(() => new Map());
  for (const [label, value] of refreshed.seconds) {
    rows[owner.get(label) ?? 0].set(label, value);
  }
  for (const [index, part] of parts.entries()) {
    const header =
      index === 0
        ? refreshed.header
        : [
            ...part.header.filter((line) => !line.startsWith("# Source:")),
            ...(source === undefined ? [] : [source]),
          ];
    writeFileSync(
      part.path,
      `${[...header, ...formatTimes(rows[index])].join("\n")}\n`,
    );
  }
}
