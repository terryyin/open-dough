// Collecting one attempt's fragments into its summary (ci-proof-collect.mjs):
// declared parts are the expectation, a missing part is a gap and a
// duplicated one ambiguous, neither counted, and a summary refuses what is
// wrong. Attempt identity: ci-proof-attempt.test.mjs; units:
// ci-proof-units.test.mjs.
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "./ci-proof-collect.mjs";
import { summaryProblems } from "./ci-proof-contract.mjs";
import {
  fragmentsRead as read,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

test("two dashboard shards and one tests share total without overwriting or double counting (example 1)", () => {
  const { summary, notes } = summarize({
    fragments: read(
      makeMe.aCiProofFragment
        .at("dashboard/tests")
        .part(2, 2)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(7, 1, 0)
        .please(),
      makeMe.aCiProofFragment
        .at("dashboard/tests")
        .part(1, 2)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(12, 0, 0)
        .please(),
      makeMe.aCiProofFragment
        .at("tests")
        .part(1, 1)
        .ofAttempt(run.attempt, revision)
        .inUnit("file")
        .counting(5, 0, 0)
        .please(),
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
    schemaVersion: 2,
    repository: "owner/repo",
    runId: 41776408979,
    runAttempt: 2,
    revision,
    entries: [
      {
        path: "dashboard/tests",
        evidence: [
          {
            unit: "case",
            passed: 19,
            failed: 1,
            other: 0,
            parts: [
              { part: 1, status: "present", passed: 12, failed: 0, other: 0 },
              { part: 2, status: "present", passed: 7, failed: 1, other: 0 },
            ],
          },
        ],
      },
      {
        path: "tests",
        evidence: [
          {
            unit: "file",
            passed: 5,
            failed: 0,
            other: 0,
            parts: [
              { part: 1, status: "present", passed: 5, failed: 0, other: 0 },
            ],
          },
        ],
      },
    ],
  });
  const [dashboard] = summary.entries[0].evidence;
  assert.equal("durationMs" in dashboard, false);
  assert.equal("durationMs" in dashboard.parts[0], false);
});

test("a missing part is a gap, a duplicated part is ambiguous, and neither is counted (example 2)", () => {
  const present = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11].map((part) =>
    makeMe.aCiProofFragment
      .at("dashboard/tests")
      .part(part, 12)
      .ofAttempt(run.attempt, revision)
      .inUnit("case")
      .counting(10, 0, 0)
      .please(),
  );
  const { summary } = summarize({
    fragments: read(
      ...present,
      makeMe.aCiProofFragment
        .at("dashboard/tests")
        .part(12, 12)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(4, 0, 0)
        .please(),
      makeMe.aCiProofFragment
        .at("dashboard/tests")
        .part(12, 12)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(9, 2, 0)
        .please(),
    ),
    expect: [{ entry: "dashboard/tests", parts: 12 }],
    run,
  });
  const [entry] = summary.entries[0].evidence;
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

test("the declaration is the expectation: undeclared, out-of-count and invalid fragments add nothing", () => {
  const { summary, notes } = summarize({
    fragments: read(
      makeMe.aCiProofFragment
        .at("tests")
        .part(1, 3)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(5, 0, 0)
        .please(),
      makeMe.aCiProofFragment
        .at("src/skills")
        .part(1, 3)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(4, 0, 0)
        .please(),
      makeMe.aCiProofFragment
        .at("tests")
        .part(2, 2)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(6, 0, 0)
        .please(),
      { schemaVersion: 2, entry: "tests" },
      undefined,
    ),
    expect: [{ entry: "tests", parts: 3 }],
    run,
  });
  assert.deepEqual(
    summary.entries.map(({ path, evidence: [only] }) => [
      path,
      only.passed,
      only.parts.map((part) => part.status),
    ]),
    [["tests", 5, ["present", "missing", "missing"]]],
  );
  assert.equal(notes.length, 4);
  assert.match(notes[0], /entry src\/skills is not declared/);
  assert.match(notes[1], /of 2, but tests declares 3 parts/);
  assert.match(notes[2], /part is not a positive integer/);
  assert.match(notes[3], /fragment is not a JSON object/);
});

test("an entry declared without a unit and with no present part says no unit, legacy with no label, and counts nothing", () => {
  const { summary } = summarize({
    fragments: [],
    expect: [{ entry: "src/skills", parts: 3 }],
    run,
  });
  assert.deepEqual(summary.entries[0], {
    path: "src/skills",
    evidence: [
      {
        unit: "legacy",
        label: null,
        passed: 0,
        failed: 0,
        other: 0,
        parts: [1, 2, 3].map((part) => ({ part, status: "missing" })),
      },
    ],
  });
  assert.deepEqual(summaryProblems(summary), []);
});

test("summary validation names what is wrong", () => {
  assert.deepEqual(summaryProblems([]), ["summary is not a JSON object"]);
  assert.deepEqual(
    summaryProblems({
      schemaVersion: 3,
      repository: "owner/repo",
      runId: 1,
      runAttempt: 0,
      revision,
      entries: [
        {
          path: "tests",
          evidence: [
            {
              unit: "file",
              passed: 1,
              failed: 0,
              other: 0,
              parts: [{ part: 1, status: "partial" }],
            },
          ],
        },
      ],
    }),
    [
      "schemaVersion is not 1 or 2",
      "runAttempt is not a positive integer",
      "entries[0].evidence[0].parts[0].status is not present, missing, ambiguous",
    ],
  );
});
