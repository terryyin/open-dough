import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryGlanceOf } from "../../../dashboard/server/ciHistoryGlance.ts";
import { scopeHistoryOf } from "../../../dashboard/server/ciScopeHistory.ts";
import { wallTimeReferenceOf } from "../../../dashboard/server/ciWallTimeReference.ts";
import { gapStatus } from "../../../dashboard/src/ciFailedBuild.ts";
import { ciScopeHistorySchema } from "../../../dashboard/src/ciScopeHistory.ts";

// A passed measured build, a failed build, a landing whose final gap is
// failed and a cancelled landing, in trunk order.
const [passed, failedBuild, failedGap, cancelled] = ["1", "2", "3", "4"].map(
  (digit) => digit.repeat(40),
);
const at = (day) => `2026-11-0${String(day)}T10:00:00Z`;
const proofOf = (revision, runId) =>
  makeMe.aCiProof
    .forRun({ revision, runId })
    .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
    .please();
const history = makeMe.aLandedCiHistory
  .inTrunkOrder([passed, failedBuild, failedGap, cancelled])
  .measuredLanding({
    receipt: "passed",
    revision: passed,
    receivedAt: at(1),
    runId: 1,
    startedAt: at(1),
    completedAt: at(2),
  })
  .proofFor("run/1/1", proofOf(passed, 1))
  .failedLanding({
    receipt: "failed-build",
    revision: failedBuild,
    receivedAt: at(2),
    runId: 2,
    startedAt: at(2),
    completedAt: at(3),
  })
  .proofFor("run/2/1", proofOf(failedBuild, 2))
  .unmeasuredLanding({
    receipt: "failed-gap",
    revision: failedGap,
    receivedAt: at(3),
    reason: "failed",
  })
  .unmeasuredLanding({
    receipt: "cancelled",
    revision: cancelled,
    receivedAt: at(4),
    reason: "cancelled",
  })
  .please();
const order = history.trunkOrder;
const scopeAt = (revision, day) =>
  scopeHistoryOf(history, "tests", { revision, at: at(day) }, order);

test("a failed build and a landing's final failed gap read failed in the scope answer, its glance and both references, from the state the read knows", () => {
  const answer = scopeAt(cancelled, 4);
  assert.equal(ciScopeHistorySchema.safeParse(answer).success, true);
  assert.deepEqual(
    answer.entries.map(({ kind, reason, failed }) => ({
      kind,
      reason,
      failed,
    })),
    [
      { kind: "point", reason: undefined, failed: undefined },
      { kind: "gap", reason: "Failed CI build", failed: true },
      { kind: "gap", reason: "Failed", failed: true },
      { kind: "gap", reason: "Cancelled", failed: undefined },
    ],
  );
  const glance = scopeHistoryGlanceOf(answer);
  assert.deepEqual(
    glance.entries
      .slice(1)
      .map((entry) => [
        entry.gap?.status,
        ...entry.readings.map((reading) => reading.status),
      ]),
    [
      ["failed", "failed"],
      ["failed", "failed"],
      ["unavailable", "unavailable"],
    ],
  );
  for (const [revision, day] of [
    [failedBuild, 2],
    [failedGap, 3],
  ]) {
    const [scope] = scopeAt(revision, day).references;
    assert.equal(scope.reference.selected.failed, true);
    assert.equal(wallTimeReferenceOf(history, revision).selected.failed, true);
  }
  for (const reference of [
    wallTimeReferenceOf(history, cancelled),
    scopeAt(cancelled, 4).references[0].reference,
  ])
    assert.equal("failed" in reference.selected, false);
});

test("a reworded failure reason still reads failed, and failure words never make a build failed", () => {
  const answer = scopeAt(cancelled, 4);
  // The reasons under proof: the failed build's reworded, and the cancelled
  // landing's replaced by the former failed-build words.
  const reworded = (entry, reason) => ({
    ...entry,
    reason,
    readings: entry.readings.map((reading) => ({ ...reading, reason })),
  });
  const [measured, failed, finalFailed, notFailed] = answer.entries;
  const glance = scopeHistoryGlanceOf({
    ...answer,
    entries: [
      measured,
      reworded(failed, "The build did not pass"),
      finalFailed,
      reworded(notFailed, "Failed CI build"),
    ],
  });
  assert.deepEqual(glance.entries[1].gap, {
    status: "failed",
    reason: "The build did not pass",
  });
  assert.deepEqual(glance.entries[3].gap, {
    status: "unavailable",
    reason: "Failed CI build",
  });
  // The readout's selected timing reads from the typed status alone.
  assert.equal(gapStatus(true, "The build did not pass").words, "Failed build");
  assert.deepEqual(gapStatus(undefined, "Failed build"), {
    status: "unavailable",
    words: "No timing · Failed build",
  });
});
