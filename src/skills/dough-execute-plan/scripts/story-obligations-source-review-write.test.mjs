import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { exclusion, reviewed } from "./story-obligations-test-fixtures.mjs";
import {
  check,
  record,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";
import {
  digest,
  recordStoryCommitment,
} from "./story-obligation-source-review-record.mjs";
import { readSourceReview } from "./story-obligation-source-review.mjs";
import { readStoryObligations } from "./story-obligation-reader.mjs";

function reviewPath(plan) {
  return join(dirname(plan), "source-review.md");
}

function bytes(path) {
  return readFileSync(path);
}

test("record is the supported recording path beside list and check", () => {
  const usage = record("/no/such/plan.md");
  assert.equal(usage.ok, false);
  assert.match(
    usage.problems[0].message,
    /record --plan.*--commitment|commitment id is required|usage:.*record/,
  );
});

test("ODF-391: recording an observation with literal | and quotes escapes the cell", (t) => {
  const { plan, writeReview } = reviewed(t, [
    ["1", "Each row names its source", "slice 2", ""],
    ["2", "Unrelated row stays put", "slice 3", "observed: other.test.mjs"],
  ]);
  const beforePlan = bytes(plan);
  const observed = 'rows | "quoted" proof.test.mjs';
  const result = record(plan, "--commitment", "1", "--observed", observed);
  assert.equal(result.ok, true, JSON.stringify(result));
  const review = readFileSync(reviewPath(plan), "utf8");
  assert.match(review, /observed: rows \\\| "quoted" proof\.test\.mjs/);
  assert.equal(
    readSourceReview(review).commitments.find((item) => item.id === "1")
      .observed,
    observed,
  );
  assert.equal(
    readSourceReview(review).commitments.find((item) => item.id === "2")
      .observed,
    "other.test.mjs",
  );
  assert.equal(check(plan, "--slice", "2").ok, true);
  assert.deepEqual(bytes(plan), beforePlan);
  // Hand-shaped unescaped | still fails check (retained malformed shape).
  writeReview([
    ["1", "Each row names its source", "slice 2", `observed: ${observed}`],
    ["2", "Unrelated row stays put", "slice 3", "observed: other.test.mjs"],
  ]);
  refusesCommitment(check(plan), "malformed-commitment", "1");
});

test("ODF-381: exclusion via obligation keeps id out of Slice and writes Reported shape", (t) => {
  const { plan } = reviewed(
    t,
    [
      ["1", "Release cache budget not enforced", "slice 1", ""],
      ["2", "Unrelated allocation", "slice 2", ""],
    ],
    { example: exclusion },
  );
  const result = record(
    plan,
    "--commitment",
    "1",
    "--obligation",
    "G1",
    "--entry-id",
    "G1",
    "--title",
    "Cache budget excluded",
    "--reported",
    exclusion.reported,
    "--reported-slice",
    "1",
    "--story-clause",
    exclusion.clause,
    "--disposition",
    'excluded "This story excludes the release cache budget remedy."',
  );
  assert.equal(result.ok, true, JSON.stringify(result));
  const review = readFileSync(reviewPath(plan), "utf8");
  assert.match(
    review,
    /^\| 1 \| Release cache budget not enforced \| {2}\| G1 \|$/m,
  );
  assert.doesNotMatch(review, /\|\s*G1\s*\|\s*G1\s*\|/);
  const parsed = readSourceReview(review);
  assert.equal(
    parsed.commitments.find((item) => item.id === "1").obligation,
    "G1",
  );
  assert.equal(
    parsed.commitments.find((item) => item.id === "1").slice,
    undefined,
  );
  assert.equal(parsed.commitments.find((item) => item.id === "2").slice, 2);
  const obligations = readStoryObligations(readFileSync(plan, "utf8"));
  assert.deepEqual(obligations.problems, []);
  const entry = obligations.entries.find((item) => item.id === "G1");
  assert.equal(entry.reportedSlice, 1);
  assert.equal(entry.reported, exclusion.reported);
  assert.equal(entry.disposition.type, "excluded");
  assert.deepEqual(entry.commitments, ["1"]);
  assert.equal(check(plan, "--slice", "1").ok, true);
});

test("observed allocations clear unobserved-commitment for those rows only", (t) => {
  const { plan } = reviewed(t, [
    ["1", "Each row names its source", "", ""],
    ["2", "Exit rows name it", "slice 2", ""],
    ["3", "Later slice stays open", "slice 3", ""],
  ]);
  refusesCommitment(check(plan), "unallocated-commitment", "1");
  assert.equal(record(plan, "--commitment", "1", "--slice", "2").ok, true);
  refusesCommitment(check(plan, "--slice", "2"), "unobserved-commitment", "1");
  assert.equal(
    record(plan, "--commitment", "1", "--observed", "rows.test.mjs").ok,
    true,
  );
  refusesCommitment(check(plan, "--slice", "2"), "unobserved-commitment", "2");
  assert.equal(
    record(plan, "--commitment", "2", "--observed", "exits.test.mjs").ok,
    true,
  );
  assert.equal(check(plan, "--slice", "2").ok, true);
  refusesCommitment(check(plan, "--slice", "3"), "unobserved-commitment", "3");
  const review = readSourceReview(readFileSync(reviewPath(plan), "utf8"));
  assert.equal(
    review.commitments.find((item) => item.id === "3").observed,
    undefined,
  );
});

test("correcting one named observation leaves unrelated rows and obligations intact", (t) => {
  const { plan } = reviewed(
    t,
    [
      ["1", "Each row names its source", "slice 2", "observed: wrong.test.mjs"],
      ["2", "Exit rows name it", "slice 3", "observed: exits.test.mjs"],
    ],
    {
      entries: `### G1. Kept
Reported: slice 1 — "kept reported"
Story clause: "The release installs its declared files."
Disposition: excluded "This story excludes the release cache budget remedy."`,
      example: exclusion,
    },
  );
  const beforePlan = readFileSync(plan, "utf8");
  const beforeReview = readFileSync(reviewPath(plan), "utf8");
  assert.equal(
    record(plan, "--commitment", "1", "--observed", "rows.test.mjs").ok,
    true,
  );
  const afterReview = readFileSync(reviewPath(plan), "utf8");
  assert.match(afterReview, /observed: rows\.test\.mjs/);
  assert.match(afterReview, /observed: exits\.test\.mjs/);
  assert.equal(readFileSync(plan, "utf8"), beforePlan);
  assert.notEqual(afterReview, beforeReview);
  assert.equal(check(plan, "--slice", "2").ok, true);
  assert.equal(
    readStoryObligations(readFileSync(plan, "utf8")).entries[0].id,
    "G1",
  );
});

test("unknown commitment id and stale digests refuse with intact bytes", async (t) => {
  const { plan } = reviewed(t, [
    ["1", "Each row names its source", "slice 2", ""],
  ]);
  const reviewFile = reviewPath(plan);
  const beforeReview = bytes(reviewFile);
  const beforePlan = bytes(plan);
  refusesCommitment(
    record(plan, "--commitment", "missing", "--observed", "x"),
    "unknown-commitment",
    "missing",
  );
  assert.deepEqual(bytes(reviewFile), beforeReview);
  assert.deepEqual(bytes(plan), beforePlan);

  const expectedReview = digest(readFileSync(reviewFile, "utf8"));
  const stale = await recordStoryCommitment(plan, {
    commitment: "1",
    observed: "rows.test.mjs",
    expectedReview: "0".repeat(64),
  });
  assert.equal(stale.ok, false);
  assert.ok(stale.problems.some((item) => item.reason === "stale-input"));
  assert.deepEqual(bytes(reviewFile), beforeReview);

  const dual = record(
    plan,
    "--commitment",
    "1",
    "--obligation",
    "G1",
    "--entry-id",
    "G1",
    "--title",
    "Gap",
    "--reported",
    "reported gap",
    "--reported-slice",
    "1",
    "--story-clause",
    "Each signal and exit row names that source",
    "--disposition",
    'excluded "This story excludes the release cache budget remedy."',
    "--expected-review",
    expectedReview,
    "--expected-plan",
    "1".repeat(64),
  );
  assert.equal(dual.ok, false);
  assert.ok(dual.problems.some((item) => item.reason === "stale-input"));
  assert.deepEqual(bytes(reviewFile), beforeReview);
  assert.deepEqual(bytes(plan), beforePlan);

  const ok = record(
    plan,
    "--commitment",
    "1",
    "--observed",
    "rows.test.mjs",
    "--expected-review",
    expectedReview,
  );
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(check(plan, "--slice", "2").ok, true);
});
