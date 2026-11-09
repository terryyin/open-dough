// The part of a CI proof summary a lead reading's scope holds
// (./ci-proof-scope.mjs): its items at the granularity the summary supports,
// its entries' part statuses, and the gaps that keep its figures partial.
// An entry with results in several units, and legacy results:
// ./ci-proof-scope-units.test.mjs. Ranking them: ./ci-proof-ranking.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { scopeOf } from "./ci-proof-scope.mjs";

const summaryOf = (...entries) =>
  makeMe.aCiProofSummary.withEntries(...entries).please();

const pathsOf = (items) => items.map((item) => item.path);

test("an entry broken down by file puts each file in scope with its unit, results and time; a scope path inside the entry keeps only the files under it", () => {
  const summary = summaryOf(
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .withFile("dashboard/tests/intent/a.spec.ts", {
        passed: 4,
        durationMs: 8000,
      })
      .withFile("dashboard/tests/runtime/b.spec.ts", {
        passed: 2,
        durationMs: 3000,
      })
      .please(),
    makeMe.aCiProofEntry
      .at("tests")
      .counting(1, "file")
      .withFile("tests/c.sh", { durationMs: 500 })
      .please(),
  );

  const whole = scopeOf(summary, ["dashboard/tests"]);
  assert.deepEqual(whole.items, [
    {
      path: "dashboard/tests/intent/a.spec.ts",
      entry: "dashboard/tests",
      kind: "file",
      unit: "case",
      folder: "dashboard/tests/intent",
      results: 4,
      failed: 0,
      untimed: 0,
      durationMs: 8000,
    },
    {
      path: "dashboard/tests/runtime/b.spec.ts",
      entry: "dashboard/tests",
      kind: "file",
      unit: "case",
      folder: "dashboard/tests/runtime",
      results: 2,
      failed: 0,
      untimed: 0,
      durationMs: 3000,
    },
  ]);
  assert.deepEqual(whole.entries, [
    {
      path: "dashboard/tests",
      units: [{ unit: "case", of: 1, present: 1, missing: [], ambiguous: [] }],
    },
  ]);
  assert.deepEqual(whole.gaps, []);

  const inside = scopeOf(summary, ["dashboard/tests/runtime", "tests"]);
  assert.deepEqual(pathsOf(inside.items), [
    "dashboard/tests/runtime/b.spec.ts",
    "tests/c.sh",
  ]);
  assert.deepEqual(
    pathsOf(scopeOf(summary, undefined).items),
    pathsOf([...whole.items, ...scopeOf(summary, ["tests"]).items]),
  );
});

test("missing and ambiguous parts stay gaps and their results are not counted; failed results are reported", () => {
  const summary = summaryOf(
    makeMe.aCiProofEntry
      .at("tests")
      .counting(1, "file")
      .inParts(4, { missing: [2, 3], ambiguous: [4] })
      .withFile("tests/a.sh", { passed: 1, failed: 2, durationMs: 900 })
      .please(),
  );

  const held = scopeOf(summary, ["tests"]);
  assert.deepEqual(held.entries[0], {
    path: "tests",
    units: [
      { unit: "file", of: 4, present: 1, missing: [2, 3], ambiguous: [4] },
    ],
  });
  assert.deepEqual(held.gaps, [
    "tests: parts 2, 3 of 4 missing; their results are not counted",
    "tests: part 4 of 4 ambiguous (reported more than once); their results are not counted",
    "tests: 2 test files failed in this attempt",
  ]);
  assert.deepEqual(pathsOf(held.items), ["tests/a.sh"]);
});

test("untimed results stay gaps: a file without a duration cannot rank and a partly timed file's sum is partial", () => {
  const summary = summaryOf(
    makeMe.aCiProofEntry
      .at("tests")
      .withFile("tests/timed.sh", { passed: 3, durationMs: 600, untimed: 1 })
      .withFile("tests/untimed.sh", { passed: 2 })
      .please(),
    makeMe.aCiProofEntry.at("e2e").counting(5, "file").please(),
  );

  const held = scopeOf(summary, ["tests", "e2e"]);
  assert.deepEqual(
    held.items.map(({ path, results, untimed, durationMs }) => ({
      path,
      results,
      untimed,
      durationMs,
    })),
    [
      { path: "tests/timed.sh", results: 3, untimed: 1, durationMs: 600 },
      {
        path: "tests/untimed.sh",
        results: 2,
        untimed: 2,
        durationMs: undefined,
      },
      { path: "e2e", results: 5, untimed: 5, durationMs: undefined },
    ],
  );
  assert.deepEqual(held.gaps, [
    "tests: 3 of 5 test cases recorded no duration; its time sums are partial",
    "e2e: no duration recorded for its 5 test files; they cannot rank",
    "e2e: no file breakdown; its results rank as one entry total",
  ]);
});

test("an entry without a file breakdown ranks as one entry total, and a scope path inside it cannot be measured", () => {
  const summary = summaryOf(
    makeMe.aCiProofEntry.at("tests").counting(7).timed(4200).please(),
  );

  const whole = scopeOf(summary, ["tests"]);
  assert.deepEqual(whole.items, [
    {
      path: "tests",
      entry: "tests",
      kind: "entry",
      unit: "case",
      results: 7,
      failed: 0,
      untimed: 0,
      durationMs: 4200,
    },
  ]);
  assert.deepEqual(whole.noBreakdown, ["tests"]);

  const inside = scopeOf(summary, ["tests/data_source"]);
  assert.deepEqual(inside.items, []);
  assert.deepEqual(inside.noBreakdown, ["tests"]);
  assert.deepEqual(inside.gaps, [
    "tests/data_source: inside tests, whose results have no file breakdown, so they cannot be measured",
  ]);
});

test("parts reported without a breakdown and results not placed in a file rank as one block each, and may hold a narrower scope's results", () => {
  const summary = summaryOf(
    makeMe.aCiProofEntry
      .at("tests")
      .inParts(2)
      .withFile("tests/sub/a.sh", { durationMs: 100 })
      .withUnassigned({ passed: 2, durationMs: 300 })
      .withUnbrokenPart({ passed: 4, durationMs: 4000 })
      .please(),
  );

  const whole = scopeOf(summary, ["tests"]);
  assert.deepEqual(
    whole.items.map(({ path, kind, parts, results, durationMs }) => ({
      path,
      kind,
      parts,
      results,
      durationMs,
    })),
    [
      {
        path: "tests/sub/a.sh",
        kind: "file",
        parts: undefined,
        results: 1,
        durationMs: 100,
      },
      {
        path: "tests",
        kind: "parts",
        parts: [3],
        results: 4,
        durationMs: 4000,
      },
      {
        path: "tests",
        kind: "unassigned",
        parts: undefined,
        results: 2,
        durationMs: 300,
      },
    ],
  );
  assert.deepEqual(whole.gaps, [
    "tests: part 3 of 3 reported no file breakdown; they rank as one block",
    "tests: 2 test cases were not placed in a file; they rank as one block",
  ]);

  const inside = scopeOf(summary, ["tests/sub"]);
  assert.deepEqual(pathsOf(inside.items), ["tests/sub/a.sh"]);
  assert.deepEqual(inside.gaps, [
    "tests/sub: inside tests, whose part 3 of 3 reported no file breakdown; some of its results may be there",
    "tests/sub: inside tests, whose 2 test cases were not placed in a file; some of its results may be among them",
  ]);
});

test("a scope path no entry covers, or under which the summary holds no results, is a gap", () => {
  const summary = summaryOf(
    makeMe.aCiProofEntry
      .at("tests")
      .withFile("tests/a.sh", { durationMs: 100 })
      .please(),
  );

  const held = scopeOf(summary, ["e2e_test/features", "tests/moved"]);
  assert.deepEqual(held.items, []);
  assert.deepEqual(held.gaps, [
    "e2e_test/features: no entry of this summary covers it",
    "tests/moved: the summary holds no results under it",
  ]);
});
