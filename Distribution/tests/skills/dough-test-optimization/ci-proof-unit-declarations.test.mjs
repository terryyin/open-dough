import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-collect.mjs";
import { summaryProblems } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import {
  fragmentsRead as read,
  partStatuses as statuses,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

test("the collector refuses an omitted or unsupported expectation unit", () => {
  for (const declaration of [
    { entry: "tests", parts: 1 },
    { entry: "tests", parts: 1, unit: "legacy" },
  ]) {
    assert.throws(
      () => summarize({ fragments: [], expect: [declaration], run }),
      /^Error: entry tests requires a unit of case or file$/,
    );
  }
});

test("wrong-unit and retired uploaded fragments leave their parts missing", () => {
  const part = (number, unit) =>
    makeMe.aCiProofFragment
      .at("tests")
      .part(number, 3)
      .ofAttempt(run.attempt, revision)
      .inUnit(unit);
  const retired = {
    ...part(2, "case").counting(4).timed(9000).please(),
    unit: "legacy",
    label: "checks",
  };
  const { summary, notes } = summarize({
    fragments: read(
      part(1, "file").counting(3).timed(5000).please(),
      retired,
      part(3, "case").counting(2).timed(100).please(),
    ),
    expect: [{ entry: "tests", parts: 3, unit: "case" }],
    run,
  });

  assert.deepEqual(notes, [
    "excluded fragment-0.json: entry tests declares no parts for test files",
    "excluded fragment-1.json: unit is not case, file",
  ]);
  assert.deepEqual(summaryProblems(summary), []);
  const [tests] = summary.entries[0].evidence;
  assert.deepEqual(
    [tests.unit, tests.passed, tests.durationMs, statuses(tests)],
    ["case", 2, 100, ["missing", "missing", "present"]],
  );
});

test("each entry and unit is declared once", () => {
  assert.throws(
    () =>
      summarize({
        fragments: [],
        expect: [
          { entry: "tests", parts: 1, unit: "file" },
          { entry: "tests", parts: 2, unit: "file" },
        ],
        run,
      }),
    /^Error: entry tests is declared twice for test files$/,
  );
});
