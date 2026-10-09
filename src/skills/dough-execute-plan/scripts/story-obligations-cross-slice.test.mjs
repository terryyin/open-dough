import assert from "node:assert/strict";
import test from "node:test";
import {
  fixture,
  obligation,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import {
  dailySlices,
  liveFault,
  recordDuringStop,
} from "./story-obligations-cross-slice-test-fixtures.mjs";
import { check, list, refuses } from "./story-obligations-test-cli.mjs";

test("plan 296's receiving slice gets the reported live fault and authoritative story clause", (t) => {
  const { plan, writePlan } = fixture(t, liveFault, "receiving slice 8", {
    ...dailySlices,
    done: [6],
  });
  assert.deepEqual(list(plan, "--slice", "8"), {
    ok: true,
    slice: 8,
    entries: [
      {
        id: "G1",
        title: "Reported gap",
        reportedSlice: 6,
        reported: liveFault.reported,
        storyClause: liveFault.clause,
        disposition: { type: "receiving", slice: 8, open: true },
      },
    ],
  });
  assert.deepEqual(list(plan, "--slice", "7").entries, []);
  refuses(check(plan, "--slice", "8"), "open-obligation");
  writePlan(
    slicePlan(obligation(liveFault, "receiving slice 8"), {
      ...dailySlices,
      done: [6, 8],
    }),
  );
  refuses(check(plan), "open-obligation");
  writePlan(
    slicePlan(obligation(liveFault, "receiving slice 8"), {
      indices: dailySlices.indices.filter((index) => index !== 8),
      done: [6],
    }),
  );
  refuses(check(plan), "dangling-receiving-slice");
});

test("plan 008's result slice receives the Stop interim until final behavior is proved", (t) => {
  const { plan, writePlan } = fixture(
    t,
    recordDuringStop,
    "interim until slices 2, 3",
    { done: [1, 2] },
  );
  const result = list(plan, "--slice", "3");
  assert.equal(result.ok, true);
  assert.equal(result.slice, 3);
  assert.deepEqual(result.entries, [
    {
      id: "G1",
      title: "Reported gap",
      reportedSlice: 1,
      reported: recordDuringStop.reported,
      storyClause: recordDuringStop.clause,
      disposition: { type: "interim", slices: [2, 3], open: true },
    },
  ]);
  assert.equal(check(plan, "--slice", "2").ok, true);
  assert.equal(check(plan).ok, true, "earlier dependency may be done");
  assert.equal(list(plan, "--slice", "2").entries.length, 1);
  assert.deepEqual(list(plan, "--slice", "4").entries, []);
  refuses(check(plan, "--slice", "3"), "open-obligation");
  writePlan(
    slicePlan(obligation(recordDuringStop, "interim until slices 2, 3"), {
      done: [1, 2, 3],
    }),
  );
  refuses(check(plan), "open-obligation");
  writePlan(
    slicePlan(
      obligation(recordDuringStop, "proved by slice 3: stop-result.test.mjs"),
      {
        done: [1, 2, 3],
      },
    ),
  );
  assert.deepEqual(list(plan, "--slice", "3").entries, []);
  assert.equal(check(plan, "--completion").ok, true);
});

test("the last interim dependency follows plan order, not dependency spelling or slice number", (t) => {
  const { plan } = fixture(t, recordDuringStop, "interim until slices 3, 2", {
    indices: [1, 3, 2, 4],
    done: [1, 3],
  });
  assert.equal(check(plan, "--slice", "3").ok, true);
  const result = check(plan, "--slice", "2");
  refuses(result, "open-obligation");
  assert.ok(result.problems.some((item) => item.slice === 2));
});

test("replanning cannot drop any interim dependency, including one before the last", (t) => {
  const { plan, writePlan } = fixture(
    t,
    recordDuringStop,
    "interim until slices 2, 3",
  );
  for (const removed of [2, 3]) {
    writePlan(
      slicePlan(obligation(recordDuringStop, "interim until slices 2, 3"), {
        indices: [1, 2, 3, 4].filter((index) => index !== removed),
      }),
    );
    const result = check(plan);
    refuses(result, "dangling-interim-slice");
    assert.ok(result.problems.some((item) => item.slice === removed));
  }
});

test("a returned gap is carried by its current slice while closed entries are omitted", (t) => {
  const { plan, writePlan } = fixture(t, recordDuringStop);
  const listed = list(plan, "--slice", "1");
  assert.equal(listed.entries[0].reported, recordDuringStop.reported);
  assert.equal(listed.entries[0].disposition.type, "return");
  writePlan(
    slicePlan(
      obligation(recordDuringStop, "proved by slice 1: result.test.mjs"),
    ),
  );
  assert.deepEqual(list(plan, "--slice", "1").entries, []);
});

test("a delegation carries every received gap and dependent interim with their full records", (t) => {
  const { plan, writePlan } = fixture(t, recordDuringStop);
  writePlan(
    slicePlan(
      [
        obligation(recordDuringStop, "receiving slice 3", "G1"),
        obligation(recordDuringStop, "interim until slices 2, 3", "G2"),
        obligation(
          recordDuringStop,
          "proved by slice 1: result.test.mjs",
          "G3",
        ),
        obligation(recordDuringStop, "return", "G4"),
      ].join("\n\n"),
    ),
  );
  const result = list(plan, "--slice", "3");
  assert.equal(result.ok, true);
  assert.deepEqual(
    result.entries.map((entry) => entry.id),
    ["G1", "G2"],
  );
  for (const entry of result.entries) {
    assert.equal(entry.reported, recordDuringStop.reported);
    assert.equal(entry.storyClause, recordDuringStop.clause);
  }
});

test("listing refuses malformed records and unknown slices but carries valid open ones", (t) => {
  const { plan, writePlan } = fixture(t, recordDuringStop, "learning");
  refuses(list(plan, "--slice", "1"), "no-disposition");
  writePlan(slicePlan(obligation(recordDuringStop)));
  const result = list(plan, "--slice", "9");
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((item) => item.reason === "unknown-slice"));
  assert.equal(list(plan, "--slice", "1").ok, true);
});
