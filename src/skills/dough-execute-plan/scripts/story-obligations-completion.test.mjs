import assert from "node:assert/strict";
import test from "node:test";
import {
  exclusion,
  fixture,
  obligation,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import { recordDuringStop } from "./story-obligations-cross-slice-test-fixtures.mjs";
import { check, list, refuses } from "./story-obligations-test-cli.mjs";

test("completion refuses every open return, receiver, and interim even while slices are planned", (t) => {
  const { plan, writePlan } = fixture(t, recordDuringStop);
  for (const disposition of [
    "return",
    "receiving slice 3",
    "interim until slices 2, 3",
  ]) {
    writePlan(slicePlan(obligation(recordDuringStop, disposition)));
    assert.equal(check(plan).ok, true, "intermediate plan remains valid");
    refuses(check(plan, "--completion"), "open-obligation");
  }
});

test("completion names each outstanding obligation rather than stopping at the first", (t) => {
  const { plan, writePlan } = fixture(t, recordDuringStop);
  writePlan(
    slicePlan(
      [
        obligation(recordDuringStop, "return", "G1"),
        obligation(recordDuringStop, "receiving slice 3", "G2"),
        obligation(recordDuringStop, "interim until slices 2, 3", "G3"),
      ].join("\n\n"),
    ),
  );
  const result = check(plan, "--completion");
  for (const id of ["G1", "G2", "G3"]) refuses(result, "open-obligation", id);
});

test("closed dispositions permit completion and legacy plans list no obligations", (t) => {
  const changed = {
    ...exclusion,
    story: `${exclusion.story}\nOwner decision: The budget is deferred.`,
  };
  const { plan, writePlan } = fixture(t, changed);
  for (const disposition of [
    'excluded "This story excludes the release cache budget remedy."',
    'owner changed "The budget is deferred."',
    `no user cost "${exclusion.clause}": Declared files are installed.`,
    "proved by slice 1: installed-files.test.mjs",
  ]) {
    writePlan(slicePlan(obligation(changed, disposition), { done: [1] }));
    assert.deepEqual(check(plan, "--completion"), { ok: true, entryCount: 1 });
  }
  writePlan("# Legacy plan\n\nNo obligations section.\n");
  assert.deepEqual(check(plan, "--completion"), { ok: true, entryCount: 0 });
  assert.deepEqual(list(plan, "--slice", "1"), {
    ok: true,
    slice: 1,
    entries: [],
  });
});

test("listing requires a positive slice and only check accepts completion", (t) => {
  const { plan } = fixture(t, recordDuringStop);
  for (const args of [
    [],
    ["--slice", "0"],
    ["--slice", "no"],
    ["--slice", "1", "--completion"],
    ["--slice", "1", "--planned-completion"],
  ]) {
    const result = list(plan, ...args);
    assert.equal(result.ok, false);
    assert.equal(result.problems[0].reason, "invalid-input");
  }
});

test("planned completion refuses pending slices and missing or ambiguous slice evidence", (t) => {
  const { plan, writePlan } = fixture(t);
  for (const [source, reason] of [
    [slicePlan("", { done: [1, 2, 3] }), "pending-slice"],
    ["# Missing slices\n", "unreadable-slices"],
    ["## Ordered slices\n", "missing-slices"],
    [slicePlan("", { done: [1], indices: [1, 1] }), "ambiguous-slice"],
    [
      slicePlan("", { done: [1, 2, 3, 4] }).replace(
        "Status: done",
        "Status: uncertain",
      ),
      "unreadable-slices",
    ],
  ]) {
    writePlan(source);
    const result = check(plan, "--planned-completion");
    assert.equal(result.ok, false);
    assert.ok(
      result.problems.some((problem) => problem.reason === reason),
      JSON.stringify(result),
    );
    if (reason === "pending-slice") {
      assert.deepEqual(result.problems, [
        { reason: "pending-slice", slice: 4, name: "Work 4" },
      ]);
    }
  }
});

test("planned completion checks open obligations even after all slices are done", (t) => {
  const { plan, writePlan } = fixture(t);
  const closed = `excluded "This story excludes the release cache budget remedy."`;
  const matching = fixture(t, exclusion, closed, { done: [1, 2, 3, 4] });
  matching.writePlan(slicePlan(obligation(exclusion), { done: [1, 2, 3, 4] }));
  refuses(check(matching.plan, "--planned-completion"), "open-obligation");
  matching.writePlan(
    slicePlan(obligation(exclusion, closed), { done: [1, 2, 3, 4] }),
  );
  assert.deepEqual(check(matching.plan, "--planned-completion"), {
    ok: true,
    entryCount: 1,
  });
  writePlan(slicePlan("", { done: [1, 2, 3, 4] }));
  assert.deepEqual(check(plan, "--planned-completion"), {
    ok: true,
    entryCount: 0,
  });
});

test("planned completion names an unavailable selected plan and rejects incompatible options", (t) => {
  const { plan } = fixture(t);
  const missing = check(`${plan}.missing`, "--planned-completion");
  assert.equal(missing.ok, false);
  assert.match(missing.problems[0].message, /ENOENT/);
  for (const flags of [["--slice", "1"], ["--completion"]]) {
    const result = check(plan, "--planned-completion", ...flags);
    assert.equal(result.ok, false);
    assert.equal(result.problems[0].reason, "invalid-input");
  }
});
