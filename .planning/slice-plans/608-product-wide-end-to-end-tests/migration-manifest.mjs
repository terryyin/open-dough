// Writes the SEED-334 migration manifest from a native Playwright JSON list
// (`npm run test:dashboard -- --list --reporter=json`) and the checkout's
// shard, timing and CI proof inputs. Run from the repository root at the base
// checkout:
//
//   node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.mjs \
//     --list <base-list.json> --revision <sha> --moves <moves.json> \
//     [--case-moves <case-moves.json>] [--classes <classes.json>] --out <manifest.jsonl>
//
// Each record's destination comes from the moves and classes
// (./migration-cases.mjs); ./migration-reconcile.mjs checks a later native
// list against the written manifest.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readDurationList } from "../../../scripts/share-deal.mjs";
import {
  caseDestination,
  cases,
  count,
  dashboard,
  destination,
  moves,
  options,
  repo,
  shardCount,
  shards,
} from "./migration-cases.mjs";

// Label → { seconds, part } from dashboard/longest-first and its parts.
function timings() {
  const { seconds } = readDurationList(path.join(dashboard, "longest-first"));
  const parts = readFileSync(path.join(dashboard, "longest-first"), "utf8")
    .split("\n")
    .flatMap((line) => /^# Include: (.+)$/.exec(line)?.[1] ?? []);
  const partOf = new Map();
  for (const part of parts)
    for (const line of readFileSync(path.join(dashboard, part), "utf8").split("\n")) {
      const label = /^[0-9.]+\t(.+)$/.exec(line)?.[1];
      if (label !== undefined) partOf.set(label, part);
    }
  return { seconds, partOf };
}

// Import-derived boundary of a spec and the modules registering its cases.
// Heuristic ("where known"): real integrations come from the fixture a spec
// imports; it never replaces reading the spec.
function boundary(files) {
  const text = files
    .map((file) => readFileSync(path.join(dashboard, file), "utf8"))
    .join("\n");
  const has = (pattern) => pattern.test(text);
  if (has(/runInnerPlaywright|proofRecordRun|startProofRun/))
    return "harness: inner Playwright run";
  if (has(/comparisonMountPage|comparisonRendering|comparisonRenderer|comparison-mount\//))
    return "frontend: production components with controlled answers";
  if (has(/frontendApp\.ts/)) return "frontend: built app with service substitutes";
  const real = [
    [/dashboardTest\.ts|startDashboardServer|dashboardServer\.ts/, "dashboard server"],
    [/fakeGitHub|FakeGitHub|publishedOrigin|committedOrigin|launchJourney|startOrigin/, "Git origin + synthetic GitHub"],
    [/fakeClaude|fakeCodex|fakeCursor|codexLaunch|cursorStart|claude/i, "synthetic agent hosts"],
    [/productionWatcher/, "production watcher deployments"],
  ].flatMap(([pattern, name]) => (has(pattern) ? [name] : []));
  if (real.length > 0) return `integrated: ${real.join(", ")}`;
  if (has(/setContent/)) return "frontend: DOM content";
  return "unclassified: fixture module not recognized by import heuristic";
}

// A case's destination, only when it differs from its spec's: a moved case
// names its new spec; an integrated module not moved goes with its spec;
// any other module names its own destination.
function caseRecordDestination(one) {
  const spec = destination(one.spec).destination;
  const moved = caseDestination(one);
  const own =
    moved.slice !== undefined
      ? moved.spec
      : one.source.startsWith("tests/") && !(one.source in moves)
        ? spec
        : destination(one.source).destination;
  return own === spec ? {} : { destination: own };
}

if (options.list) {
  const base = cases(options.list);
  const membership = shards();
  const { seconds, partOf } = timings();
  const sourcesOf = new Map();
  for (const one of base.cases)
    sourcesOf.set(one.spec, new Set([...(sourcesOf.get(one.spec) ?? []), one.source]));
  const ci = readFileSync(path.join(repo, ".github/workflows/ci.yml"), "utf8");
  const header = {
    kind: "inputs",
    revision: options.revision,
    command: "npm run test:dashboard -- --list --reporter=json",
    specs: base.specs.length,
    cases: base.cases.length,
    specsByRoot: count(base.specs, (spec) => spec.split("/")[0]),
    casesBySourceRoot: count(base.cases, (one) => one.source.split("/")[0]),
    registeringModules: [...new Set(base.cases.filter((one) => one.source !== one.spec).map((one) => one.source))].sort(),
    shardCount,
    durationList: "dashboard/longest-first",
    durationParts: [...new Set(partOf.values())],
    ciProof: {
      dashboardEntries: /entries: (dashboard\/tests [^\n]+)/.exec(ci)?.[1],
      reportFormat: "playwright-record",
      expect: /expect: ([^\n]+)/.exec(ci)?.[1],
      frontendEntry: /frontend-entry: ([^\n]+)/.exec(ci)?.[1],
      artifacts: ["dashboard-times-<shard>", "dashboard-playwright-report-<shard>", "frontend-test-proof-attempt-<attempt>"],
    },
  };

  const specLines = base.specs.toSorted().map((spec) => ({
    kind: "spec",
    spec,
    shard: membership.get(spec),
    seconds: seconds.get(spec),
    timingPart: partOf.get(spec),
    cases: base.cases.filter((one) => one.spec === spec).length,
    registeringSources: [...sourcesOf.get(spec)].filter((source) => source !== spec),
    boundary: boundary([spec, ...[...sourcesOf.get(spec)].filter((source) => source !== spec)]),
    ...destination(spec),
  }));
  const caseLines = base.cases
    .toSorted((a, b) => `${a.spec}\0${a.source}\0${a.line}\0${a.title}`.localeCompare(`${b.spec}\0${b.source}\0${b.line}\0${b.title}`))
    // Compact: source only when another module registers the case, project
    // only for the production-chain project, destination only when it differs
    // from the enclosing spec's.
    .map((one) => ({
      kind: "case",
      spec: one.spec,
      ...(one.source === one.spec ? {} : { source: one.source }),
      line: one.line,
      title: one.title,
      ...(one.project === "chromium" ? {} : { project: one.project }),
      ...caseRecordDestination(one),
    }));
  writeFileSync(
    options.out,
    [header, ...specLines, ...caseLines].map((line) => JSON.stringify(line)).join("\n") + "\n",
  );
}
