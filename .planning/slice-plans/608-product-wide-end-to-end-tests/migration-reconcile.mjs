// Reconciles a later native list against the stored SEED-334 manifest
// (./migration-manifest.mjs). Run from the repository root after a migration
// edit:
//
//   node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconcile.mjs \
//     --manifest <manifest.jsonl> --moves <moves.json> [--case-moves <case-moves.json>] \
//     (--after <umbrella-list.json> | --integrated <integrated-list.json>) \
//     [--frontend <frontend-list.json>] [--backend <backend-list.json>] \
//     [--e2e <e2e-list.json>] [--added <added.json>] --after-out <result.json>
//
// Every base case must be selected exactly once at its destination
// (./migration-cases.mjs) and no case may appear that the base did not have,
// except new proof cases --added lists. Through slice 3 each focused runner's
// own list must select exactly the umbrella's cases under its root; from
// slice 4, with no umbrella, the four groups' own lists (--integrated and the
// rest) together are the selection, each spec in one group's CI shard. It
// exits 1 otherwise.
import { readFileSync, writeFileSync } from "node:fs";
import {
  caseDestination,
  cases,
  count,
  moves,
  groupShards,
  options,
  shards,
} from "./migration-cases.mjs";

// The stored manifest, not the moved checkout.
const recorded = readFileSync(options.manifest, "utf8")
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line))
  .filter((line) => line.kind === "case")
  .map((line) => ({
    spec: line.spec,
    source: line.source ?? line.spec,
    title: line.title,
    project: line.project ?? "chromium",
  }));
// From slice 4 the groups' own lists, labelled relative to `dashboard/`.
const union = (lists) => ({
  specs: lists.flatMap((list) => list.specs),
  cases: lists.flatMap((list) => list.cases),
});
const after = options.after
  ? cases(options.after)
  : union([
      cases(options.integrated),
      cases(options.frontend),
      cases(options.backend),
      cases(options.e2e, "../e2e/"),
    ]);
// `e2e` for the sibling root (`../e2e/…`), else the first segment.
const root = (file) => (file.startsWith("../e2e/") ? "e2e" : file.split("/")[0]);
const key = (one) => `${one.spec}\0${one.source}\0${one.title}\0${one.project}`;
const expected = new Map();
for (const one of recorded) {
  const at = key({ ...one, ...caseDestination(one) });
  expected.set(at, (expected.get(at) ?? 0) + 1);
}
// --added lists cases a slice wrote for new proof, not migrated ones.
const added = options.added ? JSON.parse(readFileSync(options.added, "utf8")) : [];
for (const one of added) {
  const at = key({ source: one.spec, project: "chromium", ...one });
  expected.set(at, (expected.get(at) ?? 0) + 1);
}
const seen = new Map();
for (const one of after.cases) seen.set(key(one), (seen.get(key(one)) ?? 0) + 1);
const missing = [...expected].filter(([at, n]) => seen.get(at) !== n);
const unexpected = [...seen].filter(([at]) => !expected.has(at));
const afterMembership = options.after ? shards() : await groupShards();
const result = {
  kind: "reconciliation",
  specs: after.specs.length,
  cases: after.cases.length,
  specsByRoot: count(after.specs, root),
  casesBySourceRoot: count(after.cases, (one) => root(one.source)),
  missingOrRepeated: missing.map(([at]) => at.split("\0")),
  addedProofCases: added.length,
  unexpected: unexpected.map(([at]) => at.split("\0")),
  movedSpecShards: Object.fromEntries(
    [
      ...Object.values(moves).map((move) => move.to),
      ...recorded
        .map((one) => caseDestination(one).spec)
        .filter((spec, index) => spec !== recorded[index]?.spec),
    ]
      .filter((spec) => spec.endsWith(".spec.ts"))
      .filter((spec, index, all) => all.indexOf(spec) === index)
      .toSorted()
      .map((spec) => [spec, afterMembership.get(spec)]),
  ),
};
if (missing.length > 0 || unexpected.length > 0) process.exitCode = 1;

// Each focused runner's own list selects exactly the umbrella's cases under
// its root (project names differ by runner).
// E2E Test lists paths relative to `e2e/`.
for (const [runner, root, prefix] of [
  ["frontend", "frontend-tests/", ""],
  ["backend", "backend-tests/", ""],
  ["e2e", "../e2e/", "../e2e/"],
]) {
  if (!options[runner] || !options.after) continue;
  const own = (one) => `${one.spec}\0${one.source}\0${one.title}`;
  const list = cases(options[runner], prefix);
  const umbrella = after.cases.filter((one) => one.spec.startsWith(root)).map(own).sort();
  const selected = list.cases.map(own).sort();
  result[`${runner}Runner`] = {
    specs: list.specs.length,
    cases: list.cases.length,
    projects: [...new Set(list.cases.map((one) => one.project))],
    onlyUmbrella: umbrella.filter((at) => !selected.includes(at)).length,
    onlyRunner: selected.filter((at) => !umbrella.includes(at)).length,
    sameMultiset: JSON.stringify(umbrella) === JSON.stringify(selected),
  };
  if (!result[`${runner}Runner`].sameMultiset) process.exitCode = 1;
}
// Slice 4 onward: each group's own selection, and every selected spec in
// exactly one CI shard of its own group.
if (!options.after) {
  for (const runner of ["integrated", "frontend", "backend", "e2e"]) {
    const list = cases(options[runner]);
    result[`${runner}Runner`] = {
      specs: list.specs.length,
      cases: list.cases.length,
      projects: [...new Set(list.cases.map((one) => one.project))],
    };
  }
  const unsharded = after.specs.filter((spec) => !afterMembership.has(spec));
  result.specsWithoutGroupShard = unsharded;
  result.groupShardSpecs = count(after.specs, (spec) => afterMembership.get(spec));
  if (unsharded.length > 0 || afterMembership.size !== after.specs.length)
    process.exitCode = 1;
}
writeFileSync(options["after-out"], `${JSON.stringify(result, null, 1)}\n`);
