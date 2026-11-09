// The attempt a CI proof names (ci-proof-contract.mjs): a GitHub Actions run
// attempt or a CI adapter's attempt, exactly one of them. A converter names
// its fragment's attempt, the collector keeps only fragments of the
// collected attempt and revision, and a summary's artifact name carries its
// attempt.
import assert from "node:assert/strict";
import test from "node:test";
import { summarize } from "./ci-proof-collect.mjs";
import {
  fragmentProblems,
  summaryArtifactName,
  summaryProblems,
} from "./ci-proof-contract.mjs";
import { fragmentsFromOutcomes } from "./ci-proof-fragments.mjs";
import {
  adapterRun,
  attemptId,
  fragment,
  fragmentsRead as read,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

// An adapter attempt's fragment: the fixture fragment named by ID instead.
const adapterFragment = (entry, part, of, counts, id = attemptId) =>
  fragment(entry, part, of, counts, { attempt: undefined, attemptId: id });

test("an earlier attempt's, an adapter attempt's or another revision's fragment is excluded, never filling a part (example 2)", () => {
  const { summary, notes } = summarize({
    fragments: read(
      fragment("dashboard/tests", 1, 2, { passed: 12 }),
      fragment("dashboard/tests", 2, 2, { passed: 8 }, { attempt: 1 }),
      fragment(
        "dashboard/tests",
        2,
        2,
        { passed: 8 },
        { revision: "b".repeat(40) },
      ),
      adapterFragment("dashboard/tests", 2, 2, { passed: 8 }, "2"),
    ),
    expect: [{ entry: "dashboard/tests", parts: 2 }],
    run,
  });
  const [evidence] = summary.entries[0].evidence;
  assert.equal(evidence.passed, 12);
  assert.deepEqual(evidence.parts[1], { part: 2, status: "missing" });
  assert.deepEqual(notes, [
    "excluded fragment-1.json: attempt 1, not attempt 2",
    `excluded fragment-2.json: revision ${"b".repeat(40)}, not ${revision}`,
    "excluded fragment-3.json: attemptId 2, not attempt 2",
  ]);
});

test("an adapter attempt's summary names its attemptId and keeps only fragments of that attempt and revision", () => {
  const { summary, notes } = summarize({
    fragments: read(
      adapterFragment("tests", 1, 1, { passed: 1000, other: 3 }),
      adapterFragment("tests", 1, 1, { passed: 9 }, "another"),
      fragment("tests", 1, 1, { passed: 7 }),
      { ...adapterFragment("tests", 1, 1, {}), revision: "b".repeat(40) },
    ),
    expect: [{ entry: "tests", parts: 1 }],
    run: adapterRun,
  });
  assert.deepEqual(notes, [
    `excluded fragment-1.json: attemptId another, not attemptId ${attemptId}`,
    `excluded fragment-2.json: attempt 2, not attemptId ${attemptId}`,
    `excluded fragment-3.json: revision ${"b".repeat(40)}, not ${revision}`,
  ]);
  assert.deepEqual(summaryProblems(summary), []);
  const { entries, ...attempt } = summary;
  assert.deepEqual(attempt, {
    schemaVersion: 2,
    repository: "O/P",
    attemptId,
    revision,
  });
  assert.deepEqual(
    entries.map(({ path, evidence: [only] }) => [
      path,
      only.passed,
      only.other,
    ]),
    [["tests", 1000, 3]],
  );
});

test("a fragment or summary names exactly one attempt identity", () => {
  const github = fragment("tests", 1, 1, {});
  const neither = { ...github, attempt: undefined };
  assert.deepEqual(fragmentProblems({ ...github, attemptId }), [
    "names both attempt and attemptId",
  ]);
  assert.deepEqual(fragmentProblems(neither), [
    "names neither attempt nor attemptId",
  ]);
  assert.deepEqual(fragmentProblems({ ...neither, attemptId: 7 }), [
    "attemptId is not a string",
  ]);
  const { summary } = summarize({ fragments: [], expect: [], run: adapterRun });
  assert.deepEqual(summaryProblems({ ...summary, runId: 1, runAttempt: 1 }), [
    "names both runId and runAttempt and attemptId",
  ]);
  assert.deepEqual(summaryProblems({ ...summary, attemptId: undefined }), [
    "names neither runId and runAttempt nor attemptId",
  ]);
});

test("the summary artifact name carries the attempt", () => {
  assert.equal(summaryArtifactName(3), "ci-proof-summary-attempt-3");
});

test("an adapter attempt's identity names its fragment by attemptId", () => {
  const [value] = fragmentsFromOutcomes("passed\ttests/a.sh\n", {
    entries: ["tests"],
    part: 1,
    of: 1,
    attemptId,
    revision,
  });
  assert.equal(value.attemptId, attemptId);
  assert.equal("attempt" in value, false);
  assert.deepEqual(fragmentProblems(value), []);
});
