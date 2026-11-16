// Proposes the one pattern change to a CI test group's shard declaration that
// leaves the lowest slowest-shard total, as a unified diff to the workflow, for
// scripts/ci-shard-balance.mjs to print after its report. The candidates are
// moving one existing pattern to another shard (to the last shard, by deleting
// it, so its files fall to the rest) and giving a shard but the last one new
// pattern out of the last shard's rest: a folder (`dir/**`) at any depth or a
// file-name prefix up to the first `-` (`dir/agent-*`) of a rest file, matching
// only rest files. A candidate that would leave a shard but the last without
// patterns, or would match a file under two shards, is never proposed, and the
// proposed workflow text is read and selected again through
// scripts/test-share-declaration.mjs and scripts/test-share-matrix.mjs. When
// the best change lowers the slowest shard by less than a twentieth of the even
// total, the shards are balanced and nothing is proposed. Nothing is written.

import { matchesGlob, posix } from "node:path";
import {
  readShareDeclaration,
  ShareMatrixError,
} from "./test-share-declaration.mjs";
import { selectShare } from "./test-share-matrix.mjs";

const bytewise = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));
const sum = (values) => values.reduce((total, value) => total + value, 0);
const indentOf = (line) => /^ */.exec(line)[0].length;

// The folder and file-name-prefix patterns of the rest's files that match
// only rest files, in bytewise order.
function restPatterns(rest, files) {
  const patterns = new Set();
  for (const file of rest) {
    const parts = file.split("/");
    for (let depth = 1; depth < parts.length; depth += 1) {
      patterns.add(`${parts.slice(0, depth).join("/")}/**`);
    }
    const name = parts.at(-1);
    if (name.includes("-")) {
      patterns.add(posix.join(posix.dirname(file), `${name.split("-")[0]}-*`));
    }
  }
  const restSet = new Set(rest);
  return [...patterns].sort(bytewise).flatMap((pattern) => {
    const matched = files.filter((file) => matchesGlob(file, pattern));
    return matched.every((file) => restSet.has(file))
      ? [{ pattern, matched }]
      : [];
  });
}

// Every valid single change: which pattern goes from which shard (undefined:
// the rest) to which, and the seconds it carries.
function candidates({ shards, medians }) {
  const files = shards.flatMap((shard) => shard.files);
  const seconds = (matched) =>
    sum(matched.map((file) => medians.get(file) ?? 0));
  const last = shards.at(-1);
  const found = [];
  for (const from of shards.slice(0, -1)) {
    for (const pattern of from.patterns) {
      const matched = files.filter((file) => matchesGlob(file, pattern));
      const kept = from.patterns.filter((other) => other !== pattern);
      const shared = matched.some((file) =>
        kept.some((other) => matchesGlob(file, other)),
      );
      if (shared || kept.length === 0) continue;
      for (const to of shards) {
        if (to === from) continue;
        found.push({ pattern, from, to, seconds: seconds(matched) });
      }
    }
  }
  for (const { pattern, matched } of restPatterns(last.files, files)) {
    for (const to of shards.slice(0, -1)) {
      found.push({ pattern, from: last, to, seconds: seconds(matched) });
    }
  }
  return found;
}

// The totals after `change`, in shard order.
function totalsAfter(shards, { from, to, seconds }) {
  return shards.map(
    (shard) =>
      shard.total -
      (shard === from ? seconds : 0) +
      (shard === to ? seconds : 0),
  );
}

// Lower slowest total first, then the lower next-slowest totals, then
// generation order.
function compareTotals(a, b) {
  const x = [...a].sort((p, q) => q - p);
  const y = [...b].sort((p, q) => q - p);
  for (let at = 0; at < x.length; at += 1) {
    if (x[at] !== y[at]) return x[at] - y[at];
  }
  return 0;
}

// Workflow line index and lead text of each pattern share's pattern line.
function patternLines(lines, job) {
  const jobAt = lines.findIndex((line) => line.trim() === `${job}:`);
  const found = new Map();
  let share;
  for (const [at, line] of lines.entries()) {
    if (at <= jobAt || line.trim() === "") continue;
    if (indentOf(line) <= indentOf(lines[jobAt])) break;
    const entry = /^\s*- share: (\S+)$/.exec(line);
    if (entry) share = entry[1];
    const tests = /^(\s*tests: )/.exec(line);
    const spec = /^(\s*(\d+): )/.exec(line);
    if (tests && share) found.set(share, { at, lead: tests[1] });
    if (spec) found.set(spec[2], { at, lead: spec[1] });
  }
  return found;
}

// The workflow text with `change` applied.
function changedText(text, job, shards, change) {
  const lines = text.split("\n");
  const where = patternLines(lines, job);
  for (const shard of shards.slice(0, -1)) {
    let patterns = shard.patterns;
    if (shard === change.from) {
      patterns = patterns.filter((pattern) => pattern !== change.pattern);
    }
    if (shard === change.to) patterns = [...patterns, change.pattern];
    if (patterns === shard.patterns) continue;
    const { at, lead } = where.get(shard.share);
    lines[at] = `${lead}${patterns.join(" ")}`;
  }
  return lines.join("\n");
}

/**
 * A unified diff of `file` between two texts with the same line count, three
 * lines of context.
 */
function lineDiff(file, before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  const changed = a.flatMap((line, at) => (line === b[at] ? [] : [at]));
  const end = before.endsWith("\n") ? a.length - 1 : a.length;
  const hunks = [];
  for (const at of changed) {
    const start = Math.max(0, at - 3);
    const stop = Math.min(end, at + 4);
    const previous = hunks.at(-1);
    if (previous && start <= previous.stop) previous.stop = stop;
    else hunks.push({ start, stop });
  }
  return [
    `diff --git a/${file} b/${file}`,
    `--- a/${file}`,
    `+++ b/${file}`,
    ...hunks.flatMap(({ start, stop }) => [
      `@@ -${start + 1},${stop - start} +${start + 1},${stop - start} @@`,
      ...a
        .slice(start, stop)
        .flatMap((line, offset) =>
          line === b[start + offset]
            ? [` ${line}`]
            : [`-${line}`, `+${b[start + offset]}`],
        ),
    ]),
  ];
}

/**
 * The single change leaving the lowest slowest-shard total, or undefined when
 * none lowers it by a twentieth of the even total.
 * @param {{shards: {share: string, patterns?: string[], files: string[], total: number}[], even: number, medians: Map<string, number>}} report
 * @param {string} text workflow file text
 * @param {string} file workflow file name
 * @param {string} job the group's job id
 */
export function proposeChange(report, text, file, job) {
  const { shards, even } = report;
  if (shards.length < 2) return undefined;
  const slowest = Math.max(...shards.map(({ total }) => total));
  const files = shards.flatMap((shard) => shard.files);
  const ranked = candidates(report)
    .map((change) => ({ ...change, totals: totalsAfter(shards, change) }))
    .filter(({ totals }) => slowest - Math.max(...totals) >= even / 20)
    .sort((x, y) => compareTotals(x.totals, y.totals));
  for (const change of ranked) {
    const proposed = changedText(text, job, shards, change);
    try {
      selectShare(readShareDeclaration(proposed, file, job), files);
    } catch (error) {
      if (error instanceof ShareMatrixError) continue;
      throw error;
    }
    return { ...change, diff: lineDiff(file, text, proposed) };
  }
  return undefined;
}

const s = (value) => `${Math.round(value)} s`;

/** The proposal's printed lines. */
export function formatProposal(report, change) {
  const { shards, even } = report;
  const slowest = Math.max(...shards.map(({ total }) => total));
  if (!change) {
    return [
      `Balanced: no single pattern change lowers the slowest shard (${s(slowest)}) by a twentieth of the even total (${s(even / 20)}); no diff proposed.`,
    ];
  }
  const last = shards.at(-1);
  const what =
    change.from === last
      ? `give shard ${change.to.share} the new pattern ${change.pattern} from the last shard's rest`
      : `move ${change.pattern} from shard ${change.from.share} to shard ${change.to.share}${change.to === last ? ", the rest" : ""}`;
  return [
    `Proposed change: ${what}; the slowest shard falls from ${s(slowest)} to ${s(Math.max(...change.totals))}.`,
    ...shards.map(
      ({ share }, at) => `Shard ${share} after: ${s(change.totals[at])}`,
    ),
    ...change.diff,
  ];
}
