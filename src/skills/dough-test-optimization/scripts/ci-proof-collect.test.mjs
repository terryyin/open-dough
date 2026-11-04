import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "./ci-proof-collect.mjs";
import { summaryArtifactName, summaryProblems } from "./ci-proof-contract.mjs";
import { fragment, revision, run } from "./ci-proof-test-fixtures.mjs";

const read = (...values) =>
  values.map((value, index) => ({ source: `fragment-${index}.json`, value }));

test("two dashboard shards and one tests share total without overwriting or double counting (example 1)", () => {
  const { summary, notes } = summarize({
    fragments: read(
      fragment("dashboard/tests", 2, 2, { passed: 7, failed: 1 }),
      fragment("dashboard/tests", 1, 2, { passed: 12 }),
      fragment("tests", 1, 1, { passed: 5 }),
    ),
    expect: [
      { entry: "dashboard/tests", parts: 2 },
      { entry: "tests", parts: 1 },
    ],
    run,
  });
  assert.deepEqual(notes, []);
  assert.deepEqual(summaryProblems(summary), []);
  assert.deepEqual(summary, {
    schemaVersion: 1,
    repository: "owner/repo",
    runId: 41776408979,
    runAttempt: 2,
    revision,
    entries: [
      {
        path: "dashboard/tests",
        unit: "tests",
        passed: 19,
        failed: 1,
        other: 0,
        parts: [
          { part: 1, status: "present", passed: 12, failed: 0, other: 0 },
          { part: 2, status: "present", passed: 7, failed: 1, other: 0 },
        ],
      },
      {
        path: "tests",
        unit: "checks",
        passed: 5,
        failed: 0,
        other: 0,
        parts: [{ part: 1, status: "present", passed: 5, failed: 0, other: 0 }],
      },
    ],
  });
});

test("a missing part is a gap, a duplicated part is ambiguous, and neither is counted (example 2)", () => {
  const present = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11].map((part) =>
    fragment("dashboard/tests", part, 12, { passed: 10 }),
  );
  const { summary } = summarize({
    fragments: read(
      ...present,
      fragment("dashboard/tests", 12, 12, { passed: 4 }),
      fragment("dashboard/tests", 12, 12, { passed: 9, failed: 2 }),
    ),
    expect: [{ entry: "dashboard/tests", parts: 12 }],
    run,
  });
  const [entry] = summary.entries;
  assert.equal(entry.passed, 100);
  assert.equal(entry.failed, 0);
  assert.deepEqual(entry.parts[3], { part: 4, status: "missing" });
  assert.deepEqual(entry.parts[11], { part: 12, status: "ambiguous" });
  assert.equal(
    entry.parts.filter((part) => part.status === "present").length,
    10,
  );
  assert.deepEqual(summaryProblems(summary), []);
});

test("an earlier attempt's or another revision's fragment is excluded, never filling a part (example 2)", () => {
  const { summary, notes } = summarize({
    fragments: read(
      fragment("dashboard/tests", 1, 2, { passed: 12 }),
      fragment("dashboard/tests", 2, 2, { passed: 8 }, { attempt: 1 }),
      fragment(
        "dashboard/tests",
        2,
        2,
        { passed: 8 },
        { revision: "b".repeat(40) },
      ),
    ),
    expect: [{ entry: "dashboard/tests", parts: 2 }],
    run,
  });
  assert.equal(summary.entries[0].passed, 12);
  assert.deepEqual(summary.entries[0].parts[1], { part: 2, status: "missing" });
  assert.deepEqual(notes, [
    "excluded fragment-1.json: attempt 1, not 2",
    `excluded fragment-2.json: revision ${"b".repeat(40)}, not ${revision}`,
  ]);
});

test("the declaration is the expectation: undeclared, out-of-count and invalid fragments add nothing", () => {
  const { summary, notes } = summarize({
    fragments: read(
      fragment("tests", 1, 3, { passed: 5 }),
      fragment("src/skills", 1, 3, { passed: 4 }),
      fragment("tests", 2, 2, { passed: 6 }),
      { schemaVersion: 1, entry: "tests" },
      undefined,
    ),
    expect: [{ entry: "tests", parts: 3 }],
    run,
  });
  assert.deepEqual(
    summary.entries.map((entry) => [
      entry.path,
      entry.passed,
      entry.parts.map((part) => part.status),
    ]),
    [["tests", 5, ["present", "missing", "missing"]]],
  );
  assert.equal(notes.length, 4);
  assert.match(notes[0], /entry src\/skills is not declared/);
  assert.match(notes[1], /of 2, but tests declares 3 parts/);
  assert.match(notes[2], /part is not a positive integer/);
  assert.match(notes[3], /fragment is not a JSON object/);
});

test("an entry with no present part has no unit and zero totals", () => {
  const { summary } = summarize({
    fragments: [],
    expect: [{ entry: "src/skills", parts: 3 }],
    run,
  });
  assert.deepEqual(summary.entries[0], {
    path: "src/skills",
    unit: null,
    passed: 0,
    failed: 0,
    other: 0,
    parts: [1, 2, 3].map((part) => ({ part, status: "missing" })),
  });
  assert.deepEqual(summaryProblems(summary), []);
});

test("the summary artifact name carries the attempt", () => {
  assert.equal(summaryArtifactName(3), "ci-proof-summary-attempt-3");
});

test("summary validation names what is wrong", () => {
  assert.deepEqual(summaryProblems([]), ["summary is not a JSON object"]);
  assert.deepEqual(
    summaryProblems({
      schemaVersion: 2,
      repository: "owner/repo",
      runId: 1,
      runAttempt: 0,
      revision,
      entries: [
        {
          path: "tests",
          unit: "checks",
          passed: 1,
          failed: 0,
          other: 0,
          parts: [{ part: 1, status: "partial" }],
        },
      ],
    }),
    [
      "schemaVersion is not 1",
      "runAttempt is not a positive integer",
      "entries[0].parts[0].status is not present, missing, ambiguous",
    ],
  );
});
