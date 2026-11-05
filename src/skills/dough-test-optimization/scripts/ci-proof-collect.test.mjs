import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "./ci-proof-collect.mjs";
import {
  fragmentProblems,
  summaryArtifactName,
  summaryProblems,
} from "./ci-proof-contract.mjs";
import {
  adapterRun,
  attemptId,
  fragment,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

const read = (...values) =>
  values.map((value, index) => ({ source: `fragment-${index}.json`, value }));

// An adapter attempt's fragment: the fixture fragment named by ID instead.
const adapterFragment = (entry, part, of, counts, id = attemptId) =>
  fragment(entry, part, of, counts, { attempt: undefined, attemptId: id });

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

test("an earlier attempt's, an adapter attempt's or another revision's fragment is excluded, never filling a part (example 2)", () => {
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
      adapterFragment("dashboard/tests", 2, 2, { passed: 8 }, "2"),
    ),
    expect: [{ entry: "dashboard/tests", parts: 2 }],
    run,
  });
  assert.equal(summary.entries[0].passed, 12);
  assert.deepEqual(summary.entries[0].parts[1], { part: 2, status: "missing" });
  assert.deepEqual(notes, [
    "excluded fragment-1.json: attempt 1, not attempt 2",
    `excluded fragment-2.json: revision ${"b".repeat(40)}, not ${revision}`,
    "excluded fragment-3.json: attemptId 2, not attempt 2",
  ]);
});

test("an adapter attempt's summary names its attemptId and keeps only fragments of that attempt and revision", () => {
  const { summary, notes } = summarize({
    fragments: read(
      adapterFragment("tests", 1, 1, { passed: 1000, other: 3 }),
      adapterFragment("tests", 1, 1, { passed: 9 }, "another"),
      fragment("tests", 1, 1, { passed: 7 }),
      { ...adapterFragment("tests", 1, 1, {}), revision: "b".repeat(40) },
    ),
    expect: [{ entry: "tests", parts: 1 }],
    run: adapterRun,
  });
  assert.deepEqual(notes, [
    `excluded fragment-1.json: attemptId another, not attemptId ${attemptId}`,
    `excluded fragment-2.json: attempt 2, not attemptId ${attemptId}`,
    `excluded fragment-3.json: revision ${"b".repeat(40)}, not ${revision}`,
  ]);
  assert.deepEqual(summaryProblems(summary), []);
  const { entries, ...attempt } = summary;
  assert.deepEqual(attempt, {
    schemaVersion: 1,
    repository: "O/P",
    attemptId,
    revision,
  });
  assert.deepEqual(
    entries.map((entry) => [entry.path, entry.passed, entry.other]),
    [["tests", 1000, 3]],
  );
});

test("a fragment or summary names exactly one attempt identity", () => {
  const github = fragment("tests", 1, 1, {});
  const neither = { ...github, attempt: undefined };
  assert.deepEqual(fragmentProblems({ ...github, attemptId }), [
    "names both attempt and attemptId",
  ]);
  assert.deepEqual(fragmentProblems(neither), [
    "names neither attempt nor attemptId",
  ]);
  assert.deepEqual(fragmentProblems({ ...neither, attemptId: 7 }), [
    "attemptId is not a string",
  ]);
  const { summary } = summarize({ fragments: [], expect: [], run: adapterRun });
  assert.deepEqual(summaryProblems({ ...summary, runId: 1, runAttempt: 1 }), [
    "names both runId and runAttempt and attemptId",
  ]);
  assert.deepEqual(summaryProblems({ ...summary, attemptId: undefined }), [
    "names neither runId and runAttempt nor attemptId",
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
