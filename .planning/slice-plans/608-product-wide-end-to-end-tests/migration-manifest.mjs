// Writes the SEED-334 migration manifest from a native Playwright JSON list
// (`npm run test:dashboard -- --list --reporter=json`) and the checkout's
// shard, timing and CI proof inputs. Run from the repository root:
//
//   node .planning/slice-plans/608-product-wide-end-to-end-tests/migration-manifest.mjs \
//     --list <base-list.json> --revision <sha> --moves <moves.json> --out <manifest.jsonl>
//
// at the base checkout writes the manifest. After a migration edit,
//
//   node <this> --manifest <manifest.jsonl> --moves <moves.json> \
//     --after <umbrella-list.json> [--frontend <frontend-list.json>] \
//     [--added <added.json>] --after-out <result.json>
//
// reconciles a later native list against the stored manifest: every base case
// must be selected exactly once at its destination and no case may appear
// that the base did not have, except new proof cases --added lists; it exits
// 1 otherwise. --moves maps each moved
// old spec or registering-source path (relative to dashboard/) to its
// destination and slice.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readDurationList } from "../../../scripts/share-deal.mjs";
import { dashboardTestProjects } from "../../../dashboard/tests/support/testFiles.mjs";

const shardCount = 13;
const options = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce((pairs, value, index, all) =>
      index % 2 === 0 ? [...pairs, [value.replace(/^--/, ""), all[index + 1]]] : pairs,
    [], ),
);
const repo = process.cwd();
const dashboard = path.join(repo, "dashboard");

function cases(listFile) {
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

// Spec → shard i of 13, as CI's OPEN_DOUGH_DASHBOARD_SPLIT deals it now.
function shards() {
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

const moves = options.moves ? JSON.parse(readFileSync(options.moves, "utf8")) : {};
function destination(file) {
  const move = moves[file];
  if (move !== undefined) return { destination: move.to, slice: move.slice };
  if (file.startsWith("tests/")) return { destination: "pending: slice 2/3 inventory" };
  return { destination: file, slice: "unchanged" };
}

function count(items, key) {
  const totals = {};
  for (const item of items) totals[key(item)] = (totals[key(item)] ?? 0) + 1;
  return totals;
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
      ...(destination(one.source).destination === destination(one.spec).destination
        ? {}
        : { destination: destination(one.source).destination }),
    }));
  writeFileSync(
    options.out,
    [header, ...specLines, ...caseLines].map((line) => JSON.stringify(line)).join("\n") + "\n",
  );
}

// Reconciliation reads the stored manifest, not the moved checkout.
if (options.after) {
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
  const moved = (file) => moves[file]?.to ?? file;
  const key = (one) => `${one.spec}\0${one.source}\0${one.title}\0${one.project}`;
  const expected = new Map();
  for (const one of recorded) {
    const at = key({ ...one, spec: moved(one.spec), source: moved(one.source) });
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
      Object.entries(moves)
        .filter(([, move]) => move.to.endsWith(".spec.ts"))
        .map(([, move]) => [move.to, afterMembership.get(move.to)]),
    ),
  };
  // --frontend: the frontend runner's own list must select exactly the
  // umbrella's frontend-tests cases (project names differ by runner).
  if (options.frontend) {
    const own = (one) => `${one.spec}\0${one.source}\0${one.title}`;
    const frontend = cases(options.frontend);
    const umbrella = after.cases.filter((one) => one.spec.startsWith("frontend-tests/")).map(own).sort();
    const runner = frontend.cases.map(own).sort();
    result.frontendRunner = {
      specs: frontend.specs.length,
      cases: frontend.cases.length,
      projects: [...new Set(frontend.cases.map((one) => one.project))],
      onlyUmbrella: umbrella.filter((at) => !runner.includes(at)).length,
      onlyRunner: runner.filter((at) => !umbrella.includes(at)).length,
      sameMultiset: JSON.stringify(umbrella) === JSON.stringify(runner),
    };
    if (!result.frontendRunner.sameMultiset) process.exitCode = 1;
  }
  writeFileSync(options["after-out"], `${JSON.stringify(result, null, 1)}\n`);
  if (missing.length > 0 || unexpected.length > 0) process.exitCode = 1;
}
