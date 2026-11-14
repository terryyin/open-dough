import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { reviewed, slicePlan } from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  record,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";
import { readSourceReview } from "./story-obligation-source-review.mjs";

// Commitments only a post-execution operation can observe (landing, final
// target CI, completion reporting) are allocated to that owner instead of a
// slice. Example rows follow SEED-010 story 19's key examples.

const owners = ["landing", "target CI", "reporting"];
const allDone = { done: [1, 2, 3, 4] };

test("each lifecycle owner allocates a row that every check passes unobserved and reports as pending", (t) => {
  const rows = [
    ["52a", "The dialog lists the source", "slice 4", "observed: dialog.test"],
    ["52b", "The work is landed normally", "landing", ""],
    ["C1", "Final target CI is settled", "target CI", ""],
    ["R1", "The dashboard reports completion", "reporting", ""],
  ];
  const { plan, writePlan } = reviewed(t, rows);
  const pending = [
    { id: "52b", text: "The work is landed normally", owner: "landing" },
    { id: "C1", text: "Final target CI is settled", owner: "target CI" },
    { id: "R1", text: "The dashboard reports completion", owner: "reporting" },
  ];
  const passing = {
    ok: true,
    entryCount: 0,
    commitmentCount: 4,
    pendingLifecycle: pending,
  };
  for (const args of [[], ["--slice", "4"], ["--completion"]])
    assert.deepEqual(check(plan, ...args), passing, args.join(" "));
  writePlan(slicePlan("", { ...allDone, review: true }));
  assert.deepEqual(check(plan, "--planned-completion"), passing);
  // A lifecycle row belongs to no slice's listing.
  assert.deepEqual(
    list(plan, "--slice", "4").commitments.map((item) => item.id),
    ["52a"],
  );
});

test("an observation on a lifecycle row is refused by every check", (t) => {
  for (const owner of owners) {
    const { plan, writePlan } = reviewed(t, [
      [
        "C1",
        "Final target CI is settled",
        owner,
        "observed: branch CI run 42 success",
      ],
    ]);
    for (const args of [[], ["--slice", "4"], ["--completion"]])
      refusesCommitment(
        check(plan, ...args),
        "observed-lifecycle-commitment",
        "C1",
        { owner },
      );
    writePlan(slicePlan("", { ...allDone, review: true }));
    refusesCommitment(
      check(plan, "--planned-completion"),
      "observed-lifecycle-commitment",
      "C1",
      { owner },
    );
  }
});

test("an unknown owner or an obligation on a lifecycle row is malformed; unallocated rows stay refused", (t) => {
  const { plan } = reviewed(t, [
    ["1", "Released from trunk", "release", ""],
    ["2", "Final target CI is settled", "Target CI", ""],
    ["3", "Landed normally", "landing", "G1"],
    ["4", "Reported on the dashboard", "", ""],
  ]);
  for (const args of [[], ["--slice", "4"], ["--completion"]]) {
    const result = check(plan, ...args);
    for (const id of ["1", "2", "3"])
      refusesCommitment(result, "malformed-commitment", id);
    refusesCommitment(result, "unallocated-commitment", "4");
  }
});

test("record --lifecycle allocates each owner, clears earlier state, and refuses observations", (t) => {
  const { plan } = reviewed(t, [
    ["1", "The work is landed normally", "slice 4", "observed: branch CI"],
    ["2", "Final target CI is settled", "", ""],
    ["3", "The dashboard reports completion", "slice 2", ""],
  ]);
  const review = join(dirname(plan), "source-review.md");
  const owned = () =>
    Object.fromEntries(
      readSourceReview(readFileSync(review, "utf8")).commitments.map((item) => [
        item.id,
        item,
      ]),
    );
  for (const [id, owner] of [
    ["1", "landing"],
    ["2", "target CI"],
    ["3", "reporting"],
  ]) {
    const result = record(plan, "--commitment", id, "--lifecycle", owner);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.deepEqual(result.commitment, {
      id,
      text: owned()[id].text,
      lifecycle: owner,
    });
  }
  assert.match(
    readFileSync(review, "utf8"),
    /\| 2 \| Final target CI is settled \| target CI \| +\|/,
  );
  assert.equal(check(plan, "--completion").ok, true);
  const before = readFileSync(review);
  for (const args of [
    ["--commitment", "1", "--observed", "branch CI run 42"],
    ["--commitment", "1", "--lifecycle", "release"],
    ["--commitment", "1", "--lifecycle", "landing", "--slice", "4"],
    ["--commitment", "1", "--lifecycle", "landing", "--observed", "x"],
    ["--commitment", "1", "--lifecycle", "landing", "--obligation", "G1"],
  ]) {
    const result = record(plan, ...args);
    assert.equal(result.ok, false, args.join(" "));
    assert.deepEqual(readFileSync(review), before, args.join(" "));
  }
  assert.equal(
    record(plan, "--commitment", "1", "--observed", "x").problems[0].reason,
    "observed-lifecycle-commitment",
  );
  // A wrong allocation returns to a slice through the same path.
  const moved = record(plan, "--commitment", "3", "--slice", "2");
  assert.equal(moved.ok, true, JSON.stringify(moved));
  assert.equal(owned()["3"].lifecycle, undefined);
  assert.equal(owned()["3"].slice, 2);
});
