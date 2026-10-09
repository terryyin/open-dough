import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import {
  fixture,
  obligation,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import { recordDuringStop } from "./story-obligations-cross-slice-test-fixtures.mjs";
import { check, list, refuses } from "./story-obligations-test-cli.mjs";

test("plan 008's unsafe interim becomes slice 3's return until its proof is accepted", (t) => {
  const { plan, writePlan } = fixture(
    t,
    recordDuringStop,
    "interim until slices 2, 3",
    { done: [1, 2] },
  );
  const interim = list(plan, "--slice", "3").entries[0];
  assert.equal(interim.disposition.type, "interim");
  const earlierStatuses = () =>
    readPlanSlices(readFileSync(plan, "utf8"))
      .slices.filter((slice) => slice.index < 3)
      .map(({ index, status }) => ({ index, status }));
  const acceptedEarlier = [
    { index: 1, status: "done" },
    { index: 2, status: "done" },
  ];
  assert.deepEqual(earlierStatuses(), acceptedEarlier);

  // A return belongs to Reported's current slice; it has no separate target.
  const currentReturn = { ...recordDuringStop, reportedSlice: 3 };
  writePlan(slicePlan(obligation(currentReturn, "return"), { done: [1, 2] }));
  assert.deepEqual(list(plan, "--slice", "3"), {
    ok: true,
    slice: 3,
    entries: [
      {
        ...interim,
        reportedSlice: 3,
        disposition: { type: "return", open: true },
      },
    ],
  });
  assert.equal(
    check(plan).ok,
    true,
    "current return remains owned before commit",
  );
  const beforeCommit = check(plan, "--slice", "3");
  refuses(beforeCommit, "open-obligation");
  assert.ok(beforeCommit.problems.some((problem) => problem.slice === 3));
  refuses(check(plan, "--completion"), "open-obligation");
  assert.deepEqual(earlierStatuses(), acceptedEarlier);

  writePlan(
    slicePlan(
      obligation(currentReturn, "proved by slice 3: stop-result.test.mjs"),
      { done: [1, 2, 3] },
    ),
  );
  assert.deepEqual(list(plan, "--slice", "3").entries, []);
  assert.equal(check(plan, "--slice", "3").ok, true);
  assert.equal(check(plan, "--completion").ok, true);
  assert.deepEqual(earlierStatuses(), acceptedEarlier);
});
