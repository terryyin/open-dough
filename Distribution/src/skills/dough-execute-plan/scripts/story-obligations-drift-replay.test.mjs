import assert from "node:assert/strict";
import test from "node:test";
import {
  amendmentQuote,
  currentDecision,
  obligation,
  replay,
} from "./story-obligations-drift-replay-fixtures.mjs";
import {
  check,
  list,
  problemCommitments,
  refusedCommitmentIds,
  refuses,
} from "./story-obligations-test-cli.mjs";

test("slice 4 is refused for the held and ordered items until they are returned", (t) => {
  const { plan, writeRecord } = replay(t);
  writeRecord();
  const narrowed = check(plan, "--slice", "4");
  assert.equal(narrowed.ok, false);
  assert.deepEqual(
    narrowed.problems.map((item) => item.reason),
    ["unobserved-commitment", "unobserved-commitment"],
  );
  assert.deepEqual(refusedCommitmentIds(narrowed, "unobserved-commitment"), [
    "21.5",
    "21.6",
  ]);

  // Returned to slice 4: the gate stays closed while the return is open.
  const returned = obligation(
    "G1",
    4,
    "already held, already ordered",
    "return",
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [returned]);
  refuses(check(plan, "--slice", "4"), "open-obligation");

  writeRecord({
    21.5: "observed: python3 entry/decision.py lists HHH/already_held",
    21.6: "observed: python3 entry/decision.py lists OOO/already_ordered",
  });
  assert.deepEqual(check(plan, "--slice", "4"), {
    ok: true,
    entryCount: 0,
    commitmentCount: 10,
  });
});

test("a named later receiver accepts slice 4 and refuses its own slice while open", (t) => {
  const { plan, writeRecord } = replay(t);
  const received = obligation(
    "G1",
    4,
    "already held, already ordered",
    "receiving slice 7",
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [received]);
  assert.equal(check(plan, "--slice", "4").ok, true);
  refuses(check(plan, "--slice", "7"), "open-obligation");

  // A false later-slice allocation is caught at that slice, before completion.
  writeRecord({ 21.5: ["slice 7", ""], 21.6: ["slice 7", ""] });
  assert.equal(check(plan, "--slice", "4").ok, true);
  assert.deepEqual(
    refusedCommitmentIds(check(plan, "--slice", "7"), "unobserved-commitment"),
    ["21.5", "21.6", "40"],
  );
});

test("the traceability commitment is received at slice 1 and blocks slice 7 while open", (t) => {
  const { plan, writeRecord } = replay(t);
  const traceability = obligation(
    "G2",
    1,
    "Each decision has an identity.",
    "receiving slice 7",
    ["40"],
  );
  writeRecord(
    {
      21.5: "observed: HHH/already_held",
      21.6: "observed: OOO/already_ordered",
      40: ["", "G2"],
    },
    [traceability],
  );
  assert.equal(check(plan, "--slice", "1").ok, true);
  assert.equal(check(plan, "--slice", "4").ok, true);
  const atSeven = check(plan, "--slice", "7");
  refuses(atSeven, "open-obligation", "G2");
  assert.deepEqual(problemCommitments(atSeven, "open-obligation"), ["40"]);

  // The receiving slice's proof closes the obligation and the row it disposes.
  writeRecord(
    {
      21.5: "observed: HHH/already_held",
      21.6: "observed: OOO/already_ordered",
      40: ["", "G2"],
    },
    [
      traceability.replace(
        "Disposition: receiving slice 7",
        "Disposition: proved by slice 7: decision identity test",
      ),
    ],
  );
  assert.equal(check(plan, "--slice", "7").ok, true);
  assert.deepEqual(check(plan, "--completion"), {
    ok: true,
    entryCount: 1,
    commitmentCount: 10,
  });
});

test("the plan's Current decision is no exclusion for the returned items", (t) => {
  const { plan, writeRecord } = replay(t);
  const planScoped = obligation(
    "G1",
    4,
    "already held, already ordered",
    `excluded "${currentDecision}"`,
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [planScoped]);
  const result = check(plan, "--slice", "4");
  refuses(result, "quote-not-in-story", "G1", "Disposition");
  assert.deepEqual(problemCommitments(result, "quote-not-in-story"), [
    "21.5",
    "21.6",
  ]);
});

test("the amended control excludes the items with the quoted human amendment", (t) => {
  const { plan, writeStory, writeRecord } = replay(t);
  writeStory(true);
  const amended = obligation(
    "G1",
    4,
    "already held, already ordered",
    `excluded "${amendmentQuote}"`,
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [amended]);
  assert.deepEqual(check(plan, "--slice", "4"), {
    ok: true,
    entryCount: 1,
    commitmentCount: 10,
  });
  writeStory(false);
  refuses(
    check(plan, "--slice", "4"),
    "quote-not-in-story",
    "G1",
    "Disposition",
  );
});

test("a commitment observed at slice 2 needs nothing at slice 4", (t) => {
  const { plan, writeRecord } = replay(t);
  writeRecord();
  const atFour = check(plan, "--slice", "4");
  assert.ok(!atFour.problems.some((item) => item.commitment === "5"));
  // Before slice 4's delegation its allocated ids, observed or not, are carried.
  const listed = list(plan, "--slice", "4");
  assert.equal(listed.ok, true);
  assert.deepEqual(
    listed.commitments.map((item) => [item.id, item.observed !== undefined]),
    [
      ["20", true],
      ["21.1", true],
      ["21.2", true],
      ["21.3", true],
      ["21.4", true],
      ["21.5", false],
      ["21.6", false],
      ["22", true],
    ],
  );
  assert.deepEqual(
    list(plan, "--slice", "2").commitments.map((item) => [
      item.id,
      item.observed,
    ]),
    [["5", "slice 2 proof, entry/inputs.json scan outcomes"]],
  );
});
