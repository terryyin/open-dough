// Entry matching and wording for Intent's story CI comparison
// (`../../dashboard/src/storyCiComparisonEntries.ts`): measured Baseline time
// and one signed change in Branch and Landed, relative to a positive
// Baseline, and added and removed paths, one row per entry and compared
// unit. A change is only between times of one declared unit: an entry
// measured in another unit or as legacy results keeps each endpoint's own
// time, and a unit Baseline does not report has no Baseline time. Expired
// and untimed endpoints: ./dashboard-ci-comparison-entry-gaps.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { comparisonEntriesOf } from "../../dashboard/src/storyCiComparisonEntries.ts";
import { makeMe } from "./makeMe.mjs";

// An entry at PATH whose one part ran in DURATIONMS.
const entry = (path, durationMs) =>
  makeMe.aCiProofEntry.at(path).timed(durationMs).please();

const summary = (...entries) => ({ kind: "summary", entries });

test("comparable entries show Baseline time and one signed whole-second change per endpoint", () => {
  const result = comparisonEntriesOf(
    summary(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2090)
        .timed(240_000)
        .please(),
      entry("tests", 120_000),
    ),
    summary(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2092)
        .timed(270_000)
        .please(),
      entry("tests", 90_000),
    ),
    summary(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2092)
        .timed(300_000)
        .please(),
      entry("tests", 60_000),
    ),
  );
  assert.equal(result.kind, "rows");
  assert.deepEqual(
    result.rows.map((row) => [
      row.path,
      row.cells.counts,
      row.cells.baseline.text,
      row.cells.branch.text,
      row.cells.landed.text,
      row.cells.completeness,
    ]),
    [
      [
        "dashboard/tests",
        "2,090 → 2,092 test cases (+2)",
        "4 min",
        "+30 s",
        "+1 min",
        "1 of 1 part present",
      ],
      [
        "tests",
        "1 test case (no change)",
        "2 min",
        "−30 s",
        "−1 min",
        "1 of 1 part present",
      ],
    ],
  );
});

test("an added entry has no invented baseline difference", () => {
  const result = comparisonEntriesOf(
    summary(entry("tests", 60_000)),
    summary(entry("tests", 60_000), entry("src/skills", 30_000)),
    summary(entry("tests", 60_000), entry("src/skills", 30_000)),
  );
  assert.equal(result.kind, "rows");
  const added = result.rows.find((row) => row.path === "src/skills");
  assert.deepEqual(
    [
      added.cells.counts,
      added.cells.baseline.text,
      added.cells.branch.text,
      added.cells.landed.text,
    ],
    ["added → 1 test case", "added", "30 s", "30 s"],
  );
});

test("a removed entry is marked without inventing an after value", () => {
  const result = comparisonEntriesOf(
    summary(entry("old", 60_000), entry("tests", 60_000)),
    summary(entry("tests", 60_000)),
    summary(entry("tests", 60_000)),
  );
  assert.equal(result.kind, "rows");
  const gone = result.rows.find((row) => row.path === "old");
  assert.equal(gone.cells.counts, "1 → removed");
  assert.equal(gone.cells.baseline.text, "1 min");
  assert.equal(gone.cells.branch.text, "removed");
  assert.equal(gone.cells.landed.text, "removed");
});

test("a measured zero baseline still gives a signed change, and an unchanged time reads 0 s", () => {
  const result = comparisonEntriesOf(
    summary(entry("e/zero", 0), entry("e/same", 45_000)),
    summary(entry("e/zero", 30_000), entry("e/same", 45_000)),
    summary(entry("e/zero", 0), entry("e/same", 45_000)),
  );
  assert.equal(result.kind, "rows");
  const [zero, same] = result.rows;
  assert.deepEqual(zero.cells.baseline, { text: "0 s", ms: 0 });
  assert.deepEqual(zero.cells.branch, {
    text: "+30 s",
    ms: 30_000,
    changeMs: 30_000,
  });
  assert.deepEqual(zero.cells.landed, { text: "0 s", ms: 0, changeMs: 0 });
  assert.deepEqual(same.cells.landed, {
    text: "0 s",
    ms: 45_000,
    changeMs: 0,
    relative: 0,
  });
});

test("a change is relative to a positive Baseline only", () => {
  const result = comparisonEntriesOf(
    summary(entry("e/slower", 240_000), entry("e/zero", 0)),
    summary(entry("e/slower", 270_000), entry("e/zero", 30_000)),
    summary(
      entry("e/slower", 120_000),
      entry("e/zero", 30_000),
      entry("e/added", 30_000),
    ),
  );
  assert.equal(result.kind, "rows");
  const [slower, zero, added] = result.rows;
  assert.equal(slower.cells.branch.relative, 0.125);
  assert.equal(slower.cells.landed.relative, -0.5);
  assert.equal(zero.cells.branch.relative, undefined);
  assert.equal(added.cells.landed.relative, undefined);
  assert.equal(added.cells.landed.text, "30 s");
});

test("an entry measured in another unit or as legacy results keeps each endpoint's own time, with no signed change, relative change or duration cue, and an entry reporting several units has a row for each", () => {
  const holding = (path, ...evidence) =>
    makeMe.aCiProofEntry
      .at(path)
      .holding(...evidence)
      .please();
  const cases = (ms) =>
    makeMe.aCiProofEvidence.inUnit("case").timed(ms).please();
  const files = (ms) =>
    makeMe.aCiProofEvidence.inUnit("file").timed(ms).please();
  const legacy = (ms) =>
    makeMe.aCiProofEvidence.legacy("tests").timed(ms).please();
  const after = summary(
    holding("e/same", cases(23_000)),
    holding("e/across", files(23_000)),
    holding("e/legacy", legacy(23_000)),
    holding("e/both", cases(24_000), files(3_000)),
  );
  const result = comparisonEntriesOf(
    summary(
      holding("e/same", cases(20_000)),
      holding("e/across", cases(20_000)),
      holding("e/legacy", legacy(20_000)),
      holding("e/both", cases(20_000)),
    ),
    after,
    after,
  );
  assert.equal(result.kind, "rows");
  assert.deepEqual(
    result.rows.map(({ path, cells }) => [
      path,
      cells.counts,
      cells.baseline,
      cells.branch,
      cells.landed,
      cells.cues.duration,
    ]),
    [
      [
        "e/same",
        "1 test case (no change)",
        { text: "20 s", ms: 20_000 },
        { text: "+3 s", ms: 23_000, changeMs: 3_000, relative: 0.15 },
        { text: "+3 s", ms: 23_000, changeMs: 3_000, relative: 0.15 },
        { kind: "tint", direction: "slower", strength: "light" },
      ],
      [
        "e/across",
        "1 test case → 1 test file (different units)",
        { text: "20 s", ms: 20_000 },
        { text: "23 s", ms: 23_000 },
        { text: "23 s", ms: 23_000 },
        { kind: "none", reason: "units not comparable" },
      ],
      [
        "e/legacy",
        "1 legacy test result → 1 legacy test result (legacy unit unknown)",
        { text: "20 s", ms: 20_000 },
        { text: "23 s", ms: 23_000 },
        { text: "23 s", ms: 23_000 },
        { kind: "none", reason: "units not comparable" },
      ],
      [
        "e/both",
        "1 test case (no change)",
        { text: "20 s", ms: 20_000 },
        { text: "+4 s", ms: 24_000, changeMs: 4_000, relative: 0.2 },
        { text: "+4 s", ms: 24_000, changeMs: 4_000, relative: 0.2 },
        { kind: "tint", direction: "slower", strength: "light" },
      ],
      [
        "e/both",
        "— → 1 test file",
        { text: "—" },
        { text: "3 s", ms: 3_000 },
        { text: "3 s", ms: 3_000 },
        { kind: "none", reason: "unit not reported" },
      ],
    ],
  );
});
