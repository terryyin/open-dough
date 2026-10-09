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
  ]) {
    const result = list(plan, ...args);
    assert.equal(result.ok, false);
    assert.equal(result.problems[0].reason, "invalid-input");
  }
});
