// What the SEED-334 manifest generator (./migration-manifest.mjs) and
// reconciler (./migration-reconcile.mjs) share: their options, the cases of a
// native Playwright JSON list, the old 13-shard deal, and where each base
// spec and case goes.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { dashboardTestProjects } from "../../../dashboard/tests/support/testFiles.mjs";

export const shardCount = 13;
export const repo = process.cwd();
export const dashboard = path.join(repo, "dashboard");

// `--name value` pairs.
export const options = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce((pairs, value, index, all) =>
      index % 2 === 0 ? [...pairs, [value.replace(/^--/, ""), all[index + 1]]] : pairs,
    [], ),
);

const json = (file, empty) =>
  file ? JSON.parse(readFileSync(file, "utf8")) : empty;

// Every declared case of a native list, by enclosing spec, declaring source,
// describe › title path and project.
export function cases(listFile) {
  const list = JSON.parse(readFileSync(listFile, "utf8"));
  if (list.errors.length > 0) throw new Error(`${listFile} has list errors`);
  const found = [];
  const walk = (suite, spec, titles) => {
    for (const declared of suite.specs ?? [])
      for (const test of declared.tests)
        found.push({
          spec,
          source: declared.file,
          line: declared.line,
          title: [...titles, declared.title].join(" › "),
          project: test.projectName,
        });
    for (const child of suite.suites ?? [])
      walk(child, spec, [...titles, child.title]);
  };
  for (const file of list.suites) walk(file, file.file, []);
  return { specs: list.suites.map((suite) => suite.file), cases: found };
}

export function count(items, key) {
  const totals = {};
  for (const item of items) totals[key(item)] = (totals[key(item)] ?? 0) + 1;
  return totals;
}

// Spec → shard i of 13, as the umbrella's OPEN_DOUGH_DASHBOARD_SPLIT deals it.
export function shards() {
  const membership = new Map();
  for (let share = 1; share <= shardCount; share++)
    for (const project of dashboardTestProjects(
      pathToFileURL(`${dashboard}/`),
      `${share}/${shardCount}`,
    ))
      for (const pattern of project.testMatch)
        membership.set(
          path.relative(dashboard, pattern.source.slice(1, -1).replace(/\\(.)/g, "$1")),
          share,
        );
  return membership;
}

// --moves: old spec or registering-module path → { to, slice }.
// --case-moves: [{ spec, source?, title, to, toSource?, slice }] for a case
// that left its spec while the spec stayed (its new spec, and its new source
// when that is not the new spec).
// --classes: integrated spec → purpose note, for a spec read and left for a
// later slice.
export const moves = json(options.moves, {});
const caseMoves = json(options["case-moves"], []);
const classes = json(options.classes, {});
const caseKey = (one) => `${one.spec}\0${one.source ?? one.spec}\0${one.title}`;
const movedCases = new Map(caseMoves.map((move) => [caseKey(move), move]));

export function destination(file) {
  const move = moves[file];
  if (move !== undefined) return { destination: move.to, slice: move.slice };
  if (classes[file] !== undefined)
    return { destination: `pending: slice 3 — ${classes[file]}` };
  if (file.startsWith("tests/")) return { destination: "pending: slice 2/3 inventory" };
  return { destination: file, slice: "unchanged" };
}

// Where a base case is declared after the migration: `{ spec, source }`.
export function caseDestination(one) {
  const move = movedCases.get(caseKey(one));
  if (move !== undefined)
    return { spec: move.to, source: move.toSource ?? move.to, slice: move.slice };
  const moved = (file) => moves[file]?.to ?? file;
  return { spec: moved(one.spec), source: moved(one.source ?? one.spec) };
}
