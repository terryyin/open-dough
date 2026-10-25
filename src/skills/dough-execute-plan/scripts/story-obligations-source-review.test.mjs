import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  fixture,
  holdings,
  obligation,
  slicePlan,
  sourceReview,
} from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  problemCommitments,
  refuses,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";

function reviewed(t, rows, { entries = "", done = [] } = {}) {
  const { plan, writePlan } = fixture(t);
  const writeReview = (next) =>
    writeFileSync(join(dirname(plan), "source-review.md"), sourceReview(next));
  writePlan(slicePlan(entries, { done, review: true }));
  writeReview(rows);
  return { plan, writePlan, writeReview };
}

test("every returned commitment needs an allocated slice or a disposing obligation", (t) => {
  const { plan, writeReview } = reviewed(t, [
    ["1", "Each row names its source", "slice 2", ""],
    ["2", "Each exit row names its source", "", ""],
    ["3", "The panel shows the source", "slice 9", ""],
  ]);
  for (const args of [[], ["--slice", "1"], ["--completion"]]) {
    const result = check(plan, ...args);
    refusesCommitment(result, "unallocated-commitment", "2");
    refusesCommitment(result, "unallocated-commitment", "3", { slice: 9 });
  }
  writeReview([
    ["1", "Each row names its source", "slice 2", ""],
    ["2", "Each exit row names its source", "slice 3", ""],
  ]);
  assert.deepEqual(check(plan, "--slice", "1"), {
    ok: true,
    entryCount: 0,
    commitmentCount: 2,
  });
});

test("the allocated slice cannot finish until its commitment is observed", (t) => {
  const { plan, writeReview } = reviewed(t, [
    ["1", "Each row names its source", "slice 2", ""],
    ["2a", "Exit rows name the source", "slice 3", ""],
  ]);
  const atTwo = check(plan, "--slice", "2");
  refusesCommitment(atTwo, "unobserved-commitment", "1", { slice: 2 });
  assert.equal(atTwo.problems.length, 1, JSON.stringify(atTwo));
  writeReview([
    ["1", "Each row names its source", "slice 2", "observed: rows.test.mjs"],
    ["2a", "Exit rows name the source", "slice 3", ""],
  ]);
  assert.equal(check(plan, "--slice", "2").ok, true);
  refusesCommitment(check(plan, "--slice", "3"), "unobserved-commitment", "2a");
  refusesCommitment(
    check(plan, "--completion"),
    "unobserved-commitment",
    "2a",
    {
      boundary: "completion",
    },
  );
});

test("a done allocated slice without an observation stays refused", (t) => {
  const { plan } = reviewed(
    t,
    [["1", "Each row names its source", "slice 2", ""]],
    { done: [1, 2] },
  );
  refusesCommitment(check(plan, "--slice", "3"), "unobserved-commitment", "1", {
    slice: 2,
  });
});

test("an obligation disposes the commitments it names and keeps its own gate", (t) => {
  const fromSliceOne = { ...holdings, reportedSlice: 1 };
  const entry = `${obligation(fromSliceOne, "receiving slice 4")}\nCommitment: 1, 2`;
  const { plan, writePlan } = reviewed(
    t,
    [
      ["1", "Each signal row names that source", "", "G1"],
      ["2", "Each exit row names that source", "slice 4", "G1"],
    ],
    { entries: entry, done: [1, 2, 3] },
  );
  assert.equal(check(plan, "--slice", "3").ok, true);
  const atFour = check(plan, "--slice", "4");
  refuses(atFour, "open-obligation");
  assert.deepEqual(problemCommitments(atFour, "open-obligation"), ["1", "2"]);
  writePlan(
    slicePlan(
      `${obligation(fromSliceOne, "proved by slice 4: holdings.test.mjs")}\nCommitment: 1, 2`,
      { done: [1, 2, 3, 4], review: true },
    ),
  );
  assert.equal(check(plan, "--completion").ok, true);
});

test("a row naming a missing obligation is not observed", (t) => {
  const { plan } = reviewed(t, [["1", "Each row names its source", "", "G7"]]);
  refusesCommitment(check(plan), "unobserved-commitment", "1", {
    obligation: "G7",
  });
});

test("a Commitment reference must name a returned id", (t) => {
  const entry = `${obligation(holdings, "receiving slice 4")}\nCommitment: 1, 9`;
  const { plan } = reviewed(
    t,
    [["1", "Each row names its source", "slice 4", ""]],
    { entries: entry },
  );
  const result = check(plan);
  refusesCommitment(result, "unknown-commitment", "9", { entry: "G1" });
  assert.ok(
    !result.problems.some(
      (item) => item.reason === "unknown-commitment" && item.commitment === "1",
    ),
  );
});

test("a disposition quoting the plan is refused and names its commitment", (t) => {
  const entry = `${obligation(holdings, 'excluded "The plan asks only for the Auto Trading section."')}\nCommitment: 1`;
  const { plan } = reviewed(t, [["1", "Each row names its source", "", "G1"]], {
    entries: entry,
  });
  const result = check(plan, "--slice", "4");
  refuses(result, "quote-not-in-story", "G1", "Disposition");
  assert.deepEqual(problemCommitments(result, "quote-not-in-story"), ["1"]);
});

test("the listing carries the slice's allocated commitments", (t) => {
  const { plan } = reviewed(t, [
    ["1", "Each row names its source", "slice 2", ""],
    ["2", "Exit rows \\| stops name it", "slice 3", ""],
    ["3", "Signals name it", "slice 2", "observed: signals.test.mjs"],
  ]);
  assert.deepEqual(list(plan, "--slice", "2"), {
    ok: true,
    slice: 2,
    entries: [],
    commitments: [
      { id: "1", text: "Each row names its source", slice: 2 },
      {
        id: "3",
        text: "Signals name it",
        slice: 2,
        observed: "signals.test.mjs",
      },
    ],
  });
  assert.deepEqual(list(plan, "--slice", "3").commitments, [
    { id: "2", text: "Exit rows | stops name it", slice: 3 },
  ]);
});

function unreadable(result) {
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some((item) => item.reason === "unreadable-source-review"),
    JSON.stringify(result),
  );
}

test("an unreadable or malformed return refuses instead of passing empty", (t) => {
  const { plan, writePlan, writeReview } = reviewed(t, [
    ["1", "Each row names its source", "slice two", ""],
  ]);
  refusesCommitment(check(plan), "malformed-commitment", "1");
  writeReview([]);
  unreadable(check(plan));
  writePlan(
    slicePlan("", { review: true }).replace(
      "source-review.md",
      "missing-review.md",
    ),
  );
  unreadable(check(plan));
  writeReview([["1", "Each row names its source", "slice 2", ""]]);
  writePlan(
    slicePlan("", { review: true }).replace(
      "**Source review:**",
      "**Source review:** [again](source-review.md)\n**Source review:**",
    ),
  );
  unreadable(check(plan));
});

test("plans without a linked return keep obligation-only results", (t) => {
  const { plan, writePlan } = fixture(t);
  writeFileSync(
    join(dirname(plan), "source-review.md"),
    sourceReview([["1", "Unlinked", "", ""]]),
  );
  writePlan(slicePlan(""));
  assert.deepEqual(check(plan, "--slice", "4"), { ok: true, entryCount: 0 });
  assert.deepEqual(check(plan, "--completion"), { ok: true, entryCount: 0 });
  assert.deepEqual(list(plan, "--slice", "4"), {
    ok: true,
    slice: 4,
    entries: [],
  });
  writePlan(slicePlan(obligation(holdings), { done: [1, 2, 3] }));
  const result = check(plan, "--slice", "4");
  assert.deepEqual(result, {
    ok: false,
    entryCount: 1,
    problems: [{ entry: "G1", reason: "open-obligation", slice: 4 }],
  });
  writePlan(
    slicePlan(`${obligation(holdings, "receiving slice 4")}\nCommitment: 1`),
  );
  refuses(check(plan), "unknown-commitment");
});
