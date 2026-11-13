// Reconciles a later native list against the stored SEED-334 manifest
// (./migration-manifest.mjs). Run from the repository root after a migration
// edit:
//
//   node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-reconcile.mjs \
//     --manifest <manifest.jsonl> --moves <moves.json> [--case-moves <case-moves.json>] \
//     --after <umbrella-list.json> [--frontend <frontend-list.json>] \
//     [--backend <backend-list.json>] [--added <added.json>] --after-out <result.json>
//
// Every base case must be selected exactly once at its destination
// (./migration-cases.mjs) and no case may appear that the base did not have,
// except new proof cases --added lists; each focused runner's own list must
// select exactly the umbrella's cases under its root. It exits 1 otherwise.
import { readFileSync, writeFileSync } from "node:fs";
import {
  caseDestination,
  cases,
  count,
  moves,
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
const after = cases(options.after);
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
const afterMembership = shards();
const result = {
  kind: "reconciliation",
  specs: after.specs.length,
  cases: after.cases.length,
  specsByRoot: count(after.specs, (spec) => spec.split("/")[0]),
  casesBySourceRoot: count(after.cases, (one) => one.source.split("/")[0]),
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
for (const [runner, root] of [
  ["frontend", "frontend-tests/"],
  ["backend", "backend-tests/"],
]) {
  if (!options[runner]) continue;
  const own = (one) => `${one.spec}\0${one.source}\0${one.title}`;
  const list = cases(options[runner]);
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
writeFileSync(options["after-out"], `${JSON.stringify(result, null, 1)}\n`);
