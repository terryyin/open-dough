import assert from "node:assert/strict";
import test from "node:test";
import {
  holdings,
  obligation,
  reviewed,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  problemCommitments,
  refuses,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";

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
    [["1", "Each row names its source", "slice 4", "G1"]],
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

test("a malformed Commitment field is refused", (t) => {
  const entry = `${obligation(holdings, "receiving slice 4")}\nCommitment: 1; 2`;
  const { plan } = reviewed(
    t,
    [["1", "Each row names its source", "slice 4", "G1"]],
    { entries: entry },
  );
  refuses(check(plan), "malformed-commitment", "G1", "Commitment");
});

test("refusals name the rows that point to the entry, and a present Commitment field must match them", (t) => {
  const rows = [
    ["1", "Each signal row names that source", "", "G1"],
    ["2", "Each exit row names that source", "slice 4", "G1"],
    ["3", "Signals name it", "slice 4", ""],
  ];
  const fromSliceOne = { ...holdings, reportedSlice: 1 };
  const open = obligation(fromSliceOne, "receiving slice 4");
  const { plan, writePlan } = reviewed(t, rows, {
    entries: open,
    done: [1, 2, 3],
  });
  // Without the optional field the rows still name the commitments.
  const atFour = check(plan, "--slice", "4");
  refuses(atFour, "open-obligation");
  assert.deepEqual(problemCommitments(atFour, "open-obligation"), ["1", "2"]);
  const withField = (field) =>
    writePlan(
      slicePlan(`${open}\nCommitment: ${field}`, {
        done: [1, 2, 3],
        review: true,
      }),
    );
  withField("2, 1");
  assert.equal(check(plan, "--slice", "3").ok, true);
  withField("1, 3");
  const disagreeing = check(plan, "--slice", "3");
  refusesCommitment(disagreeing, "mismatched-commitment", "3", {
    entry: "G1",
  });
  refusesCommitment(disagreeing, "mismatched-commitment", "2", {
    entry: "G1",
  });
  assert.deepEqual(problemCommitments(disagreeing, "mismatched-commitment"), [
    "1",
    "2",
  ]);
  assert.equal(disagreeing.problems.length, 2, JSON.stringify(disagreeing));
});

test("a row naming a slice the plan lacks is unallocated even beside a valid obligation", (t) => {
  const fromSliceOne = { ...holdings, reportedSlice: 1 };
  const entry = `${obligation(fromSliceOne, "receiving slice 4")}\nCommitment: 1`;
  const { plan } = reviewed(
    t,
    [["1", "Each row names its source", "slice 9", "G1"]],
    { entries: entry },
  );
  const result = check(plan, "--slice", "1");
  refusesCommitment(result, "unallocated-commitment", "1", { slice: 9 });
  assert.equal(result.problems.length, 1, JSON.stringify(result));
});

test("a whole-story commitment belongs to its completing slice; a done slice's row cites its earlier proof", (t) => {
  const { plan, writeReview } = reviewed(
    t,
    [
      ["G", "The owner sees one source on every row", "slice 4", ""],
      [
        "1",
        "Each row names its source",
        "slice 1",
        "observed: slice 1 accepted proof, rows.test.mjs",
      ],
    ],
    { done: [1] },
  );
  for (const slice of ["2", "3"])
    assert.deepEqual(check(plan, "--slice", slice), {
      ok: true,
      entryCount: 0,
      commitmentCount: 2,
    });
  refusesCommitment(check(plan, "--slice", "4"), "unobserved-commitment", "G", {
    slice: 4,
  });
  writeReview([
    [
      "G",
      "The owner sees one source on every row",
      "slice 4",
      "observed: journey.test.mjs",
    ],
    [
      "1",
      "Each row names its source",
      "slice 1",
      "observed: slice 1 accepted proof, rows.test.mjs",
    ],
  ]);
  assert.equal(check(plan, "--slice", "4").ok, true);
  assert.equal(check(plan, "--completion").ok, true);
});
